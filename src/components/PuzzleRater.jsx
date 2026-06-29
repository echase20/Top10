import { useState } from 'react'
import { getTodayStrET } from '../utils/gameLogic'

function loadRating() {
  try {
    const saved = localStorage.getItem(`top10_rating_${getTodayStrET()}`)
    return saved !== null ? Number(saved) : null
  } catch { return null }
}

function saveRating(value) {
  try {
    localStorage.setItem(`top10_rating_${getTodayStrET()}`, String(value))
  } catch {}
}

export default function PuzzleRater() {
  const [rating, setRating] = useState(loadRating)
  const [pending, setPending] = useState(rating ?? 3)
  const [submitted, setSubmitted] = useState(rating !== null)

  const handleSubmit = () => {
    saveRating(pending)
    setRating(pending)
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="puzzle-rater">
        <p className="rater-thanks">Thanks! You rated this puzzle <strong>{rating} / 5</strong></p>
      </div>
    )
  }

  return (
    <div className="puzzle-rater">
      <p className="rater-label">Rate today's puzzle</p>
      <div className="rater-slider-row">
        <span className="rater-bound">1</span>
        <input
          type="range"
          className="rater-slider"
          min={1}
          max={5}
          step={0.5}
          value={pending}
          onChange={e => setPending(Number(e.target.value))}
        />
        <span className="rater-bound">5</span>
      </div>
      <p className="rater-value">{pending} / 5</p>
      <button className="rater-submit" onClick={handleSubmit}>
        Submit Rating
      </button>
    </div>
  )
}
