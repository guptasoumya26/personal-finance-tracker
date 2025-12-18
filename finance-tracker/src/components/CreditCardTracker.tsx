'use client';

import { useState } from 'react';
import { CreditCardEntry } from '@/types';
import { formatINR } from '@/utils/currency';
import { Trash2, Plus, CreditCard, Edit2, Check, GripVertical } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface CreditCardTrackerProps {
  entries: CreditCardEntry[];
  onAddEntry: (entry: { description: string; amount: number }) => void;
  onUpdateEntry: (id: string, entry: { description: string; amount: number }) => void;
  onDeleteEntry: (id: string) => void;
  onReorderEntries: (entries: CreditCardEntry[]) => void;
  loading: boolean;
  title: string;
  onTitleChange: (newTitle: string) => void;
}

// Sortable Entry Item Component
function SortableEntryItem({
  entry,
  onEdit,
  onDelete,
  loading,
}: {
  entry: CreditCardEntry;
  onEdit: (entry: CreditCardEntry) => void;
  onDelete: (id: string) => void;
  loading: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: entry.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-2 p-3 bg-gray-700 rounded-lg hover:bg-gray-650 transition-colors"
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-300"
        aria-label="Drag to reorder"
      >
        <GripVertical size={20} />
      </button>
      <div className="flex-1">
        <p className="text-white font-medium">{entry.description}</p>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-blue-400 font-semibold">
          {formatINR(entry.amount)}
        </span>
        <button
          onClick={() => onEdit(entry)}
          disabled={loading}
          className="p-1 text-blue-400 hover:text-blue-300 hover:bg-blue-400/10 rounded transition-colors disabled:opacity-50"
          title="Edit entry"
        >
          <Edit2 size={18} />
        </button>
        <button
          onClick={() => onDelete(entry.id)}
          disabled={loading}
          className="p-1 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded transition-colors disabled:opacity-50"
          title="Delete entry"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
}

export default function CreditCardTracker({
  entries,
  onAddEntry,
  onUpdateEntry,
  onDeleteEntry,
  onReorderEntries,
  loading,
  title,
  onTitleChange
}: CreditCardTrackerProps) {
  const [showForm, setShowForm] = useState(false);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState(title);
  const [editingEntry, setEditingEntry] = useState<CreditCardEntry | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const totalBill = entries.reduce((sum, entry) => sum + entry.amount, 0);

  const handleSaveTitle = () => {
    onTitleChange(editedTitle);
    setIsEditingTitle(false);
  };

  const handleCancelEdit = () => {
    setEditedTitle(title);
    setIsEditingTitle(false);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = entries.findIndex((e) => e.id === active.id);
      const newIndex = entries.findIndex((e) => e.id === over.id);

      const reorderedEntries = arrayMove(entries, oldIndex, newIndex);
      onReorderEntries(reorderedEntries);
    }
  };

  const handleEditEntry = (entry: CreditCardEntry) => {
    setEditingEntry(entry);
    setDescription(entry.description);
    setAmount(entry.amount.toString());
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!description.trim() || !amount) {
      alert('Please fill in all fields');
      return;
    }

    if (editingEntry) {
      onUpdateEntry(editingEntry.id, {
        description: description.trim(),
        amount: parseFloat(amount)
      });
    } else {
      onAddEntry({
        description: description.trim(),
        amount: parseFloat(amount)
      });
    }

    setDescription('');
    setAmount('');
    setShowForm(false);
    setEditingEntry(null);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setDescription('');
    setAmount('');
    setEditingEntry(null);
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <CreditCard className="text-blue-400" size={24} />
          {isEditingTitle ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSaveTitle();
                  } else if (e.key === 'Escape') {
                    handleCancelEdit();
                  }
                }}
                autoFocus
                className="text-xl font-semibold text-white bg-gray-700 px-3 py-1 rounded border border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleSaveTitle}
                className="p-1.5 bg-green-600 hover:bg-green-700 text-white rounded transition-colors"
                title="Save"
              >
                <Check size={18} />
              </button>
              <button
                onClick={handleCancelEdit}
                className="p-1.5 bg-gray-600 hover:bg-gray-500 text-white rounded transition-colors"
                title="Cancel"
              >
                ✕
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-semibold text-white">
                {title}
              </h2>
              <button
                onClick={() => {
                  setEditedTitle(title);
                  setIsEditingTitle(true);
                }}
                className="p-1 text-blue-400 hover:text-blue-300 hover:bg-blue-400/10 rounded transition-colors"
                title="Edit title"
              >
                <Edit2 size={16} />
              </button>
            </div>
          )}
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          <Plus size={20} />
          Add Purchase
        </button>
      </div>

      {/* Add/Edit Entry Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="mb-4 p-4 bg-gray-700 rounded-lg">
          <h3 className="text-lg font-medium text-white mb-3">
            {editingEntry ? 'Edit Purchase' : 'Add Purchase'}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Description
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g., Amazon Purchase"
                className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Amount (₹)
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                step="0.01"
                className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {editingEntry ? 'Update Entry' : 'Add Entry'}
            </button>
            <button
              type="button"
              onClick={handleCancelForm}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Entries List */}
      <div className="space-y-2 mb-4">
        {entries.length === 0 ? (
          <p className="text-gray-400 text-center py-4">No purchases recorded this month</p>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={entries.map((e) => e.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2">
                {entries.map((entry) => (
                  <SortableEntryItem
                    key={entry.id}
                    entry={entry}
                    onEdit={handleEditEntry}
                    onDelete={onDeleteEntry}
                    loading={loading}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>

      {/* Total Bill */}
      <div className="pt-4 border-t border-gray-600">
        <div className="flex items-center justify-between">
          <span className="text-lg font-semibold text-gray-300">Expected Credit Card Bill:</span>
          <span className="text-2xl font-bold text-blue-400">
            {formatINR(totalBill)}
          </span>
        </div>
      </div>
    </div>
  );
}
