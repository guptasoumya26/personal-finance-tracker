'use client';

import { Check } from 'lucide-react';
import { Expense, Income, Investment, InvestmentType } from '@/types';
import { formatINR } from '@/utils/currency';

interface IncomeExpenseTableProps {
  incomes: Income[];
  expenses: Expense[];
  investments: Investment[];
  monthLabel: string;
}

const INVESTMENT_TYPE_STYLES: Record<InvestmentType, string> = {
  'Self': 'bg-green-600 text-white',
  'Combined': 'bg-purple-600 text-white',
  'One Time': 'bg-amber-600 text-white',
  'Other': 'bg-gray-600 text-white',
};

/**
 * Full-width monthly ledger.
 *
 *   Income | Amount | Expense | Amount | Investment | Amount
 *
 * Every amount column gets its own total on the last row. Entries are marked Done
 * in the Expenses and Investments lists above, so the status here is read-only:
 * a green tick marks a Done entry and nothing in the ledger is clickable.
 *
 * Remaining Income refreshes whenever a Done flag changes:
 *   Total Income - (Done Expenses + Done Investments)
 */
export default function IncomeExpenseTable({
  incomes,
  expenses,
  investments,
  monthLabel,
}: IncomeExpenseTableProps) {
  const totalIncome = incomes.reduce((sum, income) => sum + income.amount, 0);
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const totalInvestments = investments.reduce((sum, investment) => sum + investment.amount, 0);

  const doneExpensesTotal = expenses
    .filter((expense) => expense.isCompleted)
    .reduce((sum, expense) => sum + expense.amount, 0);
  const doneInvestmentsTotal = investments
    .filter((investment) => investment.isCompleted)
    .reduce((sum, investment) => sum + investment.amount, 0);
  const remainingIncome = totalIncome - doneExpensesTotal - doneInvestmentsTotal;

  // Read-only info: what is left if EVERY expense and investment is paid for,
  // settled or not. Refreshes with any change to income, expenses or investments.
  const extraSavings = totalIncome - totalExpenses - totalInvestments;

  const rowCount = Math.max(incomes.length, expenses.length, investments.length);
  const isEmpty = rowCount === 0;

  // Read-only status symbol: a green tick once the entry has been marked Done,
  // otherwise an empty slot so the names stay aligned.
  const StatusMark = ({ done }: { done: boolean }) => (
    <span className="shrink-0 w-5 h-5 flex items-center justify-center">
      {done ? (
        <span className="w-5 h-5 rounded bg-green-600 text-white flex items-center justify-center">
          <Check className="w-3.5 h-3.5" />
          <span className="sr-only">Done</span>
        </span>
      ) : null}
    </span>
  );

  return (
    <div className="bg-gray-800 rounded-lg p-4 sm:p-6">
      <div className="mb-4">
        <h2 className="text-lg sm:text-xl font-semibold">Income &amp; Expense Ledger</h2>
        <p className="text-gray-400 text-xs sm:text-sm">{monthLabel}</p>
      </div>

      <div className="overflow-hidden">
        <table className="w-full table-fixed border-separate border-spacing-0 text-sm">
          <thead>
            <tr>
              <th className="text-left text-xs font-medium uppercase tracking-wide text-gray-400 border-b border-gray-600 pb-2 pr-2">
                Income
              </th>
              <th className="text-right text-xs font-medium uppercase tracking-wide text-gray-400 border-b border-gray-600 pb-2 px-1.5 sm:px-3 w-20 sm:w-28">
                Amount
              </th>
              <th className="text-left text-xs font-medium uppercase tracking-wide text-gray-400 border-b border-gray-600 pb-2 pl-2 sm:pl-5 pr-2 border-l border-gray-700/60">
                Expense
              </th>
              <th className="text-right text-xs font-medium uppercase tracking-wide text-gray-400 border-b border-gray-600 pb-2 px-1.5 sm:px-3 w-20 sm:w-28">
                Amount
              </th>
              <th className="text-left text-xs font-medium uppercase tracking-wide text-gray-400 border-b border-gray-600 pb-2 pl-2 sm:pl-5 pr-2 border-l border-gray-700/60">
                Investment
              </th>
              <th className="text-right text-xs font-medium uppercase tracking-wide text-gray-400 border-b border-gray-600 pb-2 px-1.5 sm:px-3 w-20 sm:w-28">
                Amount
              </th>
            </tr>
          </thead>

          <tbody>
            {isEmpty ? (
              <tr>
                <td colSpan={6} className="py-6 text-center text-gray-400">
                  No income, expenses or investments recorded for {monthLabel}
                </td>
              </tr>
            ) : (
              Array.from({ length: rowCount }, (_, index) => {
                const income = incomes[index];
                const expense = expenses[index];
                const investment = investments[index];
                const expenseDone = Boolean(expense?.isCompleted);
                const investmentDone = Boolean(investment?.isCompleted);

                return (
                  <tr key={index}>
                    {/* Income */}
                    <td className="py-2 pr-2 align-middle">
                      {income ? <span className="text-white break-words">{income.source}</span> : null}
                    </td>
                    <td className="py-2 px-1.5 sm:px-3 align-middle text-right">
                      {income ? <span className="text-green-400">{formatINR(income.amount)}</span> : null}
                    </td>

                    {/* Expense */}
                    <td className="py-2 pl-2 sm:pl-5 pr-2 align-middle border-l border-gray-700/60">
                      {expense ? (
                        <div className="flex items-start gap-2">
                          <StatusMark done={expenseDone} />
                          <div className="min-w-0">
                            <p className={`break-words ${expenseDone ? 'line-through text-gray-400' : 'text-white'}`}>
                              {expense.name}
                            </p>
                            <p className="text-xs text-gray-500 break-words hidden sm:block">{expense.category}</p>
                          </div>
                        </div>
                      ) : null}
                    </td>
                    <td className="py-2 px-1.5 sm:px-3 align-middle text-right">
                      {expense ? (
                        <span className={expenseDone ? 'line-through text-gray-500' : 'text-blue-400'}>
                          {formatINR(expense.amount)}
                        </span>
                      ) : null}
                    </td>

                    {/* Investment */}
                    <td className="py-2 pl-2 sm:pl-5 pr-2 align-middle border-l border-gray-700/60">
                      {investment ? (
                        <div className="flex items-start gap-2">
                          <StatusMark done={investmentDone} />
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p
                                className={`break-words ${
                                  investmentDone ? 'line-through text-gray-400' : 'text-white'
                                }`}
                              >
                                {investment.name}
                              </p>
                              <span
                                className={`text-xs px-1.5 py-0.5 rounded whitespace-nowrap hidden sm:inline ${
                                  INVESTMENT_TYPE_STYLES[investment.investmentType] || INVESTMENT_TYPE_STYLES['Other']
                                }`}
                              >
                                {investment.investmentType || 'Self'}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500 break-words hidden sm:block">{investment.category}</p>
                          </div>
                        </div>
                      ) : null}
                    </td>
                    <td className="py-2 px-1.5 sm:px-3 align-middle text-right">
                      {investment ? (
                        <span className={investmentDone ? 'line-through text-gray-500' : 'text-violet-400'}>
                          {formatINR(investment.amount)}
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
              <td className="pt-3 pr-2 text-xs font-medium uppercase tracking-wide text-gray-400">Total Income</td>
              <td className="pt-3 px-1.5 sm:px-3 text-right font-semibold text-green-400">
                {formatINR(totalIncome)}
              </td>
              <td className="pt-3 pl-2 sm:pl-5 pr-2 text-xs font-medium uppercase tracking-wide text-gray-400 border-l border-gray-700/60">
                Total Expenses
              </td>
              <td className="pt-3 px-1.5 sm:px-3 text-right font-semibold text-blue-400">
                {formatINR(totalExpenses)}
              </td>
              <td className="pt-3 pl-2 sm:pl-5 pr-2 text-xs font-medium uppercase tracking-wide text-gray-400 border-l border-gray-700/60">
                Total Investments
              </td>
              <td className="pt-3 px-1.5 sm:px-3 text-right font-semibold text-violet-400">
                {formatINR(totalInvestments)}
              </td>
            </tr>

            {/* Live balance row - refreshes whenever a Done flag changes */}
            <tr>
              <td colSpan={6} className="pt-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-4 rounded-lg border border-purple-500/30 bg-gradient-to-r from-purple-900/30 to-blue-900/30 px-3 py-2">
                  <span className="text-sm font-semibold text-purple-300">Remaining Income</span>
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 sm:justify-end">
                    <span className="text-xs text-gray-400">
                      Total Income − Done Expenses ({formatINR(doneExpensesTotal)}) − Done Investments (
                      {formatINR(doneInvestmentsTotal)})
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

            {/* Read-only info: everything paid for -- always shown, never clickable */}
            <tr>
              <td colSpan={6} className="pt-2">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-4 rounded-lg border border-emerald-500/30 bg-gradient-to-r from-emerald-900/30 to-teal-900/30 px-3 py-2">
                  <span className="text-sm font-semibold text-emerald-300">Extra Savings Opportunity</span>
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 sm:justify-end">
                    <span className="text-xs text-gray-400">
                      Total Income − All Expenses ({formatINR(totalExpenses)}) − All Investments (
                      {formatINR(totalInvestments)})
                    </span>
                    <span
                      className={`text-lg font-bold whitespace-nowrap ${
                        extraSavings >= 0 ? 'text-emerald-400' : 'text-red-400'
                      }`}
                    >
                      {formatINR(extraSavings)}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1 sm:text-right">
                  {extraSavings >= 0
                    ? 'What is left if every expense and investment for the month is paid for.'
                    : 'Short by this much if every expense and investment for the month is paid for.'}
                </p>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      <p className="text-xs text-gray-400 italic mt-3">
        Mark entries Done in the Expenses and Investments lists above — this ledger updates automatically.
      </p>
    </div>
  );
}
