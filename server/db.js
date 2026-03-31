const Database = require('better-sqlite3')
const path = require('path')

const db = new Database(path.join(__dirname, 'database.sqlite'))

// Enable WAL mode for better concurrent read performance
db.pragma('journal_mode = WAL')

db.exec(`
  CREATE TABLE IF NOT EXISTS opinion_responses (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    puzzle_id     INTEGER  NOT NULL,
    session_id    TEXT     NOT NULL,
    ranking       TEXT     NOT NULL,  -- JSON array of item IDs in ranked order (index 0 = rank 1)
    submitted_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(puzzle_id, session_id)     -- one response per session per puzzle
  )
`)

module.exports = db
