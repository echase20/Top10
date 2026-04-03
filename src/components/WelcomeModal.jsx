import { useState } from 'react'
import { getTodayStrET } from '../utils/gameLogic'

const STORAGE_KEY = 'top10_welcome_seen'

// Each point can be a plain string, or an object:
// { text: string, subpoints: string[] | { label, color, desc }[] }
const PAGES = [
  {
    title: 'Daily Top 10',
    points: [
      'Every day, a new topic and 10 corresponding answer choices are presented to you.',
      'Take these options and rank them however you see fit!',
    ],
  },
  {
    title: 'Community Top 10',
    points: [
      'In addition to the new Daily Top 10, the topic and 10 items from the preceding day are presented to you again.',
      'This time, place the 10 items in order based on how the overall community ranked them, using responses from the preceding day.',
      'You have 3 attempts to match the community rankings.',
      {
        text: 'After each attempt, you will receive feedback on each item:',
        subpoints: [
          { label: 'Green', color: 'correct', desc: 'Correct position' },
          { label: 'Yellow', color: 'close', desc: 'One spot away' },
          { label: 'Red', color: 'wrong', desc: 'Incorrect position' },
        ],
      },
      'When the game ends — whether you matched the list or ran out of attempts — a screen will pop up congratulating you or encouraging you to try again.',
      {
        text: 'Basic Stats shown at the end:',
        subpoints: [
          '# of attempts used',
          'Time taken to rank the Top 10',
          'Total games played',
          'Current streak',
          'Max streak',
        ],
      },
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
