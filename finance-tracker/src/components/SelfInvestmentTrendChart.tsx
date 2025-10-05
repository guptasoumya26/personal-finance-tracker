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
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface SelfInvestmentTrendChartProps {
  data: number[];
  labels: string[];
  color: string;
  title: string;
}

export default function SelfInvestmentTrendChart({ data, labels, color, title }: SelfInvestmentTrendChartProps) {
  const chartData = {
    labels,
    datasets: [
      {
        label: title,
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
          display: false,
        },
        ticks: {
          color: '#9ca3af',
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: '#374151',
        },
        ticks: {
          color: '#9ca3af',
          callback: function(value) {
            return formatINR(value as number);
          },
        },
      },
    },
  };

  // Calculate statistics
  const validData = data.filter((val) => val > 0);
  const lowestValue = validData.length > 0 ? Math.min(...validData) : 0;
  const highestValue = validData.length > 0 ? Math.max(...validData) : 0;
  const averageValue = validData.length > 0 ? validData.reduce((sum, val) => sum + val, 0) / validData.length : 0;

  return (
    <div className="bg-gray-800 rounded-lg p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base sm:text-lg font-semibold">{title} Trend</h3>
      </div>

      <div className="h-64 mb-4">
        <Line data={chartData} options={options} />
      </div>

      {validData.length > 0 && (
        <div className="grid grid-cols-3 gap-3 sm:gap-4 text-center">
          <div className="bg-gray-700 rounded-lg p-2 sm:p-3">
            <p className="text-gray-400 text-xs sm:text-sm mb-1">Lowest</p>
            <p style={{ color }} className="font-semibold text-sm sm:text-base">
              {formatINR(lowestValue)}
            </p>
          </div>
          <div className="bg-gray-700 rounded-lg p-2 sm:p-3">
            <p className="text-gray-400 text-xs sm:text-sm mb-1">Highest</p>
            <p style={{ color }} className="font-semibold text-sm sm:text-base">
              {formatINR(highestValue)}
            </p>
          </div>
          <div className="bg-gray-700 rounded-lg p-2 sm:p-3">
            <p className="text-gray-400 text-xs sm:text-sm mb-1">Average</p>
            <p style={{ color }} className="font-semibold text-sm sm:text-base">
              {formatINR(averageValue)}
            </p>
          </div>
        </div>
      )}

      {validData.length === 0 && (
        <div className="text-center text-gray-400 py-4">
          <p className="text-xs sm:text-sm">No data available for {title.toLowerCase()}</p>
        </div>
      )}
    </div>
  );
}
