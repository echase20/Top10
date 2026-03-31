import Database from 'better-sqlite3'
import { fileURLToPath } from 'url'
import { mkdirSync } from 'fs'
import path from 'path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const dbPath = process.env.DB_PATH || path.join(__dirname, 'database.sqlite')
mkdirSync(path.dirname(dbPath), { recursive: true })
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
