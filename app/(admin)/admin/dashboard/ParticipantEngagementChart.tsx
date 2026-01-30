'use client';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Legend,
  Tooltip,
  type ChartOptions,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Legend,
  Tooltip
);

export type WeeklyEngagementPoint = {
  weekLabel: string;
  registered: number;
  active: number;
};

type ParticipantEngagementChartProps = {
  data: WeeklyEngagementPoint[];
};

const options: ChartOptions<'line'> = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: {
    mode: 'index',
    intersect: false,
  },
  plugins: {
    legend: {
      position: 'bottom',
      labels: {
        usePointStyle: true,
      },
    },
    tooltip: {
      mode: 'index',
      intersect: false,
    },
  },
  scales: {
    x: {
      grid: { display: false },
    },
    y: {
      beginAtZero: true,
      grid: { color: 'rgba(0,0,0,0.06)' },
    },
  },
};

export function ParticipantEngagementChart({ data }: ParticipantEngagementChartProps) {
  const labels = data.map((d) => d.weekLabel);
  const registeredValues = data.map((d) => d.registered);
  const activeValues = data.map((d) => d.active);

  const chartData = {
    labels,
    datasets: [
      {
        label: 'All Registered',
        data: registeredValues,
        borderColor: '#9ca3af',
        backgroundColor: 'rgba(156, 163, 175, 0.18)',
        fill: 'origin',
        tension: 0.35,
        pointRadius: 3,
        borderWidth: 2,
        order: 2,
      },
      {
        label: 'Active Participants',
        data: activeValues,
        borderColor: '#ffcc00',
        backgroundColor: 'rgba(255, 204, 0, 0.22)',
        fill: 'origin',
        tension: 0.35,
        pointRadius: 3,
        borderWidth: 2,
        order: 1,
      },
    ],
  };

  return (
    <div className="h-[320px] w-full">
      <Line data={chartData} options={options} />
    </div>
  );
}
