'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface NetWorthFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (amount: number) => void;
  currentMonth: Date;
  existingAmount?: number;
}

export default function NetWorthForm({
  isOpen,
  onClose,
  onSubmit,
  currentMonth,
  existingAmount,
}: NetWorthFormProps) {
  const [amount, setAmount] = useState(existingAmount?.toString() || '');

  useEffect(() => {
    setAmount(existingAmount?.toString() || '');
  }, [existingAmount, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(parseFloat(amount));
    onClose();
  };

  const handleClose = () => {
    onClose();
    setAmount(existingAmount?.toString() || '');
  };

  if (!isOpen) return null;

  const monthLabel = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">
            {existingAmount !== undefined ? 'Update Net Worth' : 'Add Net Worth'}
          </h3>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-gray-700 rounded text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Net Worth for {monthLabel} (INR)
            </label>
            <input
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="0"
              required
              autoFocus
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-lg transition-colors"
            >
              {existingAmount !== undefined ? 'Update' : 'Add'} Net Worth
            </button>
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
