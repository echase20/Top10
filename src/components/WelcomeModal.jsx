import { useState } from 'react'
import { getTodayStrET } from '../utils/gameLogic'

const STORAGE_KEY = 'top10_welcome_seen'

// Each point can be a plain string, or an object:
// { text: string, subpoints: string[] | { label, color, desc }[] }
const PAGES = [
  {
    title: 'Welcome to Top10',
    points: [
      'There are precisely 3,628,800 possible ways to orient a list of 10 items.',
      'Whether you\'re a first-timer or a seasoned veteran of Top10, these tips will help you understand how to play Top10!',
    ],
  },
  {
    title: 'Community Top10',
    points: [
      'The Community Top10 is simple: Guess the Community Top10 in 3 tries or fewer based on the Community Consensus rankings!',
    ],
  },
  {
    title: 'Reading Your Results',
    points: [
      {
        text: 'The color of the boxes will change to indicate how close your guess was to the correct placement:',
        subpoints: [
          { label: 'Green', color: 'correct', desc: 'If your guess is correct, the box will light up Green' },
          { label: 'Yellow', color: 'close', desc: 'If your guess is one spot away from the correct slot, the box will light up Yellow' },
          { label: 'Red', color: 'wrong', desc: 'If your guess is more than one spot away from the correct slot, the box will light up Red' },
        ],
      },
    ],
  },
  {
    title: 'Daily Top10',
    points: [
      'The Daily Top10 is even easier: Rank the Daily Top10 based on your own personal opinion!',
      'When you come back the next day, see how your opinion compares to the Community Consensus Ranking.',
    ],
  },
]

function hasSeenToday() {
  return localStorage.getItem(STORAGE_KEY) === getTodayStrET()
}

function markSeenToday() {
  localStorage.setItem(STORAGE_KEY, getTodayStrET())
}

function renderSubpoint(sub, i) {
  if (typeof sub === 'string') {
    return <li key={i} className="welcome-subpoint">{sub}</li>
  }
  return (
    <li key={i} className="welcome-subpoint welcome-feedback-row">
      <span className={`welcome-swatch feedback-${sub.color}`} />
      <span><strong>{sub.label}</strong> — {sub.desc}</span>
    </li>
  )
}

function renderPoint(point, i) {
  if (typeof point === 'string') {
    return <li key={i} className="welcome-point">{point}</li>
  }
  return (
    <li key={i} className="welcome-point">
      {point.text}
      <ul className="welcome-subpoints">
        {point.subpoints.map((sub, j) => renderSubpoint(sub, j))}
      </ul>
    </li>
  )
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
            {current.points.map((point, i) => renderPoint(point, i))}
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
