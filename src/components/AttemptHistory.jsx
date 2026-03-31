const FB_COLOR = {
  correct: '#538d4e',
  close: '#b59f3b',
  wrong: '#9b2226',
}

const FB_SYMBOL = {
  correct: '✓',
  close: '~',
  wrong: '✗',
}

export default function AttemptHistory({ attempts }) {
  return (
    <div className="attempt-history">
      <h3 className="history-title">Previous Attempts</h3>
      <div className="history-rows">
        {attempts.map((attempt, attemptIdx) => (
          <div key={attemptIdx} className="history-row">
            <span className="history-label">#{attemptIdx + 1}</span>
            <div className="history-tiles">
              {attempt.feedback.map((fb, i) => (
                <div
                  key={i}
                  className="history-tile"
                  style={{ backgroundColor: FB_COLOR[fb] }}
                  title={`${i + 1}. ${attempt.items[i]?.name} — ${fb}`}
                >
                  {FB_SYMBOL[fb]}
                </div>
              ))}
            </div>
            <span className="history-score">
              {attempt.feedback.filter(f => f === 'correct').length}/10
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
