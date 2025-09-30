import { useEffect, useRef } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, defaults } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import { Expense } from '@/types';
import { formatINR } from '@/utils/currency';

ChartJS.register(ArcElement, Tooltip, Legend);

// Set global Chart.js defaults for better text visibility
defaults.color = '#FFFFFF';

interface ExpensePieChartProps {
  expenses: Expense[];
  monthName: string;
}

export default function ExpensePieChart({ expenses, monthName }: ExpensePieChartProps) {
  const chartRef = useRef(null);

  // Generate colors for pie chart segments
  const generateColors = (count: number) => {
    const colors = [
      '#3B82F6', // Blue
      '#EF4444', // Red
      '#10B981', // Green
      '#F59E0B', // Yellow
      '#8B5CF6', // Purple
      '#F97316', // Orange
      '#06B6D4', // Cyan
      '#84CC16', // Lime
      '#F43F5E', // Rose
      '#6366F1', // Indigo
      '#14B8A6', // Teal
      '#A855F7', // Violet
    ];

    const result = [];
    for (let i = 0; i < count; i++) {
      result.push(colors[i % colors.length]);
    }
    return result;
  };

  // Prepare data for pie chart - sorted by amount (highest first)
  const sortedExpenses = [...expenses].sort((a, b) => b.amount - a.amount);
  const colors = generateColors(sortedExpenses.length);

  const data = {
    labels: sortedExpenses.map(expense => expense.name),
    datasets: [
      {
        data: sortedExpenses.map(expense => expense.amount),
        backgroundColor: colors,
        borderColor: colors.map(color => color),
        borderWidth: 2,
        hoverBorderWidth: 3,
        hoverOffset: 8,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          color: '#FFFFFF',
          font: {
            size: 12,
          },
          padding: 15,
          generateLabels: (chart: any) => {
            const data = chart.data;
            if (data.labels.length && data.datasets.length) {
              return data.labels.map((label: string, i: number) => {
                const value = data.datasets[0].data[i];
                // Truncate long labels but show full text in tooltip
                const displayLabel = label.length > 20 ? `${label.substring(0, 17)}...` : label;
                return {
                  text: `${displayLabel}: ${formatINR(value)}`,
                  fillStyle: data.datasets[0].backgroundColor[i],
                  strokeStyle: data.datasets[0].borderColor[i],
                  lineWidth: data.datasets[0].borderWidth,
                  fontColor: '#FFFFFF',
                  hidden: false,
                  index: i,
                };
              });
            }
            return [];
          },
        },
      },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.95)',
        titleColor: '#F9FAFB',
        bodyColor: '#F9FAFB',
        borderColor: '#374151',
        borderWidth: 1,
        callbacks: {
          label: function(context: any) {
            const value = context.parsed;
            const total = context.dataset.data.reduce((sum: number, val: number) => sum + val, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            // Show full label in tooltip (not truncated)
            const fullLabel = context.chart.data.labels[context.dataIndex];
            return `${fullLabel}: ${formatINR(value)} (${percentage}%)`;
          }
        }
      }
    },
  };

  if (expenses.length === 0) {
    return (
      <div className="bg-gray-800 rounded-lg p-6 h-80 flex items-center justify-center">
        <p className="text-gray-400 text-center">
          No expenses recorded for {monthName}.<br />
          Add some expenses to see the distribution chart.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h3 className="text-lg font-semibold mb-4 text-center">
        Expense Distribution - {monthName}
      </h3>
      <div className="h-80">
        <Pie ref={chartRef} data={data} options={options} />
      </div>
      <div className="mt-4 text-sm text-gray-400 text-center">
        Total: {formatINR(expenses.reduce((sum, expense) => sum + expense.amount, 0))}
      </div>
    </div>
  );
}