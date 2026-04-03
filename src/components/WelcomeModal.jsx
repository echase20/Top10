import { useState } from 'react'
import { getTodayStrET } from '../utils/gameLogic'

const STORAGE_KEY = 'top10_welcome_seen'

const PAGES = [
  {
    title: 'Daily Top 10',
    points: [
      'Every day, a new topic and 10 corresponding answer choices are presented to you.',
      'Take these options and rank them 10 however you see fit!',
    ],
  },
  // More pages will be added here
]

function hasSeenToday() {
  return localStorage.getItem(STORAGE_KEY) === getTodayStrET()
}

function markSeenToday() {
  localStorage.setItem(STORAGE_KEY, getTodayStrET())
}

export default function WelcomeModal({ onClose }) {
  const [page, setPage] = useState(0)

  const handleClose = () => {
    markSeenToday()
    onClose()
  }

  const current = PAGES[page]
  const isFirst = page === 0
  const isLast = page === PAGES.length - 1

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal welcome-modal" onClick={e => e.stopPropagation()}>

        <button className="close-btn welcome-close" onClick={handleClose}>✕</button>

        <div className="welcome-page">
          <h2 className="welcome-title">{current.title}</h2>
          <ul className="welcome-points">
            {current.points.map((point, i) => (
              <li key={i}>{point}</li>
            ))}
          </ul>
        </div>

        <div className="welcome-nav">
          <button
            className="welcome-arrow"
            onClick={() => setPage(p => p - 1)}
            disabled={isFirst}
          >
            ←
          </button>

          <div className="welcome-dots">
            {PAGES.map((_, i) => (
              <button
                key={i}
                className={`welcome-dot ${i === page ? 'active' : ''}`}
                onClick={() => setPage(i)}
              />
            ))}
          </div>

          <button
            className="welcome-arrow"
            onClick={() => setPage(p => p + 1)}
            disabled={isLast}
          >
            →
          </button>
        </div>

      </div>
    </div>
  )
}

export { hasSeenToday }
