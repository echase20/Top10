export default function StatsModal({ stats, onClose, gameStatus, onContinue }) {
  const winPct =
    stats.gamesPlayed > 0 ? Math.round((stats.gamesWon / stats.gamesPlayed) * 100) : 0

  const maxDist = Math.max(...stats.guessDistribution, 1)

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Statistics</h2>
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="guess-dist">
          <h3>Guess Distribution</h3>
          {stats.guessDistribution.map((count, i) => (
            <div key={i} className="dist-row">
              <span className="dist-label">{i + 1}</span>
              <div className="dist-bar-container">
                <div
                  className={`dist-bar ${gameStatus === 'won' && count > 0 ? 'active' : ''}`}
                  style={{ width: `${Math.max((count / maxDist) * 100, count > 0 ? 8 : 0)}%` }}
                >
                  {count > 0 && <span>{count}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="stats-grid">
          <div className="stat-item">
            <span className="stat-number">{stats.gamesPlayed}</span>
            <span className="stat-label">Played</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{winPct}%</span>
            <span className="stat-label">Win %</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{stats.currentStreak}</span>
            <span className="stat-label">Current Streak</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{stats.maxStreak}</span>
            <span className="stat-label">Max Streak</span>
          </div>
        {onContinue && (
          <button className="continue-btn" onClick={onContinue}>
            Continue to Opinion Game →
          </button>
        )}
      </div>
    </div>
  )
}
