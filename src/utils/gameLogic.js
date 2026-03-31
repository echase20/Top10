// Returns today's date string in ET timezone (YYYY-MM-DD)
export function getTodayStrET() {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'America/New_York' })
}

export function shuffleArray(arr) {
  const shuffled = [...arr]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

export function getPuzzleIndex(dateStr) {
  const start = new Date('2026-03-16')
  const current = new Date(dateStr)
  const diffMs = current - start
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  return Math.max(0, diffDays)
}

// Returns an array of 'correct' | 'close' | 'wrong' for each slot
export function evaluateAttempt(rightItems, puzzle) {
  return rightItems.map((item, index) => {
    if (!item) return null
    const correctItem = puzzle.items.find(i => i.id === item.id)
    const diff = Math.abs(correctItem.correctRank - (index + 1))
    if (diff === 0) return 'correct'
    if (diff === 1) return 'close'
    return 'wrong'
  })
}

export function isWin(feedback) {
  return feedback.every(f => f === 'correct')
}
