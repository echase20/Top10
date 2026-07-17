import { useState } from 'react'

export default function SuggestionsForm({ onClose }) {
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState('idle') // idle | submitting | done | error

  const handleSubmit = async e => {
    e.preventDefault()
    if (!message.trim()) return
    setStatus('submitting')
    try {
      const res = await fetch('/api/suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: message.trim() }),
      })
      if (!res.ok) throw new Error('Request failed')
      setStatus('done')
    } catch {
      setStatus('error')
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal welcome-modal" onClick={e => e.stopPropagation()}>
        <button className="close-btn welcome-close" onClick={onClose}>✕</button>

        <div className="welcome-page">
          <h2 className="welcome-title">Top10 Suggestions</h2>

          {status === 'done' ? (
            <p className="form-thanks">Thanks — we've got your suggestion!</p>
          ) : (
            <form className="menu-form" onSubmit={handleSubmit}>
              <label className="form-label" htmlFor="suggestion-message">
                Got an idea for a Top10 topic?
              </label>
              <textarea
                id="suggestion-message"
                className="form-textarea"
                rows={5}
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="e.g. Best Pizza Toppings, Greatest Movie Villains..."
                required
              />

              {status === 'error' && (
                <p className="form-error">Something went wrong — please try again.</p>
              )}

              <button
                type="submit"
                className="submit-btn ready"
                disabled={status === 'submitting'}
              >
                {status === 'submitting' ? 'Sending…' : 'Submit'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
