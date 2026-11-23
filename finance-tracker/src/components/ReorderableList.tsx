'use client';

import { type ReactNode } from 'react';
import { closestCenter, DndContext, type DragEndEvent, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';

export function ReorderableList<T extends { id: string }>({ items, onReorder, children }: {
  items: T[];
  onReorder: (items: T[]) => void;
  children: ReactNode;
}) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function handleDragEnd({ active, over }: DragEndEvent) {
    if (!over || active.id === over.id) return;
    const from = items.findIndex(item => item.id === active.id);
    const to = items.findIndex(item => item.id === over.id);
    if (from >= 0 && to >= 0) onReorder(arrayMove(items, from, to));
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={items} strategy={verticalListSortingStrategy}>{children}</SortableContext>
    </DndContext>
  );
}

export function ReorderableRow({ id, label, className, children, disabled = false }: {
  id: string;
  label: string;
  className: string;
  children: ReactNode;
  disabled?: boolean;
}) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } =
    useSortable({ id, disabled });

  return (
    <div ref={setNodeRef} className={className}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }}>
      <button type="button" ref={setActivatorNodeRef} {...attributes} {...listeners}
        disabled={disabled} aria-label={`Reorder ${label}`}
        className="touch-none cursor-grab active:cursor-grabbing p-1 hover:bg-gray-600 rounded text-gray-400 hover:text-white mr-2">
        <GripVertical className="w-4 h-4" />
      </button>
      {children}
    </div>
  );
}
