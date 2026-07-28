import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { fileURLToPath } from 'url'
import path from 'path'
import { Resend } from 'resend'
import db from './db.js'

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const app = express()
const PORT = process.env.PORT || 3001
const IS_PROD = process.env.NODE_ENV === 'production'

// Returns current datetime as a string in ET (e.g. "2026-03-31 23:59:59")
function getNowET() {
  return new Date().toLocaleString('sv-SE', { timeZone: 'America/New_York' })
}

if (!IS_PROD) {
  app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173' }))
}
app.use(express.json())

// ---------------------------------------------------------------------------
// POST /api/opinion
// ---------------------------------------------------------------------------
app.post('/api/opinion', (req, res) => {
  const { puzzleId, sessionId, ranking } = req.body

  if (
    typeof puzzleId !== 'number' ||
    typeof sessionId !== 'string' ||
    !sessionId.trim() ||
    !Array.isArray(ranking) ||
    ranking.length !== 10 ||
    ranking.some(id => typeof id !== 'number')
  ) {
    return res.status(400).json({ error: 'Invalid request body' })
  }

  try {
    db.prepare(
      'INSERT INTO opinion_responses (puzzle_id, session_id, ranking, submitted_at) VALUES (?, ?, ?, ?)',
    ).run(puzzleId, sessionId.trim(), JSON.stringify(ranking), getNowET())

    // Force WAL checkpoint so the row is immediately visible on disk
    db.pragma('wal_checkpoint(FULL)')

    console.log(`[opinion] recorded puzzle=${puzzleId} session=${sessionId.trim().slice(0, 8)}…`)
    return res.json({ success: true })
  } catch (err) {
    if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.json({ success: true, alreadySubmitted: true })
    }
    console.error('DB error on POST /api/opinion:', err)
    return res.status(500).json({ error: 'Server error' })
  }
})

// ---------------------------------------------------------------------------
// GET /api/opinion/aggregate/:puzzleId
// Returns items sorted by average community rank (ascending)
// ---------------------------------------------------------------------------
app.get('/api/opinion/aggregate/:puzzleId', (req, res) => {
  const puzzleId = Number(req.params.puzzleId)
  if (!Number.isInteger(puzzleId)) {
    return res.status(400).json({ error: 'Invalid puzzleId' })
  }

  const rows = db.prepare('SELECT ranking FROM opinion_responses WHERE puzzle_id = ?').all(puzzleId)
  if (rows.length === 0) {
    return res.json({ hasData: false, rankedIds: [] })
  }

  const positionSums = {}
  const positionCounts = {}

  for (const row of rows) {
    const ranking = JSON.parse(row.ranking) // array of item ids, index 0 = rank 1
    ranking.forEach((itemId, index) => {
      if (positionSums[itemId] === undefined) {
        positionSums[itemId] = 0
        positionCounts[itemId] = 0
      }
      positionSums[itemId] += index + 1
      positionCounts[itemId]++
    })
  }

  const averages = Object.keys(positionSums).map(id => ({
    id: Number(id),
    avg: positionSums[id] / positionCounts[id],
  }))
  averages.sort((a, b) => a.avg - b.avg)

  return res.json({ hasData: true, rankedIds: averages.map(x => x.id) })
})

// ---------------------------------------------------------------------------
// POST /api/rating
// ---------------------------------------------------------------------------
app.post('/api/rating', (req, res) => {
  const { puzzleId, sessionId, rating } = req.body

  if (
    typeof puzzleId !== 'number' ||
    typeof sessionId !== 'string' ||
    !sessionId.trim() ||
    typeof rating !== 'number' ||
    rating < 1 ||
    rating > 5
  ) {
    return res.status(400).json({ error: 'Invalid request body' })
  }

  try {
    db.prepare(
      'INSERT INTO puzzle_ratings (puzzle_id, session_id, rating, submitted_at) VALUES (?, ?, ?, ?)',
    ).run(puzzleId, sessionId.trim(), rating, getNowET())

    db.pragma('wal_checkpoint(FULL)')

    console.log(`[rating] recorded puzzle=${puzzleId} session=${sessionId.trim().slice(0, 8)}… rating=${rating}`)
    return res.json({ success: true })
  } catch (err) {
    if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.json({ success: true, alreadySubmitted: true })
    }
    console.error('DB error on POST /api/rating:', err)
    return res.status(500).json({ error: 'Server error' })
  }
})

// ---------------------------------------------------------------------------
// POST /api/feedback
// ---------------------------------------------------------------------------
app.post('/api/feedback', async (req, res) => {
  const { message, contactEmail } = req.body

  if (typeof message !== 'string' || !message.trim()) {
    return res.status(400).json({ error: 'Invalid request body' })
  }

  const trimmedMessage = message.trim()
  const trimmedEmail = typeof contactEmail === 'string' ? contactEmail.trim() : ''

  try {
    db.prepare(
      'INSERT INTO feedback (message, contact_email, submitted_at) VALUES (?, ?, ?)',
    ).run(trimmedMessage, trimmedEmail || null, getNowET())
    db.pragma('wal_checkpoint(FULL)')
  } catch (err) {
    console.error('DB error on POST /api/feedback:', err)
    return res.status(500).json({ error: 'Server error' })
  }

  if (resend && process.env.FEEDBACK_TO_EMAIL) {
    try {
      await resend.emails.send({
        from: 'Top10 Feedback <onboarding@resend.dev>',
        to: process.env.FEEDBACK_TO_EMAIL,
        subject: 'New Top10 Feedback',
        text: `${trimmedMessage}${trimmedEmail ? `\n\nReply to: ${trimmedEmail}` : ''}`,
      })
    } catch (err) {
      console.error('Resend error on POST /api/feedback:', err)
    }
  }

  return res.json({ success: true })
})

// ---------------------------------------------------------------------------
// POST /api/suggestions
// ---------------------------------------------------------------------------
app.post('/api/suggestions', (req, res) => {
  const { message } = req.body

  if (typeof message !== 'string' || !message.trim()) {
    return res.status(400).json({ error: 'Invalid request body' })
  }

  try {
    db.prepare(
      'INSERT INTO suggestions (message, submitted_at) VALUES (?, ?)',
    ).run(message.trim(), getNowET())
    db.pragma('wal_checkpoint(FULL)')
    return res.json({ success: true })
  } catch (err) {
    console.error('DB error on POST /api/suggestions:', err)
    return res.status(500).json({ error: 'Server error' })
  }
})

// ---------------------------------------------------------------------------
// Health check
// ---------------------------------------------------------------------------
app.get('/api/health', (_req, res) => res.json({ ok: true }))

// ---------------------------------------------------------------------------
// Dev: view all opinion responses
// Requires ?key=DEV_KEY query param to prevent public access
// ---------------------------------------------------------------------------
app.get('/api/dev/responses', (req, res) => {
  const devKey = process.env.DEV_KEY
  if (!devKey || req.query.key !== devKey) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  const rows = db.prepare('SELECT * FROM opinion_responses ORDER BY submitted_at DESC').all()
  res.json(rows)
})

// ---------------------------------------------------------------------------
// Dev: view all puzzle ratings
// Requires ?key=DEV_KEY query param to prevent public access
// ---------------------------------------------------------------------------
app.get('/api/dev/ratings', (req, res) => {
  const devKey = process.env.DEV_KEY
  if (!devKey || req.query.key !== devKey) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  const rows = db.prepare('SELECT * FROM puzzle_ratings ORDER BY submitted_at DESC').all()
  res.json(rows)
})

// ---------------------------------------------------------------------------
// Production: serve the built React app
// ---------------------------------------------------------------------------
if (IS_PROD) {
  const distPath = path.join(__dirname, 'dist')
  app.use(express.static(distPath))
  app.get('*', (_req, res) => res.sendFile(path.join(distPath, 'index.html')))
}

app.listen(PORT, () => {
  console.log(`Top10 server running on http://localhost:${PORT}`)
})
