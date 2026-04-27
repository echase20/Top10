export default function ItemTile({ item, isSelected, isDraggable, onClick, onDragStart, onDragEnd, onTouchStart }) {
  return (
    <div
      className={`item-tile ${isSelected ? 'selected' : ''}`}
      draggable={isDraggable}
      onClick={onClick}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onTouchStart={onTouchStart}
    >
      {item.name}
    </div>
  )
}
