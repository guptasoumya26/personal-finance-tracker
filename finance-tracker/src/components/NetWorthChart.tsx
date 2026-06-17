'use client';

import { useState, useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { formatINR } from '@/utils/currency';
import { NetWorthEntry } from '@/types';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface NetWorthChartProps {
  entries: NetWorthEntry[];
}

const WINDOW_SIZE = 6;
const COLOR = '#8b5cf6';

export default function NetWorthChart({ entries }: NetWorthChartProps) {
  const [offset, setOffset] = useState(0);

  const sorted = useMemo(
    () => [...entries].sort((a, b) => a.month.getTime() - b.month.getTime()),
    [entries]
  );

  const total = sorted.length;
  const endIndex = total - offset;
  const startIndex = Math.max(0, endIndex - WINDOW_SIZE);
  const visible = sorted.slice(startIndex, endIndex);

  const canGoOlder = startIndex > 0;
  const canGoNewer = offset > 0;

  const labels = visible.map((entry) =>
    entry.month.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
  );
  const data = visible.map((entry) => entry.amount);

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Net Worth',
        data,
        backgroundColor: `${COLOR}80`,
        borderColor: COLOR,
        borderWidth: 2,
        borderRadius: 4,
      },
    ],
  };

  const options: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: '#1f2937',
        titleColor: '#f9fafb',
        bodyColor: '#f9fafb',
        borderColor: COLOR,
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          label: function (context) {
            return formatINR(context.parsed.y);
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          color: '#374151',
        },
        ticks: {
          color: '#9ca3af',
          font: {
            size: 12,
          },
        },
      },
      y: {
        grid: {
          color: '#374151',
        },
        ticks: {
          color: '#9ca3af',
          font: {
            size: 12,
          },
          callback: function (value) {
            return formatINR(Number(value));
          },
        },
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-medium">Net Worth Tracker</h3>
        {total > WINDOW_SIZE && (
          <div className="flex items-center gap-1">
            <button
              onClick={() => setOffset((o) => Math.min(o + 1, Math.max(total - WINDOW_SIZE, 0)))}
              disabled={!canGoOlder}
              className="p-1 rounded hover:bg-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              aria-label="Show older months"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setOffset((o) => Math.max(o - 1, 0))}
              disabled={!canGoNewer}
              className="p-1 rounded hover:bg-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              aria-label="Show newer months"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {visible.length > 0 ? (
        <div className="bg-gray-700 rounded-lg p-4 h-48">
          <Bar data={chartData} options={options} />
        </div>
      ) : (
        <div className="bg-gray-700 rounded-lg p-4 text-center text-gray-400 text-sm">
          No net worth entries yet. Add your first one above.
        </div>
      )}
    </div>
  );
}
