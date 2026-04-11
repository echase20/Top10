export default function ItemTile({ item, isSelected, isDraggable, onClick, onDragStart, onTouchStart }) {
  return (
    <div
      className={`item-tile ${isSelected ? 'selected' : ''}`}
      draggable={isDraggable}
      onClick={onClick}
      onDragStart={onDragStart}
      onTouchStart={onTouchStart}
    >
      {item.name}
    </div>
  )
}
