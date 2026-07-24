import { useState, useRef, useEffect } from 'react'
import ItemTile from './ItemTile'

export default function OpinionBoard({ game }) {
  const {
    leftItems,
    rightItems,
    selectedItem,
    handleSelectItem,
    handleSlotClick,
    handleDrop,
    handleSubmit,
    returnToLeft,
    isSubmittable,
    gameStatus,
  } = game

  const isPlaying = gameStatus === 'playing'
  const submitted = gameStatus === 'submitted'

  // ── Post-submit fly animation ─────────────────────────────────────────────
  const [animPhase, setAnimPhase] = useState(() => submitted ? 'done' : 'idle')
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
    if (!submitted || animPhase !== 'idle') return

    const beforeRects = slotRefs.current.map(el => el?.getBoundingClientRect())

    setAnimPhase('animating')

    requestAnimationFrame(() => requestAnimationFrame(() => {
      const afterRects = slotRefs.current.map(el => el?.getBoundingClientRect())
      const vpCenter = window.innerWidth / 2

      const items = rightItems.map((item, ci) => {
        const start = beforeRects[ci]
        const target = afterRects[ci]
        if (!start || !target || !item) return null

        const tx = vpCenter - start.width / 2
        const ty = target.top

        return {
          item,
          tx,
          ty,
          width: start.width,
          height: start.height,
          dx: start.left - tx,
          dy: start.top - ty,
          idx: ci,
        }
      }).filter(Boolean)

      setFlyItems(items)

      requestAnimationFrame(() => {
        items.forEach((data, i) => {
          const el = flyEls.current[i]
          if (!el) return
          el.animate(
            [
              { transform: `translate(${data.dx}px, ${data.dy}px)`, opacity: 1 },
              { transform: 'translate(0, 0)', opacity: 1 },
            ],
            { duration: 500, delay: i * 500, easing: 'ease-out', fill: 'both' }
          )
        })

        setTimeout(() => setAnimPhase('done'), items.length * 500 + 200)
      })
    }))
  }, [submitted, animPhase])

  // ── Desktop drag tracking ─────────────────────────────────────────────────
  const [desktopDragItem, setDesktopDragItem] = useState(null)
  const activeItem = selectedItem?.item ?? desktopDragItem

  const handleDragStart = (e, item, source, index) => {
    e.dataTransfer.setData('application/json', JSON.stringify({ source, index, itemId: item.id }))
    e.dataTransfer.effectAllowed = 'move'
    setDesktopDragItem(item)
  }

  const handleDragEnd = () => setDesktopDragItem(null)

  const handleDragOver = e => {
    if (!isPlaying) return
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const parseDrop = e => {
    try { return JSON.parse(e.dataTransfer.getData('application/json')) } catch { return null }
  }

  const handleDropOnRight = (e, targetIndex) => {
    e.preventDefault()
    if (!isPlaying) return
    const data = parseDrop(e)
    if (data) { handleDrop('right', targetIndex, data); setDesktopDragItem(null) }
  }

  const handleDropOnLeft = e => {
    e.preventDefault()
    if (!isPlaying) return
    const data = parseDrop(e)
    if (data && data.source === 'right') { handleDrop('left', null, data); setDesktopDragItem(null) }
  }

  const leftGone = animPhase !== 'idle'

  return (
    <div className="game-board-container">
      {/* Fixed-position flying clones */}
      {flyItems.map((data, i) => (
        <div
          key={data.item.id}
          ref={el => { flyEls.current[i] = el }}
          className="slot slot-filled fly-clone"
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
        {/* Left column */}
        <div
          className={`column source-column${leftGone ? ' column-gone' : ''}`}
          onDragOver={handleDragOver}
          onDrop={handleDropOnLeft}
          onClickCapture={selectedItem?.source === 'right' && isPlaying ? e => {
            e.stopPropagation()
            returnToLeft(selectedItem.item, selectedItem.index)
          } : undefined}
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
                isDraggable={isPlaying}
                onClick={() => isPlaying && handleSelectItem(item, 'left', leftItems.indexOf(item))}
                onDragStart={e => handleDragStart(e, item, 'left', leftItems.indexOf(item))}
                onDragEnd={handleDragEnd}
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
            <span>{submitted ? 'Recorded! ✓' : 'Your Ranking'}</span>
          </div>
          <div className="target-slots">
            {rightItems.map((item, index) => {
              const isSlotSelected =
                selectedItem?.source === 'right' && selectedItem?.index === index
              const hasSelection = isPlaying && !!activeItem

              return (
                <div
                  key={index}
                  ref={el => { slotRefs.current[index] = el }}
                  className={[
                    'slot',
                    item ? 'slot-filled' : 'slot-empty',
                    isSlotSelected ? 'slot-selected' : '',
                    hasSelection && !item ? 'slot-droppable' : '',
                  ].filter(Boolean).join(' ')}
                  style={animPhase === 'animating' || flyItems.length > 0 ? { opacity: 0 } : undefined}
                  onDragOver={handleDragOver}
                  onDrop={e => handleDropOnRight(e, index)}
                  onClick={() => isPlaying && handleSlotClick(index)}
                >
                  <span className="slot-number">{index + 1}</span>
                  {item ? (
                    <div
                      className={`slot-item-content ${isSlotSelected ? 'selected' : ''}`}
                      draggable={isPlaying}
                      onDragStart={e => handleDragStart(e, item, 'right', index)}
                      onDragEnd={handleDragEnd}
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

          {isPlaying && (
            <button
              className={`submit-btn ${isSubmittable ? 'ready' : 'disabled'}`}
              onClick={handleSubmit}
              disabled={!isSubmittable}
            >
              Submit My Ranking
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
