'use client';

import { useState, useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import { ChevronLeft, ChevronRight, ArrowRight, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { formatINR, numberToIndianWords } from '@/utils/currency';
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
  Plugin,
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

// Compact INR for tight on-bar labels: ₹1.2Cr, ₹80L, ₹9.5k, ₹500
function compactINR(amount: number): string {
  const sign = amount < 0 ? '-' : '';
  const abs = Math.abs(amount);
  if (abs >= 1_00_00_000) return `${sign}₹${(abs / 1_00_00_000).toFixed(2).replace(/\.?0+$/, '')}Cr`;
  if (abs >= 1_00_000) return `${sign}₹${(abs / 1_00_000).toFixed(2).replace(/\.?0+$/, '')}L`;
  if (abs >= 1_000) return `${sign}₹${(abs / 1_000).toFixed(1).replace(/\.?0+$/, '')}k`;
  return `${sign}₹${abs}`;
}

// Draws the value above each bar so it's always visible (not only on hover)
const valueLabelPlugin: Plugin<'bar'> = {
  id: 'valueLabel',
  afterDatasetsDraw(chart) {
    const { ctx } = chart;
    const meta = chart.getDatasetMeta(0);
    ctx.save();
    ctx.font = '600 11px system-ui, sans-serif';
    ctx.fillStyle = '#e5e7eb';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    meta.data.forEach((bar, i) => {
      const value = chart.data.datasets[0].data[i] as number;
      if (value == null) return;
      ctx.fillText(compactINR(value), bar.x, bar.y - 6);
    });
    ctx.restore();
  },
};

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

  const labels: string[] = visible.map((entry) =>
    entry.month.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
  );
  const data: (number | null)[] = visible.map((entry) => entry.amount);

  // Always render WINDOW_SIZE (6) slots so bars keep a consistent sleek width.
  // With fewer months, real bars fill the first slots and the rest stay empty.
  while (labels.length < WINDOW_SIZE) {
    labels.push(' '.repeat(labels.length + 1)); // unique blank placeholder slot
    data.push(null);
  }

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
        // Sleek bars: cap width and keep a slim footprint
        maxBarThickness: 44,
        categoryPercentage: 0.6,
        barPercentage: 0.7,
      },
    ],
  };

  const options: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      // Headroom so the top value label isn't clipped
      padding: { top: 22 },
    },
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
          <Bar data={chartData} options={options} plugins={[valueLabelPlugin]} />
        </div>
      ) : (
        <div className="bg-gray-700 rounded-lg p-4 text-center text-gray-400 text-sm">
          No net worth entries yet. Add your first one above.
        </div>
      )}

      {sorted.length >= 2 && <NetWorthComparator entries={sorted} />}
    </div>
  );
}

// ---- Comparison calculator ----------------------------------------------

function NetWorthComparator({ entries }: { entries: NetWorthEntry[] }) {
  // entries are sorted ascending. Default: earliest vs latest.
  const [fromIdx, setFromIdx] = useState(0);
  const [toIdx, setToIdx] = useState(entries.length - 1);

  const monthLabel = (e: NetWorthEntry) =>
    e.month.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

  const from = entries[fromIdx];
  const to = entries[toIdx];
  const diff = to.amount - from.amount;
  const pct = from.amount !== 0 ? (diff / Math.abs(from.amount)) * 100 : null;

  const direction = diff > 0 ? 'increased' : diff < 0 ? 'decreased' : 'stayed the same';
  const accent =
    diff > 0 ? 'text-green-400' : diff < 0 ? 'text-red-400' : 'text-gray-400';
  const DirIcon = diff > 0 ? TrendingUp : diff < 0 ? TrendingDown : Minus;

  return (
    <div className="mt-4 bg-gray-700 rounded-lg p-4">
      <h4 className="font-medium text-sm mb-3">Compare Net Worth</h4>

      <div className="flex items-center gap-2 mb-4">
        <select
          value={fromIdx}
          onChange={(e) => setFromIdx(Number(e.target.value))}
          className="flex-1 bg-gray-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {entries.map((e, i) => (
            <option key={e.id} value={i}>
              {monthLabel(e)}
            </option>
          ))}
        </select>
        <ArrowRight className="w-4 h-4 text-gray-400 shrink-0" />
        <select
          value={toIdx}
          onChange={(e) => setToIdx(Number(e.target.value))}
          className="flex-1 bg-gray-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {entries.map((e, i) => (
            <option key={e.id} value={i}>
              {monthLabel(e)}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="bg-gray-800 rounded-lg px-3 py-2">
          <p className="text-xs text-gray-400">{monthLabel(from)}</p>
          <p className="text-base font-semibold">{formatINR(from.amount)}</p>
        </div>
        <div className="bg-gray-800 rounded-lg px-3 py-2">
          <p className="text-xs text-gray-400">{monthLabel(to)}</p>
          <p className="text-base font-semibold">{formatINR(to.amount)}</p>
        </div>
      </div>

      <div className="flex items-start gap-2 text-sm">
        <DirIcon className={`w-4 h-4 mt-0.5 shrink-0 ${accent}`} />
        <p className="text-gray-300">
          Your net worth in <span className="font-medium text-white">{monthLabel(to)}</span>{' '}
          <span className={`font-semibold ${accent}`}>{direction}</span>
          {diff !== 0 && (
            <>
              {' '}by <span className={`font-semibold ${accent}`}>{formatINR(Math.abs(diff))}</span>
              {' '}<span className={accent}>({numberToIndianWords(diff)})</span>
              {pct !== null && (
                <span className={accent}> ({diff > 0 ? '+' : '-'}{Math.abs(pct).toFixed(1)}%)</span>
              )}
            </>
          )}{' '}
          compared to <span className="font-medium text-white">{monthLabel(from)}</span>.
        </p>
      </div>
    </div>
  );
}
