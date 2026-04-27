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
    correctAnswer,
  } = game

  const isPlaying = gameStatus === 'playing'
  const canInteract = isPlaying && !inFeedbackMode
  const gameOver = gameStatus === 'won' || gameStatus === 'lost'

  // ── Overlay: fixed-position clone of right column that slides to center ───
  const targetColRef = useRef(null)
  const overlayTriggeredRef = useRef(false)
  const [overlay, setOverlay] = useState(null) // null | { rect, phase: 'start'|'center' }

  useEffect(() => {
    if (!gameOver) {
      overlayTriggeredRef.current = false
      setOverlay(null)
      return
    }
    if (overlayTriggeredRef.current) return
    overlayTriggeredRef.current = true

    const rect = targetColRef.current?.getBoundingClientRect()
    if (!rect) return

    // Place clone exactly over the right column, then slide to center next frame
    setOverlay({ rect: { top: rect.top, left: rect.left, width: rect.width }, phase: 'start' })
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setOverlay(prev => prev ? { ...prev, phase: 'center' } : prev)
      })
    })
  }, [gameOver])

  const overlayItems = gameStatus === 'won'
    ? rightItems
    : (correctAnswer ?? rightItems)
  const overlayHeader = gameStatus === 'won' ? 'You got it! ✓' : 'Correct Ranking'

  // ── Desktop drag tracking (for placement hints) ───────────────────────────
  const [desktopDragItem, setDesktopDragItem] = useState(null)

  // ── Touch drag with ghost and haptic feedback ─────────────────────────────
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

  // Placement hints for any active item
  const activeItem = selectedItem?.item ?? touchActiveItem ?? desktopDragItem
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
    setDesktopDragItem(item)
  }

  const handleDragEnd = () => setDesktopDragItem(null)

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

  return (
    <>
      <div className={`game-board-container ${overlay ? 'board-hidden' : ''}`} ref={boardRef}>
        <div ref={ghostRef} className="drag-ghost" />

        <div className="columns-wrapper">
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
                  onDragEnd={handleDragEnd}
                  onTouchStart={startTouchDrag(item, 'left', leftItems.indexOf(item))}
                />
              ))}
              {leftItems.length === 0 && (
                <div className="empty-source">All items placed →</div>
              )}
            </div>
          </div>

          {/* Right column */}
          <div className="column target-column" ref={targetColRef}>
            <div className="column-header">
              <span>Your Ranking</span>
              <span className="attempt-dots">
                {Array.from({ length: MAX_ATTEMPTS }, (_, i) => (
                  <span key={i} className={`attempt-dot ${i < attempts.length ? 'used' : ''}`} />
                ))}
              </span>
            </div>
            <div className="target-slots">
              {Array.from({ length: 10 }, (_, index) => {
                const displayItem = rightItems[index]
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
                      displayItem ? 'slot-filled' : 'slot-empty',
                      isLocked && 'slot-locked',
                      isSlotSelected && 'slot-selected',
                      !isLocked && hasSelection && !displayItem && 'slot-droppable',
                      fb && `feedback-${fb}`,
                      isHintSlot && `slot-hint-${placementHints[index]}`,
                    ].filter(Boolean).join(' ')}
                    onDragOver={handleDragOver}
                    onDrop={e => !isLocked && handleDropOnRight(e, index)}
                    onClick={() => !isLocked && canInteract && handleSlotClick(index)}
                  >
                    <span className="slot-number">{index + 1}</span>
                    {displayItem ? (
                      <div
                        className={`slot-item-content ${isSlotSelected ? 'selected' : ''}`}
                        draggable={canInteract && !isLocked}
                        onDragStart={e => !isLocked && handleDragStart(e, displayItem, 'right', index)}
                        onDragEnd={handleDragEnd}
                        onTouchStart={!isLocked ? startTouchDrag(displayItem, 'right', index) : undefined}
                      >
                        {displayItem.name}
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
      </div>

      {/* Fixed-position clone that slides from the right column to center */}
      {overlay && (
        <div
          className={`result-overlay ${overlay.phase === 'center' ? 'result-overlay--center' : ''}`}
          style={{
            top: overlay.rect.top,
            left: overlay.phase === 'center' ? undefined : overlay.rect.left,
            width: overlay.rect.width,
          }}
        >
          <div className="column-header">
            <span>{overlayHeader}</span>
          </div>
          <div className="target-slots">
            {overlayItems.map((item, index) => (
              <div
                key={index}
                className="slot slot-filled feedback-correct"
                style={{
                  animation: 'resultSettle 0.5s ease-out both',
                  animationDelay: `${1.9 + index * 0.1}s`,
                }}
              >
                <span className="slot-number">{index + 1}</span>
                <div className="slot-item-content">{item?.name}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  )
}
