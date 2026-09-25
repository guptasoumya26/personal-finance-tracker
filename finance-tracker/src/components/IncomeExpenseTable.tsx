'use client';

import { useState } from 'react';
import { Check } from 'lucide-react';
import { Expense, Income } from '@/types';
import { formatINR } from '@/utils/currency';

interface IncomeExpenseTableProps {
  incomes: Income[];
  expenses: Expense[];
  monthLabel: string;
  onToggleExpenseDone: (id: string) => Promise<void> | void;
}

/**
 * Side-by-side income / expense ledger for the selected month.
 *
 * Column 1: income entry   Column 2: income amount (total on the last row)
 * Column 3: expense entry  Column 4: expense amount (total on the last row)
 *
 * Each expense has a Done checkbox. Marking an expense Done refreshes the
 * single live "Remaining Income" row = Total Income - expenses marked Done.
 */
export default function IncomeExpenseTable({
  incomes,
  expenses,
  monthLabel,
  onToggleExpenseDone,
}: IncomeExpenseTableProps) {
  const [pendingIds, setPendingIds] = useState<string[]>([]);

  const totalIncome = incomes.reduce((sum, income) => sum + income.amount, 0);
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const doneExpenses = expenses.filter((expense) => expense.isCompleted);
  const doneTotal = doneExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const remainingIncome = totalIncome - doneTotal;

  const rowCount = Math.max(incomes.length, expenses.length);
  const isEmpty = rowCount === 0;

  const handleToggleDone = async (id: string) => {
    if (pendingIds.includes(id)) return;
    setPendingIds((prev) => [...prev, id]);
    try {
      await onToggleExpenseDone(id);
    } finally {
      setPendingIds((prev) => prev.filter((pendingId) => pendingId !== id));
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-4 sm:p-6">
      <div className="mb-4">
        <h3 className="text-base sm:text-lg font-semibold">Income & Expense Ledger</h3>
        <p className="text-gray-400 text-xs sm:text-sm">{monthLabel}</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[400px] border-separate border-spacing-0 text-sm">
          <thead>
            <tr>
              <th className="text-left text-xs font-medium uppercase tracking-wide text-gray-400 border-b border-gray-600 pb-2 pr-3">
                Income
              </th>
              <th className="text-right text-xs font-medium uppercase tracking-wide text-gray-400 border-b border-gray-600 pb-2 px-3 w-24">
                Amount
              </th>
              <th className="text-left text-xs font-medium uppercase tracking-wide text-gray-400 border-b border-gray-600 pb-2 pl-3 sm:pl-6 pr-3">
                Expense
              </th>
              <th className="text-right text-xs font-medium uppercase tracking-wide text-gray-400 border-b border-gray-600 pb-2 px-3 w-24">
                Amount
              </th>
            </tr>
          </thead>

          <tbody>
            {isEmpty ? (
              <tr>
                <td colSpan={4} className="py-6 text-center text-gray-400">
                  No income or expenses recorded for {monthLabel}
                </td>
              </tr>
            ) : (
              Array.from({ length: rowCount }, (_, index) => {
                const income = incomes[index];
                const expense = expenses[index];
                const isDone = Boolean(expense?.isCompleted);
                const isPending = expense ? pendingIds.includes(expense.id) : false;

                return (
                  <tr key={index}>
                    <td className="py-2 pr-3 align-middle">
                      {income ? (
                        <span className="text-white">{income.source}</span>
                      ) : null}
                    </td>
                    <td className="py-2 px-3 align-middle text-right">
                      {income ? (
                        <span className="text-green-400">{formatINR(income.amount)}</span>
                      ) : null}
                    </td>
                    <td className="py-2 pl-3 sm:pl-6 pr-3 align-middle border-l border-gray-700/60">
                      {expense ? (
                        <div className="flex items-center gap-2 min-w-0">
                          <button
                            onClick={() => handleToggleDone(expense.id)}
                            disabled={isPending}
                            aria-pressed={isDone}
                            aria-label={`${isDone ? 'Undo' : 'Mark'} ${expense.name} ${isDone ? '' : 'as done'}`.trim()}
                            title={isDone ? 'Mark as not done' : 'Mark as done'}
                            className={`shrink-0 w-5 h-5 rounded border flex items-center justify-center transition-colors disabled:opacity-50 ${
                              isDone
                                ? 'bg-green-600 border-green-600 text-white hover:bg-green-700'
                                : 'border-gray-500 text-transparent hover:border-green-500 hover:text-green-500/40'
                            }`}
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <div className="min-w-0">
                            <p className={`truncate ${isDone ? 'line-through text-gray-400' : 'text-white'}`}>
                              {expense.name}
                            </p>
                            <p className="text-xs text-gray-500 truncate">{expense.category}</p>
                          </div>
                        </div>
                      ) : null}
                    </td>
                    <td className="py-2 px-3 align-middle text-right">
                      {expense ? (
                        <span className={isDone ? 'line-through text-gray-500' : 'text-blue-400'}>
                          {formatINR(expense.amount)}
                        </span>
                      ) : null}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>

          <tfoot>
            {/* Totals - last row of each amount column */}
            <tr>
              <td className="pt-3 pr-3 text-xs font-medium uppercase tracking-wide text-gray-400">
                Total Income
              </td>
              <td className="pt-3 px-3 text-right font-semibold text-green-400 whitespace-nowrap">
                {formatINR(totalIncome)}
              </td>
              <td className="pt-3 pl-3 sm:pl-6 pr-3 text-xs font-medium uppercase tracking-wide text-gray-400 border-l border-gray-700/60">
                Total Expenses
              </td>
              <td className="pt-3 px-3 text-right font-semibold text-blue-400 whitespace-nowrap">
                {formatINR(totalExpenses)}
              </td>
            </tr>

            {/* Live balance row - refreshes whenever an expense is marked done/undone */}
            <tr>
              <td colSpan={4} className="pt-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-4 rounded-lg border border-purple-500/30 bg-gradient-to-r from-purple-900/30 to-blue-900/30 px-3 py-2">
                  <span className="text-sm font-semibold text-purple-300">Remaining Income</span>
                  <div className="flex items-baseline gap-3">
                    <span className="text-xs text-gray-400">
                      Total Income − Done Expenses ({formatINR(doneTotal)})
                    </span>
                    <span
                      className={`text-lg font-bold whitespace-nowrap ${
                        remainingIncome >= 0 ? 'text-purple-400' : 'text-red-400'
                      }`}
                    >
                      {formatINR(remainingIncome)}
                    </span>
                  </div>
                </div>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      <p className="text-xs text-gray-400 italic mt-3">
        Tick an expense to mark it Done (click again to undo). Remaining Income recalculates as you go.
      </p>
    </div>
  );
}
