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
    isSubmittable,
    gameStatus,
    submittedRanking,
  } = game

  const isPlaying = gameStatus === 'playing'

  const handleDragStart = (e, item, source, index) => {
    e.dataTransfer.setData('application/json', JSON.stringify({ source, index, itemId: item.id }))
    e.dataTransfer.effectAllowed = 'move'
  }

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
    if (data) handleDrop('right', targetIndex, data)
  }

  const handleDropOnLeft = e => {
    e.preventDefault()
    if (!isPlaying) return
    const data = parseDrop(e)
    if (data && data.source === 'right') handleDrop('left', null, data)
  }

  // submitted — handled inline below via gameStatus checks

  return (
    <div className="game-board-container">
      <div className="columns-wrapper">
        {/* Left column — collapses after submission */}
        <div
          className={`column source-column ${gameStatus === 'submitted' ? 'column-collapsing' : ''}`}
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
                isDraggable={isPlaying}
                onClick={() => isPlaying && handleSelectItem(item, 'left', leftItems.indexOf(item))}
                onDragStart={e => handleDragStart(e, item, 'left', leftItems.indexOf(item))}
              />
            ))}
            {leftItems.length === 0 && (
              <div className="empty-source">All items placed →</div>
            )}
          </div>
        </div>

        {/* Right column — expands to center after submission */}
        <div className="column target-column">
          <div className="column-header">
            <span>{gameStatus === 'submitted' ? 'Recorded! ✓' : 'Your Ranking'}</span>
          </div>
          <div className="target-slots">
            {rightItems.map((item, index) => {
              const isSlotSelected =
                selectedItem?.source === 'right' && selectedItem?.index === index
              const hasSelection = isPlaying && !!selectedItem
              const settleStyle = gameStatus === 'submitted'
                ? { animation: 'resultSettle 0.5s ease-out both', animationDelay: `${index * 0.12}s` }
                : {}

              return (
                <div
                  key={index}
                  style={settleStyle}
                  className={[
                    'slot',
                    item ? 'slot-filled' : 'slot-empty',
                    isSlotSelected ? 'slot-selected' : '',
                    hasSelection && !item ? 'slot-droppable' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
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

          {gameStatus !== 'submitted' && (
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
