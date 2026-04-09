import express from 'express'
import cors from 'cors'
import { fileURLToPath } from 'url'
import path from 'path'
import db from './db.js'

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
