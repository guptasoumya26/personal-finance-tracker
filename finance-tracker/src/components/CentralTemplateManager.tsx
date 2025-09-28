'use client';

import { useState } from 'react';
import { Plus, Edit2, Trash2, Settings, AlertCircle } from 'lucide-react';
import { CentralTemplate, TemplateItem, EXPENSE_CATEGORIES, ExpenseCategory } from '@/types';
import { formatINR } from '@/utils/currency';

interface CentralTemplateManagerProps {
  centralTemplate: CentralTemplate | null;
  onUpdateTemplate: (template: CentralTemplate) => void;
  onCreateTemplate: () => void;
}

export default function CentralTemplateManager({
  centralTemplate,
  onUpdateTemplate,
  onCreateTemplate,
}: CentralTemplateManagerProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<TemplateItem | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    category: 'Other' as ExpenseCategory,
  });

  const resetForm = () => {
    setFormData({ name: '', amount: '', category: 'Other' });
    setShowForm(false);
    setEditingItem(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!centralTemplate) return;

    const itemData: TemplateItem = {
      id: editingItem?.id || Date.now().toString(),
      name: formData.name,
      amount: parseFloat(formData.amount),
      category: formData.category,
    };

    let updatedItems: TemplateItem[];

    if (editingItem) {
      updatedItems = centralTemplate.items.map(item =>
        item.id === editingItem.id ? itemData : item
      );
    } else {
      updatedItems = [...centralTemplate.items, itemData];
    }

    const updatedTemplate: CentralTemplate = {
      ...centralTemplate,
      items: updatedItems,
      updatedAt: new Date(),
    };

    onUpdateTemplate(updatedTemplate);
    resetForm();
  };

  const handleEdit = (item: TemplateItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      amount: item.amount.toString(),
      category: item.category,
    });
    setShowForm(true);
  };

  const handleDelete = (itemId: string) => {
    if (!centralTemplate) return;

    const updatedItems = centralTemplate.items.filter(item => item.id !== itemId);
    const updatedTemplate: CentralTemplate = {
      ...centralTemplate,
      items: updatedItems,
      updatedAt: new Date(),
    };

    onUpdateTemplate(updatedTemplate);
  };

  const totalTemplateAmount = centralTemplate?.items.reduce((sum, item) => sum + item.amount, 0) || 0;

  return (
    <div className="bg-gray-800 rounded-lg p-4 sm:p-6 mb-4 sm:mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-blue-400" />
          <h2 className="text-lg sm:text-xl font-semibold">Central Template Manager</h2>
        </div>
      </div>

      {!centralTemplate ? (
        <div className="text-center text-gray-400 py-8">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-500" />
          <p className="mb-2 text-sm sm:text-base">No central template found</p>
          <p className="text-xs sm:text-sm mb-4">Create a central template to manage your recurring expenses</p>
          <button
            onClick={onCreateTemplate}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors text-sm mx-auto"
          >
            <Plus className="w-4 h-4" />
            Create Central Template
          </button>
        </div>
      ) : (
        <>
          {/* Template Summary */}
          <div className="bg-gray-700 rounded-lg p-3 sm:p-4 mb-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <p className="text-gray-400 text-xs sm:text-sm">{centralTemplate.items.length} Template Items</p>
                <p className="text-blue-400 text-base sm:text-lg font-semibold">{formatINR(totalTemplateAmount)}</p>
                <p className="text-gray-400 text-xs">Total monthly recurring</p>
              </div>
              <div className="text-left sm:text-right">
                <p className="text-gray-400 text-xs">This template will be copied</p>
                <p className="text-gray-400 text-xs">when you fill monthly expenses</p>
              </div>
            </div>
          </div>

          <button
            onClick={() => setShowForm(true)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 sm:py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors mb-4 sm:mb-6 text-sm sm:text-base"
          >
            <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
            Add Template Item
          </button>

          {/* Template Items List */}
          {centralTemplate.items.length > 0 ? (
            <div className="space-y-2 sm:space-y-3">
              <h3 className="font-medium mb-2 sm:mb-3 text-sm sm:text-base">Template Items</h3>
              {centralTemplate.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-2 sm:p-3 bg-gray-700 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm sm:text-base truncate">{item.name}</p>
                    <p className="text-gray-400 text-xs sm:text-sm truncate">{item.category}</p>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3 ml-2">
                    <p className="text-blue-400 font-semibold text-sm sm:text-base">{formatINR(item.amount)}</p>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleEdit(item)}
                        className="p-1 hover:bg-gray-600 rounded text-gray-400 hover:text-white transition-colors"
                      >
                        <Edit2 className="w-3 h-3 sm:w-4 sm:h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-1 hover:bg-gray-600 rounded text-gray-400 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-400 py-6 sm:py-8">
              <p className="mb-2 text-sm sm:text-base">No template items yet</p>
              <p className="text-xs sm:text-sm">Add items like rent, utilities, subscriptions, etc.</p>
            </div>
          )}
        </>
      )}

      {/* Add/Edit Item Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">
              {editingItem ? 'Edit Template Item' : 'Add Template Item'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Expense Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Rent, Utilities, Netflix"
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
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as ExpenseCategory })}
                  className="w-full bg-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  {EXPENSE_CATEGORIES.map((category) => (
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
                  {editingItem ? 'Update' : 'Add'} Item
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}