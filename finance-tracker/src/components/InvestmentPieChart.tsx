import { useRef } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, defaults } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import { Investment } from '@/types';
import { formatINR } from '@/utils/currency';

ChartJS.register(ArcElement, Tooltip, Legend);

// Set global Chart.js defaults for better text visibility
defaults.color = '#FFFFFF';

interface InvestmentPieChartProps {
  investments: Investment[];
  monthName: string;
}

export default function InvestmentPieChart({ investments, monthName }: InvestmentPieChartProps) {
  const chartRef = useRef(null);

  // Aggregate investments by investment type (Self, Combined, Other)
  const aggregateByType = () => {
    const typeTotals: Record<string, number> = {
      'Self': 0,
      'Combined': 0,
      'Other': 0
    };

    investments.forEach(investment => {
      const type = investment.investmentType || 'Self';
      typeTotals[type] += investment.amount;
    });

    return typeTotals;
  };

  const typeTotals = aggregateByType();

  // Filter out zero values and prepare data
  const labels: string[] = [];
  const dataValues: number[] = [];
  const colors: string[] = [];

  const colorMap: Record<string, string> = {
    'Self': '#10B981',      // Green
    'Combined': '#8B5CF6',  // Purple
    'Other': '#6B7280'      // Gray
  };

  Object.entries(typeTotals).forEach(([type, amount]) => {
    if (amount > 0) {
      labels.push(type);
      dataValues.push(amount);
      colors.push(colorMap[type] || '#6B7280');
    }
  });

  const data = {
    labels: labels,
    datasets: [
      {
        data: dataValues,
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
            size: 14,
          },
          padding: 15,
          generateLabels: (chart: any) => {
            const data = chart.data;
            if (data.labels.length && data.datasets.length) {
              return data.labels.map((label: string, i: number) => {
                const value = data.datasets[0].data[i];
                return {
                  text: `${label}: ${formatINR(value)}`,
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
            const label = context.chart.data.labels[context.dataIndex];
            return `${label}: ${formatINR(value)} (${percentage}%)`;
          }
        }
      }
    },
  };

  if (investments.length === 0) {
    return (
      <div className="bg-gray-800 rounded-lg p-6 h-80 flex items-center justify-center">
        <p className="text-gray-400 text-center">
          No investments recorded for {monthName}.<br />
          Add some investments to see the type distribution chart.
        </p>
      </div>
    );
  }

  if (dataValues.length === 0) {
    return (
      <div className="bg-gray-800 rounded-lg p-6 h-80 flex items-center justify-center">
        <p className="text-gray-400 text-center">
          No investment data available for {monthName}.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6 mb-6">
      <h3 className="text-lg font-semibold mb-4 text-center">
        Investment Type Distribution - {monthName}
      </h3>
      <div className="h-80">
        <Pie ref={chartRef} data={data} options={options} />
      </div>
      <div className="mt-4 text-sm text-gray-400 text-center">
        Total: {formatINR(investments.reduce((sum, investment) => sum + investment.amount, 0))}
      </div>
    </div>
  );
}
