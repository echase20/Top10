import { useRef, useEffect, useState } from 'react'
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

  const isPlaying = gameStatus === 'playing'
  const canInteract = isPlaying && !inFeedbackMode
  const gameOver = gameStatus === 'won' || gameStatus === 'lost'

  // Show result view after a short delay so the player sees the final feedback colors first
  const [showResult, setShowResult] = useState(() => gameOver)
  useEffect(() => {
    if (gameOver) {
      const t = setTimeout(() => setShowResult(true), 1000)
      return () => clearTimeout(t)
    }
    if (gameStatus === 'playing') setShowResult(false)
  }, [gameStatus, gameOver])

  // ── Touch drag tracking (for haptic + ghost + hints) ─────────────────────
  const boardRef = useRef(null)
  const ghostRef = useRef(null)
  const touchDragRef = useRef(null)
  const [touchActiveItem, setTouchActiveItem] = useState(null)

  const canInteractRef = useRef(canInteract)
  const lockedSlotsRef = useRef(lockedSlots)
  const handleDropRef = useRef(handleDrop)
  const setTouchActiveItemRef = useRef(setTouchActiveItem)
  canInteractRef.current = canInteract
  lockedSlotsRef.current = lockedSlots
  handleDropRef.current = handleDrop
  setTouchActiveItemRef.current = setTouchActiveItem

  useEffect(() => {
    const board = boardRef.current
    if (!board) return

    const getSlotIndex = el => {
      const slotEl = el?.closest?.('[data-slot-index]')
      return slotEl ? parseInt(slotEl.dataset.slotIndex, 10) : -1
    }

    const moveGhost = (x, y) => {
      const g = ghostRef.current
      if (!g) return
      g.style.left = `${x}px`
      g.style.top = `${y - 44}px`
    }

    const hideGhost = () => {
      if (ghostRef.current) ghostRef.current.style.display = 'none'
    }

    const onTouchMove = e => {
      if (!touchDragRef.current || !canInteractRef.current) return
      e.preventDefault()
      const touch = e.touches[0]
      moveGhost(touch.clientX, touch.clientY)
      const target = document.elementFromPoint(touch.clientX, touch.clientY)
      const slotIndex = getSlotIndex(target)
      if (slotIndex !== -1 && slotIndex !== touchDragRef.current.lastSlotIndex) {
        touchDragRef.current.lastSlotIndex = slotIndex
        navigator.vibrate?.(12)
      }
    }

    const onTouchEnd = e => {
      const drag = touchDragRef.current
      touchDragRef.current = null
      hideGhost()
      setTouchActiveItemRef.current(null)
      if (!drag || !canInteractRef.current) return
      const touch = e.changedTouches[0]
      const target = document.elementFromPoint(touch.clientX, touch.clientY)
      const slotIndex = getSlotIndex(target)
      if (slotIndex !== -1 && !lockedSlotsRef.current[slotIndex]) {
        handleDropRef.current('right', slotIndex, {
          source: drag.source,
          index: drag.fromIndex,
          itemId: drag.item.id,
        })
      }
    }

    const onTouchCancel = () => {
      touchDragRef.current = null
      hideGhost()
      setTouchActiveItemRef.current(null)
    }

    board.addEventListener('touchmove', onTouchMove, { passive: false })
    board.addEventListener('touchend', onTouchEnd)
    board.addEventListener('touchcancel', onTouchCancel)
    return () => {
      board.removeEventListener('touchmove', onTouchMove)
      board.removeEventListener('touchend', onTouchEnd)
      board.removeEventListener('touchcancel', onTouchCancel)
    }
  }, [])

  const startTouchDrag = (item, source, index) => e => {
    if (!canInteract) return
    const touch = e.touches[0]
    touchDragRef.current = { item, source, fromIndex: index, lastSlotIndex: -1 }
    setTouchActiveItem(item)
    const g = ghostRef.current
    if (g) {
      g.textContent = item.name
      g.style.display = 'flex'
      g.style.left = `${touch.clientX}px`
      g.style.top = `${touch.clientY - 44}px`
    }
  }
  // ─────────────────────────────────────────────────────────────────────────

  // Show placement hints for the active item (selected OR being touch-dragged),
  // regardless of whether it's coming from the left or right column
  const activeItem = selectedItem?.item ?? touchActiveItem
  const placementHints = (() => {
    if (!activeItem || attempts.length === 0) return {}
    const hints = {}
    for (const attempt of attempts) {
      const slotIndex = attempt.items.findIndex(i => i && i.id === activeItem.id)
      if (slotIndex === -1) continue
      const feedback = attempt.feedback[slotIndex]
      if (feedback === 'correct') continue
      hints[slotIndex] = feedback
    }
    return hints
  })()

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
    try { return JSON.parse(e.dataTransfer.getData('application/json')) } catch { return null }
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

  // Items to display in the result view
  const resultItems = gameStatus === 'won'
    ? rightItems.filter(Boolean)
    : correctAnswer ?? []

  return (
    <div className="game-board-container" ref={boardRef}>
      <div ref={ghostRef} className="drag-ghost" />

      {/* Two-column board — hidden once result slides in */}
      <div className={`columns-wrapper${showResult ? ' result-hidden' : ''}`}>
        {/* Left column */}
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
                onTouchStart={startTouchDrag(item, 'left', leftItems.indexOf(item))}
              />
            ))}
            {leftItems.length === 0 && (
              <div className="empty-source">All items placed →</div>
            )}
          </div>
        </div>

        {/* Right column */}
        <div className="column target-column">
          <div className="column-header">
            <span>Your Ranking</span>
            <span className="attempt-dots">
              {Array.from({ length: MAX_ATTEMPTS }, (_, i) => (
                <span key={i} className={`attempt-dot ${i < attempts.length ? 'used' : ''}`} />
              ))}
            </span>
          </div>
          <div className="target-slots">
            {rightItems.map((item, index) => {
              const fb = lastFeedback ? lastFeedback[index] : null
              const isLocked = lockedSlots[index]
              const isSlotSelected =
                !inFeedbackMode && !isLocked &&
                selectedItem?.source === 'right' && selectedItem?.index === index
              const hasSelection = canInteract && !!selectedItem
              const isHintSlot = canInteract && placementHints[index] !== undefined

              return (
                <div
                  key={index}
                  data-slot-index={index}
                  className={[
                    'slot',
                    item ? 'slot-filled' : 'slot-empty',
                    isLocked ? 'slot-locked' : '',
                    isSlotSelected ? 'slot-selected' : '',
                    !isLocked && hasSelection && !item ? 'slot-droppable' : '',
                    fb ? `feedback-${fb}` : '',
                    isHintSlot ? `slot-hint-${placementHints[index]}` : '',
                  ].filter(Boolean).join(' ')}
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
                      onTouchStart={!isLocked ? startTouchDrag(item, 'right', index) : undefined}
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

      {/* Result view — slides in after game ends */}
      {showResult && (
        <div className="result-view">
          <p className="result-label">
            {gameStatus === 'won' ? '🎉 You got it!' : 'Correct Ranking'}
          </p>
          {resultItems.map((item, i) => (
            <div
              key={item.id}
              className={`result-item ${gameStatus === 'won' ? 'result-correct' : 'result-answer'}`}
              style={{ animationDelay: `${i * 0.07}s` }}
            >
              <span className="result-rank">{i + 1}</span>
              <span className="result-name">{item.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
