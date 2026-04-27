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

  if (gameStatus === 'submitted') {
    return (
      <div className="game-board-container">
        <div className="result-view">
          <p className="result-label">Your ranking has been recorded!</p>
          {submittedRanking.map((item, i) => (
            <div
              key={item.id}
              className="result-item result-opinion"
              style={{ animationDelay: `${i * 0.15}s` }}
            >
              <span className="result-rank">{i + 1}</span>
              <span className="result-name">{item.name}</span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="game-board-container">
      <div className="columns-wrapper">
        {/* Left column */}
        <div
          className="column source-column"
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

        {/* Right column */}
        <div className="column target-column">
          <div className="column-header">
            <span>Your Ranking</span>
          </div>
          <div className="target-slots">
            {rightItems.map((item, index) => {
              const isSlotSelected =
                selectedItem?.source === 'right' && selectedItem?.index === index
              const hasSelection = isPlaying && !!selectedItem

              return (
                <div
                  key={index}
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

          <button
            className={`submit-btn ${isSubmittable ? 'ready' : 'disabled'}`}
            onClick={handleSubmit}
            disabled={!isSubmittable}
          >
            Submit My Ranking
          </button>
        </div>
      </div>
    </div>
  )
}
