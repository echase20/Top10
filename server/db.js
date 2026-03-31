import Database from 'better-sqlite3'
import { fileURLToPath } from 'url'
import path from 'path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// In production, DB_PATH is set to a persistent volume (e.g. /data/database.sqlite)
// In dev, it falls back to server/database.sqlite
const dbPath = process.env.DB_PATH || path.join(__dirname, 'database.sqlite')
const db = new Database(dbPath)

db.pragma('journal_mode = WAL')

db.exec(`
  CREATE TABLE IF NOT EXISTS opinion_responses (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    puzzle_id     INTEGER  NOT NULL,
    session_id    TEXT     NOT NULL,
    ranking       TEXT     NOT NULL,
    submitted_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(puzzle_id, session_id)
  )
`)

export default db
