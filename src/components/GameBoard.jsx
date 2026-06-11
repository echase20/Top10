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

  const displayItems = gameStatus === 'lost' && correctAnswer ? correctAnswer : rightItems
  const rightHeader = gameStatus === 'won' ? 'You got it! ✓' : gameStatus === 'lost' ? 'Correct Ranking' : 'Your Ranking'

  // ── Post-game fly animation ───────────────────────────────────────────────
  // Initialize as 'done' if game was already over on mount (loaded from localStorage)
  const [animPhase, setAnimPhase] = useState(() =>
    gameStatus === 'won' || gameStatus === 'lost' ? 'done' : 'idle'
  )
  const [flyItems, setFlyItems] = useState([])
  const slotRefs = useRef(Array(10).fill(null))
  const flyEls = useRef([])

  useEffect(() => {
    if (gameStatus === 'playing') {
      setAnimPhase('idle')
      setFlyItems([])
    }
  }, [gameStatus])

  useEffect(() => {
    // Only trigger when game just ended (idle → animating transition)
    if (!gameOver || animPhase !== 'idle') return

    // Snapshot slot positions BEFORE left column hides
    const beforeRects = slotRefs.current.map(el => el?.getBoundingClientRect())

    // Hiding left column happens on next render (animPhase change drives the class)
    setAnimPhase('animating')

    // Two rAFs to let layout settle after left column disappears
    requestAnimationFrame(() => requestAnimationFrame(() => {
      const afterRects = slotRefs.current.map(el => el?.getBoundingClientRect())
      const vpCenter = window.innerWidth / 2
      const itemsToAnimate = correctAnswer || rightItems

      const items = itemsToAnimate.map((item, ci) => {
        // Find where the user placed this item
        const si = rightItems.findIndex(r => r?.id === item.id)
        const start = beforeRects[si >= 0 ? si : ci]
        const target = afterRects[ci]
        if (!start || !target) return null

        const tx = vpCenter - start.width / 2
        const ty = target.top

        return {
          item,
          tx,
          ty,
          width: start.width,
          height: start.height,
          // Offset from target to start — animation goes from this offset to 0
          dx: start.left - tx,
          dy: start.top - ty,
          idx: ci,
          // Use the actual feedback color from the user's last attempt for this slot
          feedback: (lastFeedback && si >= 0 ? lastFeedback[si] : null) || 'correct',
        }
      }).filter(Boolean)

      setFlyItems(items)

      // One more rAF to let React render the flying elements before animating
      requestAnimationFrame(() => {
        items.forEach((data, i) => {
          const el = flyEls.current[i]
          if (!el) return
          // fill: 'both' means the first keyframe is applied immediately (during delay),
          // so all clones appear at their start positions before their turn to fly
          el.animate(
            [
              { transform: `translate(${data.dx}px, ${data.dy}px)`, opacity: 1 },
              { transform: 'translate(0, 0)', opacity: 1 },
            ],
            { duration: 500, delay: i * 500, easing: 'ease-out', fill: 'both' }
          )
        })

        // Switch to done — keep flyItems alive so clones remain as the final display
        setTimeout(() => setAnimPhase('done'), items.length * 500 + 200)
      })
    }))
  }, [gameOver, animPhase])

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

  const handleDragStart = (e, item, source, index) => {
    e.dataTransfer.setData('application/json', JSON.stringify({ source, index, itemId: item.id }))
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

  const leftGone = animPhase !== 'idle'

  return (
    <div className="game-board-container" ref={boardRef}>
      <div ref={ghostRef} className="drag-ghost" />

      {/* Fixed-position flying clones — rendered during animation */}
      {flyItems.map((data, i) => (
        <div
          key={data.item.id}
          ref={el => { flyEls.current[i] = el }}
          className={`slot slot-filled feedback-${data.feedback} fly-clone`}
          style={{
            position: 'fixed',
            left: data.tx,
            top: data.ty,
            width: data.width,
            height: data.height,
            transform: `translate(${data.dx}px, ${data.dy}px)`,
          }}
        >
          <span className="slot-number">{data.idx + 1}</span>
          <div className="slot-item-content">{data.item.name}</div>
        </div>
      ))}

      <div className={`columns-wrapper${leftGone ? ' left-gone' : ''}`}>
        {/* Left column — hidden instantly when animation starts */}
        <div
          className={`column source-column${inFeedbackMode ? ' column-locked' : ''}${leftGone ? ' column-gone' : ''}`}
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
        <div className={`column target-column${gameOver ? ' column-result' : ''}`}>
          <div className="column-header">
            <span>{rightHeader}</span>
            <span className="attempt-dots">
              {Array.from({ length: MAX_ATTEMPTS }, (_, i) => (
                <span key={i} className={`attempt-dot ${i < attempts.length ? 'used' : ''}`} />
              ))}
            </span>
          </div>
          <div className="target-slots">
            {Array.from({ length: 10 }, (_, index) => {
              const displayItem = gameOver ? displayItems[index] : rightItems[index]
              const fb = gameOver ? 'correct' : (lastFeedback ? lastFeedback[index] : null)
              const isLocked = lockedSlots[index]
              const isSlotSelected =
                !inFeedbackMode && !isLocked &&
                selectedItem?.source === 'right' && selectedItem?.index === index
              const hasSelection = canInteract && !!selectedItem
              const isHintSlot = canInteract && placementHints[index] !== undefined

              return (
                <div
                  key={index}
                  ref={el => { slotRefs.current[index] = el }}
                  data-slot-index={index}
                  className={[
                    'slot',
                    displayItem ? 'slot-filled' : 'slot-empty',
                    isLocked && !gameOver && 'slot-locked',
                    isSlotSelected && 'slot-selected',
                    !isLocked && hasSelection && !displayItem && 'slot-droppable',
                    fb && `feedback-${fb}`,
                    isHintSlot && `slot-hint-${placementHints[index]}`,
                  ].filter(Boolean).join(' ')}
                  style={animPhase === 'animating' || flyItems.length > 0 ? { opacity: 0 } : undefined}
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
  )
}
