const MENU_ITEMS = [
  { key: 'howToPlay', label: 'How to Play' },
  { key: 'feedback', label: 'Feedback or Report a Problem' },
  { key: 'questions', label: 'Questions' },
  { key: 'suggestions', label: 'Top10 Suggestions' },
]

export default function MenuPanel({ onClose, onSelect }) {
  return (
    <div className="menu-overlay" onClick={onClose}>
      <div className="menu-panel" onClick={e => e.stopPropagation()}>
        <div className="menu-panel-header">
          <span className="menu-panel-title">Menu</span>
          <button className="close-btn" onClick={onClose} aria-label="Close menu">✕</button>
        </div>

        <nav className="menu-items">
          {MENU_ITEMS.map(item => (
            <button
              key={item.key}
              className="menu-item"
              onClick={() => onSelect(item.key)}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </div>
    </div>
  )
}
