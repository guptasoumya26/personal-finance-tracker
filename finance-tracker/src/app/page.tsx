'use client';

import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Plus, Edit2, Trash2, Calendar, Settings, Menu, X, LogOut } from 'lucide-react';
// import RecurringTemplates from '@/components/RecurringTemplates';
import CentralTemplateManager from '@/components/CentralTemplateManager';
import CentralInvestmentTemplateManager from '@/components/CentralInvestmentTemplateManager';
import ExpenseForm from '@/components/ExpenseForm';
import InvestmentForm from '@/components/InvestmentForm';
import TrendChart from '@/components/TrendChart';
import ExpensePieChart from '@/components/ExpensePieChart';
import InvestmentPieChart from '@/components/InvestmentPieChart';
import SelfInvestmentTrendChart from '@/components/SelfInvestmentTrendChart';
import LoadingSpinner from '@/components/LoadingSpinner';
import Toast from '@/components/Toast';
import { Expense, Investment, CentralTemplate, CentralInvestmentTemplate } from '@/types';
import { formatINR } from '@/utils/currency';
import * as api from '@/lib/api';

export default function FinanceTracker() {
  const [currentMonth, setCurrentMonth] = useState(new Date()); // Current month
  const [centralTemplate, setCentralTemplate] = useState<CentralTemplate | null>(null);
  const [centralInvestmentTemplate, setCentralInvestmentTemplate] = useState<CentralInvestmentTemplate | null>(null);
  const [activeTab, setActiveTab] = useState<'monthly' | 'template' | 'investment-template'>('monthly');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingExpenses, setLoadingExpenses] = useState(false);
  const [loadingInvestments, setLoadingInvestments] = useState(false);
  const [monthlyExpenses, setMonthlyExpenses] = useState<Expense[]>([]);
  const [allExpenses, setAllExpenses] = useState<Expense[]>([]);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [monthlyInvestments, setMonthlyInvestments] = useState<Investment[]>([]);
  const [allInvestments, setAllInvestments] = useState<Investment[]>([]);
  const [showInvestmentForm, setShowInvestmentForm] = useState(false);
  const [editingInvestment, setEditingInvestment] = useState<Investment | null>(null);
  const [currentNote, setCurrentNote] = useState<string>('');
  const notesTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'info' | 'warning';
    isVisible: boolean;
  }>({
    message: '',
    type: 'success',
    isVisible: false
  });

  const formatMonth = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const showToast = (message: string, type: 'success' | 'info' | 'warning' = 'success') => {
    setToast({ message, type, isVisible: true });
  };

  // Fuzzy matching function - checks if names are similar (5+ characters match)
  const areNamesSimilar = (name1: string, name2: string): boolean => {
    const normalize = (str: string) => str.toLowerCase().trim();
    const n1 = normalize(name1);
    const n2 = normalize(name2);

    // Exact match
    if (n1 === n2) return true;

    // Check for substring match of 5+ characters
    if (n1.length >= 5 && n2.includes(n1)) return true;
    if (n2.length >= 5 && n1.includes(n2)) return true;

    // Check for common substrings of 5+ characters
    for (let i = 0; i <= n1.length - 5; i++) {
      const substring = n1.substring(i, i + 5);
      if (n2.includes(substring)) return true;
    }

    return false;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const goToCurrentMonth = () => {
    setCurrentMonth(new Date());
  };

  // Load data from database
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);

        // Load central template
        const template = await api.fetchCentralTemplate();
        if (template) {
          setCentralTemplate({
            ...template,
            items: template.items || [],
            createdAt: new Date(template.created_at),
            updatedAt: new Date(template.updated_at)
          });
        }

        // Load central investment template
        const investmentTemplate = await api.fetchCentralInvestmentTemplate();
        if (investmentTemplate) {
          setCentralInvestmentTemplate({
            ...investmentTemplate,
            items: investmentTemplate.items || [],
            createdAt: new Date(investmentTemplate.created_at),
            updatedAt: new Date(investmentTemplate.updated_at)
          });
        }

        // Load all expenses and investments for the chart data
        const allExpensesData = await api.fetchExpenses();
        const mappedAllExpenses = allExpensesData.map((exp: any) => ({
          ...exp,
          month: new Date(exp.month + '-01'),
          createdAt: new Date(exp.created_at)
        }));
        setAllExpenses(mappedAllExpenses);

        const allInvestmentsData = await api.fetchInvestments();
        const mappedAllInvestments = allInvestmentsData.map((inv: any) => ({
          ...inv,
          month: new Date(inv.month + '-01'),
          createdAt: new Date(inv.created_at)
        }));
        setAllInvestments(mappedAllInvestments);

      } catch (error) {
        console.error('Error loading initial data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, []);

  // Load monthly data when month changes
  useEffect(() => {
    const loadMonthlyData = async () => {
      const monthKey = api.formatMonthForAPI(currentMonth);

      try {
        setLoadingExpenses(true);
        setLoadingInvestments(true);

        // Load expenses for current month
        const expenses = await api.fetchExpenses(monthKey);
        const mappedExpenses = expenses.map((exp: any) => ({
          ...exp,
          month: new Date(exp.month + '-01'),
          createdAt: new Date(exp.created_at)
        }));
        setMonthlyExpenses(mappedExpenses);

        // Load investments for current month
        const investments = await api.fetchInvestments(monthKey);
        const mappedInvestments = investments.map((inv: any) => ({
          ...inv,
          month: new Date(inv.month + '-01'),
          createdAt: new Date(inv.created_at)
        }));
        setMonthlyInvestments(mappedInvestments);

        // Load note for current month
        const note = await api.fetchNote(monthKey);
        setCurrentNote(note?.content || '');

      } catch (error) {
        console.error('Error loading monthly data:', error);
      } finally {
        setLoadingExpenses(false);
        setLoadingInvestments(false);
      }
    };

    loadMonthlyData();
  }, [currentMonth]);


  const handleNotesChange = async (value: string) => {
    try {
      const monthKey = api.formatMonthForAPI(currentMonth);
      setCurrentNote(value);

      // Debounce the API call
      if (notesTimeoutRef.current) {
        clearTimeout(notesTimeoutRef.current);
      }

      notesTimeoutRef.current = setTimeout(async () => {
        try {
          await api.saveNote(value, monthKey);
        } catch (error) {
          console.error('Error saving note:', error);
        }
      }, 500);
    } catch (error) {
      console.error('Error handling note change:', error);
    }
  };

  // Central template management functions
  const handleCreateCentralTemplate = async () => {
    try {
      const template = await api.saveCentralTemplate([]);
      setCentralTemplate({
        ...template,
        items: template.items || [],
        createdAt: new Date(template.created_at),
        updatedAt: new Date(template.updated_at)
      });
    } catch (error) {
      console.error('Error creating central template:', error);
      alert('Failed to create template. Please try again.');
    }
  };

  const handleUpdateCentralTemplate = async (template: CentralTemplate) => {
    try {
      const updatedTemplate = await api.updateCentralTemplate(template.items);
      setCentralTemplate({
        ...updatedTemplate,
        items: updatedTemplate.items || [],
        createdAt: new Date(updatedTemplate.created_at),
        updatedAt: new Date(updatedTemplate.updated_at)
      });
    } catch (error) {
      console.error('Error updating central template:', error);
      alert('Failed to update template. Please try again.');
    }
  };

  // Central investment template management functions
  const handleCreateCentralInvestmentTemplate = async () => {
    try {
      const template = await api.saveCentralInvestmentTemplate([]);
      setCentralInvestmentTemplate({
        ...template,
        items: template.items || [],
        createdAt: new Date(template.created_at),
        updatedAt: new Date(template.updated_at)
      });
    } catch (error) {
      console.error('Error creating central investment template:', error);
      alert('Failed to create investment template. Please try again.');
    }
  };

  const handleUpdateCentralInvestmentTemplate = async (template: CentralInvestmentTemplate) => {
    try {
      const updatedTemplate = await api.updateCentralInvestmentTemplate(template.items);
      setCentralInvestmentTemplate({
        ...updatedTemplate,
        items: updatedTemplate.items || [],
        createdAt: new Date(updatedTemplate.created_at),
        updatedAt: new Date(updatedTemplate.updated_at)
      });
    } catch (error) {
      console.error('Error updating central investment template:', error);
      alert('Failed to update investment template. Please try again.');
    }
  };


  const handleFillExpenses = async () => {
    if (!centralTemplate || centralTemplate.items.length === 0) {
      alert('Please create a central template first before filling expenses.');
      return;
    }

    try {
      setLoadingExpenses(true);
      const monthKey = api.formatMonthForAPI(currentMonth);

      // First, delete existing template-based expenses for this month
      const existingTemplateExpenses = monthlyExpenses.filter(exp =>
        exp.sourceType === 'template' &&
        exp.month.getMonth() === currentMonth.getMonth() &&
        exp.month.getFullYear() === currentMonth.getFullYear()
      );

      for (const expense of existingTemplateExpenses) {
        await api.deleteExpense(expense.id);
      }

      // Create new expenses from template
      const newExpenses: Expense[] = [];
      const skippedItems: string[] = [];

      for (const item of centralTemplate.items) {
        // Additional check: Skip if an expense with similar name already exists for this month
        const existingExpenseWithSimilarName = monthlyExpenses.find(exp =>
          areNamesSimilar(exp.name, item.name) &&
          exp.month.getMonth() === currentMonth.getMonth() &&
          exp.month.getFullYear() === currentMonth.getFullYear()
        );

        if (existingExpenseWithSimilarName) {
          skippedItems.push(`${item.name} (similar to: ${existingExpenseWithSimilarName.name})`);
          continue;
        }

        const expenseData = {
          name: item.name,
          amount: item.amount,
          category: item.category,
          month: monthKey,
          source_type: 'template' as const
        };

        const createdExpense = await api.createExpense(expenseData);
        newExpenses.push({
          ...createdExpense,
          month: new Date(createdExpense.month + '-01'),
          createdAt: new Date(createdExpense.created_at)
        });
      }

      // Show user feedback with simple toast messages
      if (newExpenses.length === 0 && skippedItems.length > 0) {
        showToast('Expenses are already present from the Master Template', 'warning');
      } else if (skippedItems.length > 0) {
        showToast(`Added ${newExpenses.length} expenses, skipped ${skippedItems.length} similar items`, 'info');
      } else {
        showToast(`Successfully added ${newExpenses.length} expenses from template!`, 'success');
      }

      // Update local state
      setMonthlyExpenses(prev => [
        ...prev.filter(exp =>
          exp.sourceType !== 'template' ||
          exp.month.getMonth() !== currentMonth.getMonth() ||
          exp.month.getFullYear() !== currentMonth.getFullYear()
        ),
        ...newExpenses
      ]);
      setAllExpenses(prev => [
        ...prev.filter(exp =>
          exp.sourceType !== 'template' ||
          exp.month.getMonth() !== currentMonth.getMonth() ||
          exp.month.getFullYear() !== currentMonth.getFullYear()
        ),
        ...newExpenses
      ]);

    } catch (error) {
      console.error('Error filling expenses:', error);
      alert('Failed to fill expenses. Please try again.');
    } finally {
      setLoadingExpenses(false);
    }
  };

  const handleFillInvestments = async () => {
    if (!centralInvestmentTemplate || centralInvestmentTemplate.items.length === 0) {
      alert('Please create a central investment template first before filling investments.');
      return;
    }

    try {
      setLoadingInvestments(true);
      const monthKey = api.formatMonthForAPI(currentMonth);

      // First, delete existing template-based investments for this month
      const existingTemplateInvestments = monthlyInvestments.filter(inv =>
        inv.sourceType === 'template' &&
        inv.month.getMonth() === currentMonth.getMonth() &&
        inv.month.getFullYear() === currentMonth.getFullYear()
      );

      for (const investment of existingTemplateInvestments) {
        await api.deleteInvestment(investment.id);
      }

      // Create new investments from template
      const newInvestments: Investment[] = [];
      const skippedItems: string[] = [];

      for (const item of centralInvestmentTemplate.items) {
        // Additional check: Skip if an investment with similar name already exists for this month
        const existingInvestmentWithSimilarName = monthlyInvestments.find(inv =>
          areNamesSimilar(inv.name, item.name) &&
          inv.month.getMonth() === currentMonth.getMonth() &&
          inv.month.getFullYear() === currentMonth.getFullYear()
        );

        if (existingInvestmentWithSimilarName) {
          skippedItems.push(`${item.name} (similar to: ${existingInvestmentWithSimilarName.name})`);
          continue;
        }

        const investmentData = {
          name: item.name,
          amount: item.amount,
          category: item.category,
          investment_type: item.investmentType,
          month: monthKey,
          source_type: 'template' as const
        };

        const createdInvestment = await api.createInvestment(investmentData);
        newInvestments.push({
          ...createdInvestment,
          month: new Date(createdInvestment.month + '-01'),
          createdAt: new Date(createdInvestment.created_at)
        });
      }

      // Show user feedback with simple toast messages
      if (newInvestments.length === 0 && skippedItems.length > 0) {
        showToast('Investments are already present from the Master Template', 'warning');
      } else if (skippedItems.length > 0) {
        showToast(`Added ${newInvestments.length} investments, skipped ${skippedItems.length} similar items`, 'info');
      } else {
        showToast(`Successfully added ${newInvestments.length} investments from template!`, 'success');
      }

      // Update local state
      setMonthlyInvestments(prev => [
        ...prev.filter(inv =>
          inv.sourceType !== 'template' ||
          inv.month.getMonth() !== currentMonth.getMonth() ||
          inv.month.getFullYear() !== currentMonth.getFullYear()
        ),
        ...newInvestments
      ]);
      setAllInvestments(prev => [
        ...prev.filter(inv =>
          inv.sourceType !== 'template' ||
          inv.month.getMonth() !== currentMonth.getMonth() ||
          inv.month.getFullYear() !== currentMonth.getFullYear()
        ),
        ...newInvestments
      ]);

    } catch (error) {
      console.error('Error filling investments:', error);
      alert('Failed to fill investments. Please try again.');
    } finally {
      setLoadingInvestments(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout error:', error);
      // Force redirect even if API call fails
      window.location.href = '/login';
    }
  };

  // Expense management functions
  const handleAddExpense = async (expense: Omit<Expense, 'id' | 'createdAt'>) => {
    try {
      const expenseData = {
        name: expense.name,
        amount: expense.amount,
        category: expense.category,
        month: api.formatMonthForAPI(expense.month),
        source_type: expense.sourceType
      };

      const createdExpense = await api.createExpense(expenseData);
      const newExpense = {
        ...createdExpense,
        month: new Date(createdExpense.month + '-01'),
        createdAt: new Date(createdExpense.created_at)
      };

      setMonthlyExpenses(prev => [...prev, newExpense]);
      setAllExpenses(prev => [...prev, newExpense]);
    } catch (error) {
      console.error('Error adding expense:', error);
      alert('Failed to add expense. Please try again.');
    }
  };

  const handleEditExpense = async (id: string, expense: Omit<Expense, 'id' | 'createdAt'>) => {
    try {
      const expenseData = {
        id,
        name: expense.name,
        amount: expense.amount,
        category: expense.category,
        month: api.formatMonthForAPI(expense.month),
        source_type: expense.sourceType
      };

      const updatedExpense = await api.updateExpense(expenseData);
      const mappedExpense = {
        ...updatedExpense,
        month: new Date(updatedExpense.month + '-01'),
        createdAt: new Date(updatedExpense.created_at)
      };

      setMonthlyExpenses(prev =>
        prev.map(exp => exp.id === id ? mappedExpense : exp)
      );
      setAllExpenses(prev =>
        prev.map(exp => exp.id === id ? mappedExpense : exp)
      );
    } catch (error) {
      console.error('Error updating expense:', error);
      alert('Failed to update expense. Please try again.');
    }
  };

  const handleDeleteExpense = async (id: string) => {
    try {
      await api.deleteExpense(id);
      setMonthlyExpenses(prev => prev.filter(exp => exp.id !== id));
      setAllExpenses(prev => prev.filter(exp => exp.id !== id));
    } catch (error) {
      console.error('Error deleting expense:', error);
      alert('Failed to delete expense. Please try again.');
    }
  };

  const openEditExpenseForm = (expense: Expense) => {
    setEditingExpense(expense);
    setShowExpenseForm(true);
  };

  const closeExpenseForm = () => {
    setShowExpenseForm(false);
    setEditingExpense(null);
  };

  // Investment management functions
  const handleAddInvestment = async (investment: Omit<Investment, 'id' | 'createdAt'>) => {
    try {
      const investmentData = {
        name: investment.name,
        amount: investment.amount,
        category: investment.category,
        month: api.formatMonthForAPI(investment.month),
        source_type: investment.sourceType
      };

      const createdInvestment = await api.createInvestment(investmentData);
      const newInvestment = {
        ...createdInvestment,
        month: new Date(createdInvestment.month + '-01'),
        createdAt: new Date(createdInvestment.created_at)
      };

      setMonthlyInvestments(prev => [...prev, newInvestment]);
      setAllInvestments(prev => [...prev, newInvestment]);
    } catch (error) {
      console.error('Error adding investment:', error);
      alert('Failed to add investment. Please try again.');
    }
  };

  const handleEditInvestment = async (id: string, investment: Omit<Investment, 'id' | 'createdAt'>) => {
    try {
      const investmentData = {
        id,
        name: investment.name,
        amount: investment.amount,
        category: investment.category,
        month: api.formatMonthForAPI(investment.month),
        source_type: investment.sourceType
      };

      const updatedInvestment = await api.updateInvestment(investmentData);
      const mappedInvestment = {
        ...updatedInvestment,
        month: new Date(updatedInvestment.month + '-01'),
        createdAt: new Date(updatedInvestment.created_at)
      };

      setMonthlyInvestments(prev =>
        prev.map(inv => inv.id === id ? mappedInvestment : inv)
      );
      setAllInvestments(prev =>
        prev.map(inv => inv.id === id ? mappedInvestment : inv)
      );
    } catch (error) {
      console.error('Error updating investment:', error);
      alert('Failed to update investment. Please try again.');
    }
  };

  const handleDeleteInvestment = async (id: string) => {
    try {
      await api.deleteInvestment(id);
      setMonthlyInvestments(prev => prev.filter(inv => inv.id !== id));
      setAllInvestments(prev => prev.filter(inv => inv.id !== id));
    } catch (error) {
      console.error('Error deleting investment:', error);
      alert('Failed to delete investment. Please try again.');
    }
  };

  const openEditInvestmentForm = (investment: Investment) => {
    setEditingInvestment(investment);
    setShowInvestmentForm(true);
  };

  const closeInvestmentForm = () => {
    setShowInvestmentForm(false);
    setEditingInvestment(null);
  };

  // Calculate current month totals
  const currentMonthExpenses = monthlyExpenses
    .filter(exp =>
      exp.month.getMonth() === currentMonth.getMonth() &&
      exp.month.getFullYear() === currentMonth.getFullYear()
    )
    .sort((a, b) => a.name.localeCompare(b.name));
  const totalExpenses = currentMonthExpenses.reduce((sum, exp) => sum + exp.amount, 0);

  const currentMonthInvestments = monthlyInvestments
    .filter(inv =>
      inv.month.getMonth() === currentMonth.getMonth() &&
      inv.month.getFullYear() === currentMonth.getFullYear()
    )
    .sort((a, b) => a.name.localeCompare(b.name));
  const totalInvestments = currentMonthInvestments.reduce((sum, inv) => sum + inv.amount, 0);

  // Calculate chart data from database
  const calculateChartData = () => {
    const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const expenseChartData = new Array(12).fill(0);
    const investmentChartData = new Array(12).fill(0);
    const selfInvestmentChartData = new Array(12).fill(0);

    // Only include data from 2025 to avoid phantom entries from other years
    const currentYear = 2025;

    // Calculate expenses by month - only from current year
    allExpenses.forEach(expense => {
      // Validate the date and year
      if (expense.month instanceof Date &&
          expense.month.getFullYear() === currentYear &&
          !isNaN(expense.month.getTime()) &&
          expense.amount > 0) {
        const month = expense.month.getMonth(); // 0-11
        if (month >= 0 && month <= 11) {
          expenseChartData[month] += expense.amount;
        }
      }
    });

    // Calculate investments by month - only from current year
    allInvestments.forEach(investment => {
      // Validate the date and year
      if (investment.month instanceof Date &&
          investment.month.getFullYear() === currentYear &&
          !isNaN(investment.month.getTime()) &&
          investment.amount > 0) {
        const month = investment.month.getMonth(); // 0-11
        if (month >= 0 && month <= 11) {
          investmentChartData[month] += investment.amount;

          // Calculate self investments separately
          if (investment.investmentType === 'Self') {
            selfInvestmentChartData[month] += investment.amount;
          }
        }
      }
    });

    return { expenseChartData, investmentChartData, selfInvestmentChartData, monthLabels };
  };

  const { expenseChartData, investmentChartData, selfInvestmentChartData, monthLabels } = calculateChartData();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mx-auto mb-4" />
          <p className="text-gray-400">Loading Finance Tracker...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-800 transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-700">
          <h2 className="text-lg font-semibold">Finance Tracker</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={handleLogout}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors text-gray-400 hover:text-red-400"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <nav className="p-4">
          <div className="space-y-2">
            <button
              onClick={() => {setActiveTab('monthly'); setSidebarOpen(false);}}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-left ${activeTab === 'monthly' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-700'}`}
            >
              <Calendar className="w-5 h-5" />
              Monthly View
            </button>
            <button
              onClick={() => {setActiveTab('template'); setSidebarOpen(false);}}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-left ${activeTab === 'template' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-700'}`}
            >
              <Settings className="w-5 h-5" />
              Expense Template
            </button>
            <button
              onClick={() => {setActiveTab('investment-template'); setSidebarOpen(false);}}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-left ${activeTab === 'investment-template' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-700'}`}
            >
              <Settings className="w-5 h-5" />
              Investment Template
            </button>
          </div>
        </nav>
      </div>

      {/* Sidebar overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex-1 lg:ml-0">
        <div className="p-4 sm:p-6">
          {/* Mobile menu button */}
          <div className="lg:hidden mb-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>

          {activeTab === 'template' ? (
            // Central Template Management View
            <div className="max-w-4xl mx-auto">
              <div className="mb-6">
                <h1 className="text-2xl sm:text-3xl font-semibold mb-2">Expense Template Management</h1>
                <p className="text-gray-400">Manage your recurring expense template that will be used across all months</p>
              </div>

              <CentralTemplateManager
                centralTemplate={centralTemplate}
                onUpdateTemplate={handleUpdateCentralTemplate}
                onCreateTemplate={handleCreateCentralTemplate}
              />
            </div>
          ) : activeTab === 'investment-template' ? (
            // Central Investment Template Management View
            <div className="max-w-4xl mx-auto">
              <div className="mb-6">
                <h1 className="text-2xl sm:text-3xl font-semibold mb-2">Investment Template Management</h1>
                <p className="text-gray-400">Manage your recurring investment template that will be used across all months</p>
              </div>

              <CentralInvestmentTemplateManager
                centralInvestmentTemplate={centralInvestmentTemplate}
                onUpdateTemplate={handleUpdateCentralInvestmentTemplate}
                onCreateTemplate={handleCreateCentralInvestmentTemplate}
              />
            </div>
          ) : (
            // Monthly View
            <div className="max-w-7xl mx-auto">
              {/* Header with Month Navigation */}
              <div className="flex items-center justify-between mb-6 sm:mb-8">
                <button
                  onClick={() => navigateMonth('prev')}
                  className="p-2 sm:p-3 hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>

                <div className="text-center flex-1 mx-4">
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-semibold">{formatMonth(currentMonth)}</h1>
                  <button
                    onClick={goToCurrentMonth}
                    className="text-gray-400 text-xs sm:text-sm hover:text-white transition-colors cursor-pointer mt-1"
                  >
                    Go to current month
                  </button>
                </div>

                <button
                  onClick={() => navigateMonth('next')}
                  className="p-2 sm:p-3 hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </div>

              {/* Monthly Fill Section */}
              <div className="bg-gray-800 rounded-lg p-4 sm:p-6 mb-4 sm:mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
                  <div>
                    <h2 className="text-lg sm:text-xl font-semibold">Monthly Template Fill</h2>
                    <p className="text-gray-400 text-sm">Copy your central template to this month&apos;s expenses</p>
                  </div>
                  <button
                    onClick={() => setActiveTab('template')}
                    className="text-blue-400 hover:text-blue-300 text-sm transition-colors flex items-center gap-1"
                  >
                    <Settings className="w-4 h-4" />
                    Manage Expense Template
                  </button>
                </div>

                {centralTemplate && centralTemplate.items.length > 0 ? (
                  <div className="space-y-4">
                    <div className="bg-gray-700 rounded-lg p-3 sm:p-4">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                        <div>
                          <p className="text-gray-400 text-xs sm:text-sm">{centralTemplate.items.length} Template Items</p>
                          <p className="text-blue-400 text-base sm:text-lg font-semibold">
                            {formatINR(centralTemplate.items.reduce((sum, item) => sum + item.amount, 0))}
                          </p>
                          <p className="text-gray-400 text-xs">Will be added to {formatMonth(currentMonth)}</p>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={handleFillExpenses}
                      disabled={loadingExpenses}
                      className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-700/50 disabled:cursor-not-allowed text-white py-2 sm:py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors text-sm sm:text-base"
                    >
                      {loadingExpenses ? (
                        <LoadingSpinner size="sm" />
                      ) : (
                        <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                      )}
                      Fill with Fixed Expenses
                    </button>
                  </div>
                ) : (
                  <div className="text-center text-gray-400 py-6 sm:py-8">
                    <p className="mb-2 text-sm sm:text-base">No central template available</p>
                    <p className="text-xs sm:text-sm mb-4">Create a central template to enable monthly filling</p>
                    <button
                      onClick={() => setActiveTab('template')}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg inline-flex items-center gap-2 transition-colors text-sm"
                    >
                      <Settings className="w-4 h-4" />
                      Create Central Template
                    </button>
                  </div>
                )}
              </div>

              {/* Investment Template Fill Section */}
              <div className="bg-gray-800 rounded-lg p-4 sm:p-6 mb-4 sm:mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
                  <div>
                    <h2 className="text-lg sm:text-xl font-semibold">Investment Template Fill</h2>
                    <p className="text-gray-400 text-sm">Copy your investment template to this month&apos;s investments</p>
                  </div>
                  <button
                    onClick={() => setActiveTab('investment-template')}
                    className="text-blue-400 hover:text-blue-300 text-sm transition-colors flex items-center gap-1"
                  >
                    <Settings className="w-4 h-4" />
                    Manage Investment Template
                  </button>
                </div>

                {centralInvestmentTemplate && centralInvestmentTemplate.items.length > 0 ? (
                  <div className="space-y-4">
                    <div className="bg-gray-700 rounded-lg p-3 sm:p-4">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                        <div>
                          <p className="text-gray-400 text-xs sm:text-sm">{centralInvestmentTemplate.items.length} Investment Items</p>
                          <p className="text-blue-400 text-base sm:text-lg font-semibold">
                            {formatINR(centralInvestmentTemplate.items.reduce((sum, item) => sum + item.amount, 0))}
                          </p>
                          <p className="text-gray-400 text-xs">Will be added to {formatMonth(currentMonth)}</p>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={handleFillInvestments}
                      disabled={loadingInvestments}
                      className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-700/50 disabled:cursor-not-allowed text-white py-2 sm:py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors text-sm sm:text-base"
                    >
                      {loadingInvestments ? (
                        <LoadingSpinner size="sm" />
                      ) : (
                        <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                      )}
                      Fill with Recurring Investments
                    </button>
                  </div>
                ) : (
                  <div className="text-center text-gray-400 py-6 sm:py-8">
                    <p className="mb-2 text-sm sm:text-base">No investment template available</p>
                    <p className="text-xs sm:text-sm mb-4">Create an investment template to enable monthly filling</p>
                    <button
                      onClick={() => setActiveTab('investment-template')}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg inline-flex items-center gap-2 transition-colors text-sm"
                    >
                      <Settings className="w-4 h-4" />
                      Create Investment Template
                    </button>
                  </div>
                )}
              </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Expenses Section */}
          <div className="space-y-4 sm:space-y-6">
            <div className="bg-gray-800 rounded-lg p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-semibold mb-4">Expenses</h2>

              {/* Expenses Summary */}
              <div className="bg-gray-700 rounded-lg p-3 sm:p-4 mb-4">
                <p className="text-gray-400 text-xs sm:text-sm">{formatMonth(currentMonth)} Total</p>
                <p className="text-green-400 text-xl sm:text-2xl font-semibold">{formatINR(totalExpenses)}</p>
                <p className="text-gray-400 text-xs">Total expenses this month</p>
              </div>

              <button
                onClick={() => setShowExpenseForm(true)}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-2 sm:py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors mb-4 sm:mb-6 text-sm sm:text-base"
              >
                <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                Add Expense
              </button>

              {/* Monthly Expenses List */}
              <div className="space-y-2 sm:space-y-3">
                <h3 className="font-medium mb-2 sm:mb-3 text-sm sm:text-base">Monthly Expenses</h3>

                {loadingExpenses ? (
                  <div className="flex items-center justify-center py-8">
                    <LoadingSpinner />
                  </div>
                ) : currentMonthExpenses.length > 0 ? (
                  currentMonthExpenses.map((expense) => (
                    <div key={expense.id} className="flex items-center justify-between p-2 sm:p-3 bg-gray-700 rounded-lg">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-medium text-sm sm:text-base truncate">{expense.name}</p>
                          {expense.sourceType === 'template' && (
                            <span className="text-xs bg-blue-600 text-white px-1.5 sm:px-2 py-0.5 sm:py-1 rounded whitespace-nowrap">
                              Template
                            </span>
                          )}
                        </div>
                        <p className="text-gray-400 text-xs sm:text-sm truncate">{expense.category}</p>
                      </div>
                      <div className="flex items-center gap-2 sm:gap-3 ml-2">
                        <p className="text-green-400 font-semibold text-sm sm:text-base">{formatINR(expense.amount)}</p>
                        <div className="flex gap-1">
                          <button
                            onClick={() => openEditExpenseForm(expense)}
                            className="p-1 hover:bg-gray-600 rounded text-gray-400 hover:text-white transition-colors"
                          >
                            <Edit2 className="w-3 h-3 sm:w-4 sm:h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteExpense(expense.id)}
                            className="p-1 hover:bg-gray-600 rounded text-gray-400 hover:text-red-400 transition-colors"
                          >
                            <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-gray-400 py-6 sm:py-8">
                    <p className="text-sm sm:text-base">No expenses recorded this month</p>
                    <p className="text-xs sm:text-sm mt-1">Add templates above or manual expenses</p>
                  </div>
                )}
              </div>

              {/* Expense Distribution Pie Chart */}
              <div className="mb-6">
                <ExpensePieChart
                  expenses={currentMonthExpenses}
                  monthName={formatMonth(currentMonth)}
                />
              </div>

              {/* Expense Trend Chart */}
              <TrendChart
                data={expenseChartData}
                labels={monthLabels}
                color="#10b981"
                type="expenses"
              />
            </div>
          </div>

          {/* Investments Section */}
          <div className="space-y-4 sm:space-y-6">
            <div className="bg-gray-800 rounded-lg p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-semibold mb-4">Investments</h2>

              {/* Investments Summary */}
              <div className="bg-gray-700 rounded-lg p-3 sm:p-4 mb-4">
                <p className="text-gray-400 text-xs sm:text-sm">{formatMonth(currentMonth)} Investments</p>
                <p className="text-blue-400 text-xl sm:text-2xl font-semibold">{formatINR(totalInvestments)}</p>
                <p className="text-gray-400 text-xs">Total investments this month</p>
              </div>

              <button
                onClick={() => setShowInvestmentForm(true)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 sm:py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors mb-4 sm:mb-6 text-sm sm:text-base"
              >
                <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                Add Investment
              </button>

              {/* Monthly Investments */}
              <div className="space-y-2 sm:space-y-3">
                <h3 className="font-medium mb-2 sm:mb-3 text-sm sm:text-base">Monthly Investments</h3>

                {loadingInvestments ? (
                  <div className="flex items-center justify-center py-8">
                    <LoadingSpinner />
                  </div>
                ) : currentMonthInvestments.length > 0 ? (
                  currentMonthInvestments.map((investment) => (
                    <div key={investment.id} className="flex items-center justify-between p-2 sm:p-3 bg-gray-700 rounded-lg">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-medium text-sm sm:text-base truncate">{investment.name}</p>
                          {investment.sourceType === 'template' && (
                            <span className="text-xs bg-blue-600 text-white px-1.5 sm:px-2 py-0.5 sm:py-1 rounded whitespace-nowrap">
                              Template
                            </span>
                          )}
                          <span className={`text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded whitespace-nowrap ${
                            investment.investmentType === 'Self' ? 'bg-green-600 text-white' :
                            investment.investmentType === 'Combined' ? 'bg-purple-600 text-white' :
                            'bg-gray-600 text-white'
                          }`}>
                            {investment.investmentType || 'Self'}
                          </span>
                        </div>
                        <p className="text-gray-400 text-xs sm:text-sm truncate">{investment.category}</p>
                      </div>
                      <div className="flex items-center gap-2 sm:gap-3 ml-2">
                        <p className="text-blue-400 font-semibold text-sm sm:text-base">{formatINR(investment.amount)}</p>
                        <div className="flex gap-1">
                          <button
                            onClick={() => openEditInvestmentForm(investment)}
                            className="p-1 hover:bg-gray-600 rounded text-gray-400 hover:text-white transition-colors"
                          >
                            <Edit2 className="w-3 h-3 sm:w-4 sm:h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteInvestment(investment.id)}
                            className="p-1 hover:bg-gray-600 rounded text-gray-400 hover:text-red-400 transition-colors"
                          >
                            <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-gray-400 py-6 sm:py-8">
                    <p className="text-sm sm:text-base">No investments recorded this month</p>
                    <p className="text-xs sm:text-sm mt-1">Start tracking your investments</p>
                  </div>
                )}
              </div>

              {/* Investment Type Distribution Pie Chart */}
              <InvestmentPieChart
                investments={currentMonthInvestments}
                monthName={formatMonth(currentMonth)}
              />

              {/* Investment Trend Chart */}
              <TrendChart
                data={investmentChartData}
                labels={monthLabels}
                color="#3b82f6"
                type="investments"
              />

              {/* Self Investment Trend Chart */}
              <SelfInvestmentTrendChart
                data={selfInvestmentChartData}
                labels={monthLabels}
                color="#10b981"
                title="Self Investments"
              />
            </div>
          </div>
        </div>

        {/* Notes Section */}
        <div className="mt-6 sm:mt-8">
          <div className="bg-gray-800 rounded-lg p-4 sm:p-6">
            <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center gap-2">
              📝 Notes - {formatMonth(currentMonth)}
            </h2>
            <textarea
              className="w-full bg-gray-700 rounded-lg p-3 sm:p-4 text-sm sm:text-base text-white placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={4}
              placeholder="Add any miscellaneous notes for this month..."
              value={currentNote}
              onChange={(e) => handleNotesChange(e.target.value)}
            />
          </div>
        </div>
            </div>
          )}

          {/* Form Modals - Available in both views */}
          <ExpenseForm
            isOpen={showExpenseForm}
            onClose={closeExpenseForm}
            onSubmit={editingExpense ?
              (expense) => handleEditExpense(editingExpense.id, expense) :
              handleAddExpense
            }
            editingExpense={editingExpense || undefined}
            currentMonth={currentMonth}
          />

          <InvestmentForm
            isOpen={showInvestmentForm}
            onClose={closeInvestmentForm}
            onSubmit={editingInvestment ?
              (investment) => handleEditInvestment(editingInvestment.id, investment) :
              handleAddInvestment
            }
            editingInvestment={editingInvestment || undefined}
            currentMonth={currentMonth}
          />

          {/* Toast Notification */}
          <Toast
            message={toast.message}
            type={toast.type}
            isVisible={toast.isVisible}
            onClose={() => setToast(prev => ({ ...prev, isVisible: false }))}
          />
        </div>
      </div>
    </div>
  );
}