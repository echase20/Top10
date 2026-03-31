export default function Header({ onShowStats, streak }) {
  return (
    <header className="header">
      <div className="header-content">
        <div className="header-left">
          {streak > 0 && <span className="streak-badge">🔥 {streak}</span>}
        </div>
        <h1 className="header-title">TOP 10</h1>
        <div className="header-right">
          <button className="icon-button" onClick={onShowStats} title="Statistics">
            📊
          </button>
        </div>
      </div>
    </header>
  )
}
