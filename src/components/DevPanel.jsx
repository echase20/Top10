import { useState } from 'react'
import { puzzles } from '../data/puzzles'

export default function DevPanel({ game, opinion }) {
  const [open, setOpen] = useState(false)
  const { puzzle, attempts, gameStatus, lastFeedback, resetGame, resetStats } = game

  const resetAll = () => {
    resetGame()
    opinion.resetGame()
    resetStats()
  }

  // Jump to a specific puzzle by temporarily overriding today's date key
  const switchPuzzle = id => {
    const key = `top10_game_${id}`
    localStorage.removeItem(key)
    // Store the override so getTodayPuzzle picks it up after reload
    localStorage.setItem('top10_dev_puzzleId', String(id))
    window.location.reload()
  }

  return (
    <div className="dev-panel">
      <button className="dev-toggle" onClick={() => setOpen(o => !o)}>
        🛠 DEV {open ? '▲' : '▼'}
      </button>

      {open && (
        <div className="dev-body">
          <div className="dev-status">
            <span>Puzzle: <strong>#{puzzle.id} — {puzzle.category}</strong></span>
            <span>Status: <strong>{gameStatus}</strong></span>
            <span>Attempts: <strong>{attempts.length} / 5</strong></span>
            <span>Feedback: <strong>{lastFeedback ? 'showing' : 'hidden'}</strong></span>
          </div>

          <div className="dev-actions">
            <button className="dev-btn" onClick={resetGame}>
              ↺ Reset Ranking Game
            </button>
            <button className="dev-btn" onClick={opinion.resetGame}>
              ↺ Reset Opinion Game
            </button>
            <button className="dev-btn" onClick={resetStats}>
              ↺ Reset Stats
            </button>
            <button className="dev-btn dev-btn-danger" onClick={resetAll}>
              ✕ Reset Everything
            </button>
          </div>

          <div className="dev-puzzles">
            <span className="dev-label">Switch puzzle:</span>
            <div className="dev-puzzle-btns">
              {puzzles.map(p => (
                <button
                  key={p.id}
                  className={`dev-btn dev-btn-sm ${p.id === puzzle.id ? 'active' : ''}`}
                  onClick={() => switchPuzzle(p.id)}
                >
                  #{p.id} {p.category}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
