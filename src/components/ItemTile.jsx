export default function ItemTile({ item, isSelected, isDraggable, onClick, onDragStart }) {
  return (
    <div
      className={`item-tile ${isSelected ? 'selected' : ''}`}
      draggable={isDraggable}
      onClick={onClick}
      onDragStart={onDragStart}
    >
      {item.name}
    </div>
  )
}
