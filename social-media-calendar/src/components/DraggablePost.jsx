import { useDraggable } from "@dnd-kit/core";

function DraggablePost({ post }) {
  const { attributes, listeners, setNodeRef, transform } =
    useDraggable({ id: post.id });

  const style = {
    transform: transform
      ? `translate(${transform.x}px, ${transform.y}px)`
      : undefined
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="text-xs bg-blue-100 text-blue-700 rounded px-1 mt-1 cursor-move"
    >
      {post.clientName}
    </div>
  );
}

export default DraggablePost;