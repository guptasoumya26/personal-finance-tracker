'use client';

import { Line } from 'react-chartjs-2';
import { formatINR } from '@/utils/currency';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
  Filler,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface TrendChartProps {
  data: number[];
  labels: string[];
  color: string;
  type: 'expenses' | 'investments';
}

export default function TrendChart({ data, labels, color, type }: TrendChartProps) {
  const chartData = {
    labels,
    datasets: [
      {
        label: type === 'expenses' ? 'Monthly Expenses' : 'Monthly Investments',
        data,
        borderColor: color,
        backgroundColor: `${color}20`,
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: color,
        pointBorderColor: color,
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const options: ChartOptions<'line'> = {
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
        borderColor: color,
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          label: function(context) {
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
          callback: function(value) {
            return formatINR(Number(value));
          },
        },
        beginAtZero: true,
      },
    },
    interaction: {
      intersect: false,
      mode: 'index',
    },
    elements: {
      point: {
        hoverBorderWidth: 3,
      },
    },
  };

  const stats = {
    lowest: Math.min(...data),
    highest: Math.max(...data),
    average: data.reduce((sum, val) => sum + val, 0) / data.length,
  };

  return (
    <div className="mt-6">
      <h3 className="font-medium mb-3">
        {type === 'expenses' ? 'Expense' : 'Investment'} Trend - 2025
      </h3>
      <div className="bg-gray-700 rounded-lg p-4 h-48">
        <Line data={chartData} options={options} />
      </div>
      <div className="flex justify-between text-sm text-gray-400 mt-2">
        <span>Lowest: {formatINR(stats.lowest)}</span>
        <span>Highest: {formatINR(stats.highest)}</span>
        <span>Average: {formatINR(stats.average)}</span>
      </div>
    </div>
  );
}