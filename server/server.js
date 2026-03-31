import express from 'express'
import cors from 'cors'
import { fileURLToPath } from 'url'
import path from 'path'
import db from './db.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const app = express()
const PORT = process.env.PORT || 3001
const IS_PROD = process.env.NODE_ENV === 'production'

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
      'INSERT INTO opinion_responses (puzzle_id, session_id, ranking) VALUES (?, ?, ?)',
    ).run(puzzleId, sessionId.trim(), JSON.stringify(ranking))

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
// Health check
// ---------------------------------------------------------------------------
app.get('/api/health', (_req, res) => res.json({ ok: true }))

// ---------------------------------------------------------------------------
// Production: serve the built React app
// ---------------------------------------------------------------------------
if (IS_PROD) {
  const distPath = path.join(__dirname, '..', 'dist')
  app.use(express.static(distPath))
  app.get('*', (_req, res) => res.sendFile(path.join(distPath, 'index.html')))
}

app.listen(PORT, () => {
  console.log(`Top10 server running on http://localhost:${PORT}`)
})
