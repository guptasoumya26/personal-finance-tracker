'use client';

import { useState } from 'react';
import { Income } from '@/types';
import { formatINR } from '@/utils/currency';
import { Trash2, Plus, DollarSign, TrendingUp } from 'lucide-react';

interface IncomeTrackerProps {
  incomes: Income[];
  totalExpenses: number;
  onAddIncome: (income: { source: string; amount: number }) => void;
  onDeleteIncome: (id: string) => void;
  loading: boolean;
}

export default function IncomeTracker({
  incomes,
  totalExpenses,
  onAddIncome,
  onDeleteIncome,
  loading
}: IncomeTrackerProps) {
  const [showForm, setShowForm] = useState(false);
  const [source, setSource] = useState('');
  const [amount, setAmount] = useState('');

  const totalIncome = incomes.reduce((sum, income) => sum + income.amount, 0);
  const investmentBuffer = totalIncome - totalExpenses;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!source.trim() || !amount) {
      alert('Please fill in all fields');
      return;
    }

    onAddIncome({
      source: source.trim(),
      amount: parseFloat(amount)
    });

    setSource('');
    setAmount('');
    setShowForm(false);
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <DollarSign className="text-green-400" size={24} />
          <h2 className="text-xl font-semibold text-white">Income</h2>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
        >
          <Plus size={20} />
          Add Income
        </button>
      </div>

      {/* Add Income Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="mb-4 p-4 bg-gray-700 rounded-lg">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Income Source
              </label>
              <input
                type="text"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                placeholder="e.g., Salary, Freelance"
                className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
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
                className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Add Income
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setSource('');
                setAmount('');
              }}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Income Entries List */}
      <div className="space-y-2 mb-4">
        {incomes.length === 0 ? (
          <p className="text-gray-400 text-center py-4">No income recorded this month</p>
        ) : (
          incomes.map((income) => (
            <div
              key={income.id}
              className="flex items-center justify-between p-3 bg-gray-700 rounded-lg hover:bg-gray-650 transition-colors"
            >
              <div className="flex-1">
                <p className="text-white font-medium">{income.source}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-green-400 font-semibold">
                  {formatINR(income.amount)}
                </span>
                <button
                  onClick={() => onDeleteIncome(income.id)}
                  disabled={loading}
                  className="p-1 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded transition-colors disabled:opacity-50"
                  title="Delete income"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Income Summary */}
      <div className="space-y-3 pt-4 border-t border-gray-600">
        <div className="flex items-center justify-between">
          <span className="text-lg font-semibold text-gray-300">Total Income:</span>
          <span className="text-2xl font-bold text-green-400">
            {formatINR(totalIncome)}
          </span>
        </div>

        {/* Investment Buffer */}
        <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-900/30 to-blue-900/30 rounded-lg border border-purple-500/30">
          <div className="flex items-center gap-2">
            <TrendingUp className="text-purple-400" size={20} />
            <span className="text-lg font-semibold text-purple-300">Investment Buffer:</span>
          </div>
          <span className={`text-2xl font-bold ${investmentBuffer >= 0 ? 'text-purple-400' : 'text-red-400'}`}>
            {formatINR(investmentBuffer)}
          </span>
        </div>
        <p className="text-xs text-gray-400 italic">
          Investment Buffer = Total Income - Total Expenses
        </p>
      </div>
    </div>
  );
}
