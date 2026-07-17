import { useState } from 'react'

export default function FeedbackForm({ onClose }) {
  const [message, setMessage] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [status, setStatus] = useState('idle') // idle | submitting | done | error

  const handleSubmit = async e => {
    e.preventDefault()
    if (!message.trim()) return
    setStatus('submitting')
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: message.trim(), contactEmail: contactEmail.trim() }),
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
          <h2 className="welcome-title">Feedback or Report a Problem</h2>

          {status === 'done' ? (
            <p className="form-thanks">Thanks — your message has been sent!</p>
          ) : (
            <form className="menu-form" onSubmit={handleSubmit}>
              <label className="form-label" htmlFor="feedback-message">
                What's on your mind?
              </label>
              <textarea
                id="feedback-message"
                className="form-textarea"
                rows={5}
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="Describe the issue or share your feedback..."
                required
              />

              <label className="form-label" htmlFor="feedback-email">
                Email (optional, if you'd like a reply)
              </label>
              <input
                id="feedback-email"
                type="email"
                className="form-input"
                value={contactEmail}
                onChange={e => setContactEmail(e.target.value)}
                placeholder="you@example.com"
              />

              {status === 'error' && (
                <p className="form-error">Something went wrong — please try again.</p>
              )}

              <button
                type="submit"
                className="submit-btn ready"
                disabled={status === 'submitting'}
              >
                {status === 'submitting' ? 'Sending…' : 'Send'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
