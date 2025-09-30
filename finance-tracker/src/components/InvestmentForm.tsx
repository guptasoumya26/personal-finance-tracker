'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { Investment, INVESTMENT_CATEGORIES, InvestmentCategory } from '@/types';

interface InvestmentFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (investment: Omit<Investment, 'id' | 'createdAt'>) => void;
  editingInvestment?: Investment;
  currentMonth: Date;
}

export default function InvestmentForm({
  isOpen,
  onClose,
  onSubmit,
  editingInvestment,
  currentMonth,
}: InvestmentFormProps) {
  const [formData, setFormData] = useState({
    name: editingInvestment?.name || '',
    amount: editingInvestment?.amount?.toString() || '',
    category: editingInvestment?.category || 'Other',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const investmentData: Omit<Investment, 'id' | 'createdAt'> = {
      name: formData.name,
      amount: parseFloat(formData.amount),
      category: formData.category as InvestmentCategory,
      month: currentMonth,
      sourceType: 'manual',
    };

    onSubmit(investmentData);
    onClose();
    setFormData({ name: '', amount: '', category: 'Other' });
  };

  const handleClose = () => {
    onClose();
    setFormData({ name: '', amount: '', category: 'Other' });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">
            {editingInvestment ? 'Edit Investment' : 'Add Investment'}
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
              Investment Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., S&P 500 ETF, Bitcoin, Real Estate"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Amount (INR)
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="w-full bg-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Category
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value as InvestmentCategory })}
              className="w-full bg-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              {INVESTMENT_CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors"
            >
              {editingInvestment ? 'Update' : 'Add'} Investment
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