import ItemTile from './ItemTile'

const MAX_ATTEMPTS = 3

export default function GameBoard({ game }) {
  const {
    puzzle,
    leftItems,
    rightItems,
    selectedItem,
    handleSelectItem,
    handleSlotClick,
    handleDrop,
    handleSubmit,
    handleReset,
    isSubmittable,
    gameStatus,
    lastFeedback,
    inFeedbackMode,
    lockedSlots,
    attempts,
    attemptsRemaining,
    correctAnswer,
  } = game

  // When a left-column item is selected, show where it was placed last attempt
  const lastPlacementHint = (() => {
    if (!selectedItem || selectedItem.source !== 'left') return null
    if (attempts.length === 0) return null
    const lastAttempt = attempts[attempts.length - 1]
    const slotIndex = lastAttempt.items.findIndex(i => i && i.id === selectedItem.item.id)
    if (slotIndex === -1) return null
    const feedback = lastAttempt.feedback[slotIndex]
    if (feedback === 'correct') return null
    return { index: slotIndex, feedback }
  })()

  const isPlaying = gameStatus === 'playing'
  const canInteract = isPlaying && !inFeedbackMode

  const buildDragData = (item, source, index) =>
    JSON.stringify({ source, index, itemId: item.id })

  const handleDragStart = (e, item, source, index) => {
    e.dataTransfer.setData('application/json', buildDragData(item, source, index))
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = e => {
    if (!canInteract) return
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const parseDrop = e => {
    try {
      return JSON.parse(e.dataTransfer.getData('application/json'))
    } catch {
      return null
    }
  }

  const handleDropOnRight = (e, targetIndex) => {
    e.preventDefault()
    if (!canInteract) return
    const data = parseDrop(e)
    if (data) handleDrop('right', targetIndex, data)
  }

  const handleDropOnLeft = e => {
    e.preventDefault()
    if (!canInteract) return
    const data = parseDrop(e)
    if (data && data.source === 'right') handleDrop('left', null, data)
  }

  return (
    <div className="game-board-container">
      <div className="columns-wrapper">
        {/* Left column – source items */}
        <div
          className={`column source-column ${inFeedbackMode ? 'column-locked' : ''}`}
          onDragOver={handleDragOver}
          onDrop={handleDropOnLeft}
        >
          <div className="column-header">
            <span>Items</span>
            <span className="column-count">{leftItems.length} left</span>
          </div>
          <div className="source-items">
            {leftItems.map(item => (
              <ItemTile
                key={item.id}
                item={item}
                isSelected={selectedItem?.source === 'left' && selectedItem?.item.id === item.id}
                isDraggable={canInteract}
                onClick={() => canInteract && handleSelectItem(item, 'left', leftItems.indexOf(item))}
                onDragStart={e => handleDragStart(e, item, 'left', leftItems.indexOf(item))}
              />
            ))}
            {leftItems.length === 0 && (
              <div className="empty-source">All items placed →</div>
            )}
          </div>
        </div>

        {/* Right column – ranked slots */}
        <div className="column target-column">
          <div className="column-header">
            <span>Your Ranking</span>
            <span className="attempt-dots">
              {Array.from({ length: MAX_ATTEMPTS }, (_, i) => (
                <span
                  key={i}
                  className={`attempt-dot ${i < attempts.length ? 'used' : ''}`}
                />
              ))}
            </span>
          </div>
          <div className="target-slots">
            {rightItems.map((item, index) => {
              const fb = lastFeedback ? lastFeedback[index] : null
              const isLocked = lockedSlots[index]
              const isSlotSelected =
                !inFeedbackMode && !isLocked && selectedItem?.source === 'right' && selectedItem?.index === index
              const hasSelection = canInteract && !!selectedItem
              const isHintSlot = canInteract && lastPlacementHint?.index === index

              return (
                <div
                  key={index}
                  className={[
                    'slot',
                    item ? 'slot-filled' : 'slot-empty',
                    isLocked ? 'slot-locked' : '',
                    isSlotSelected ? 'slot-selected' : '',
                    !isLocked && hasSelection && !item ? 'slot-droppable' : '',
                    fb ? `feedback-${fb}` : '',
                    isHintSlot ? `slot-hint-${lastPlacementHint.feedback}` : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  onDragOver={handleDragOver}
                  onDrop={e => !isLocked && handleDropOnRight(e, index)}
                  onClick={() => !isLocked && canInteract && handleSlotClick(index)}
                >
                  <span className="slot-number">{index + 1}</span>
                  {item ? (
                    <div
                      className={`slot-item-content ${isSlotSelected ? 'selected' : ''}`}
                      draggable={canInteract && !isLocked}
                      onDragStart={e => !isLocked && handleDragStart(e, item, 'right', index)}
                    >
                      {item.name}
                    </div>
                  ) : (
                    <span className="slot-placeholder">
                      {hasSelection ? 'Click to place' : 'Empty'}
                    </span>
                  )}
                </div>
              )
            })}
          </div>

          {/* Submit / Reset / done buttons */}
          {isPlaying && !inFeedbackMode && (
            <button
              className={`submit-btn ${isSubmittable ? 'ready' : 'disabled'}`}
              onClick={handleSubmit}
              disabled={!isSubmittable}
            >
              Submit Ranking
            </button>
          )}
          {isPlaying && inFeedbackMode && (
            <button className="reset-btn" onClick={handleReset}>
              ↩ Reset & Try Again
            </button>
          )}
        </div>
      </div>

      {/* Correct answer revealed after a loss */}
      {correctAnswer && (
        <div className="correct-answer">
          <h3>Correct Ranking</h3>
          <ol className="correct-list">
            {correctAnswer.map((item, i) => (
              <li key={item.id}>
                <span className="rank-num">{i + 1}.</span>
                {item.name}
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  )
}
