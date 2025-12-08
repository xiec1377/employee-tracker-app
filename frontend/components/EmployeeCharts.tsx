'use client';

import { Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { employees } from '@/data/empoyeesMockData';
import { StatPill } from './StatPill';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

export default function EmployeeCharts() {
  const departmentCounts: Record<string, number> = {};
  employees.forEach((emp) => {
    departmentCounts[emp.department] = (departmentCounts[emp.department] || 0) + 1;
  });

  const statusCounts: Record<string, number> = {};
  employees.forEach((emp) => {
    statusCounts[emp.status] = (statusCounts[emp.status] || 0) + 1;
  });

  const totalEmployees = employees.length;

  const barData = {
    labels: Object.keys(departmentCounts),
    datasets: [
      {
        label: 'Employees',
      data: Object.values(departmentCounts),
        backgroundColor: '#6366f1',
        borderRadius: 8,
        borderSkipped: false,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false as const,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        displayColors: false,
        backgroundColor: 'rgba(24, 24, 27, 0.9)',
        borderColor: 'rgba(63, 63, 70, 0.8)',
        borderWidth: 1,
        padding: 10,
        titleFont: {
          size: 13,
        },
        bodyFont: {
          size: 12,
        },
      },
      title: {
        display: false,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#6b7280',
        },
      },
      y: {
        grid: {
          color: 'rgba(148, 163, 184, 0.2)',
        },
        ticks: {
          precision: 0,
          color: '#6b7280',
        },
      },
    },
  };

  const donutData = {
    labels: Object.keys(statusCounts),
    datasets: [
      {
        label: 'Employee Status',
        data: Object.values(statusCounts),
        backgroundColor: ['#3b82f6', '#6366f1', '#8b5cf6', '#a855f7'],
        borderWidth: 2,
        borderColor: '#020617',
        hoverOffset: 6,
      },
    ],
  };

  const donutOptions = {
    responsive: true,
    maintainAspectRatio: false as const,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        displayColors: false,
        backgroundColor: 'rgba(24, 24, 27, 0.9)',
        borderColor: 'rgba(63, 63, 70, 0.8)',
        borderWidth: 1,
        padding: 10,
        titleFont: {
          size: 13,
        },
        bodyFont: {
          size: 12,
        },
      },
      cutout: '70%',
    },
  };

  const totalStatus = Object.values(statusCounts).reduce((a, b) => a + b, 0);

  return (
    <div className="w-full space-y-6 rounded-2xl border border-zinc-200 bg-gradient-to-b from-white via-white to-zinc-50 p-6 shadow-sm dark:border-zinc-800 dark:from-zinc-950 dark:via-zinc-950 dark:to-zinc-900">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
            Employee Overview
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Snapshot of headcount by department and employment status.
          </p>
        </div>

        <div>
          <StatPill label="Total" value={totalEmployees} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="relative overflow-hidden rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-indigo-500/10" />
          <div className="relative flex items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                Employees by Department
              </h2>
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                Distribution of employees across teams.
              </p>
            </div>
          </div>
          <div className="relative mt-4 h-64">
            <Bar data={barData} options={barOptions} />
          </div>
        </div>
        <div className="relative overflow-hidden rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-indigo-500/10" />
          <div className="relative flex items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                Employee Status
              </h2>
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                Active vs inactive and on-leave employees.
              </p>
            </div>
          </div>

          <div className="relative mt-4 flex flex-col gap-4 md:flex-row md:items-center">
            <div className="h-52 flex-1">
              <Doughnut data={donutData} options={donutOptions} />
            </div>

            <div className="flex flex-1 flex-col gap-3">
              {donutData.labels.map((label, idx) => {
                const value = donutData.datasets[0].data[idx] as number;
                const percent = totalStatus ? ((value / totalStatus) * 100).toFixed(1) : '0.0';
                const color = donutData.datasets[0].backgroundColor[idx] as string;

                return (
                  <div
                    key={label}
                    className="flex items-center justify-between gap-3 rounded-xl border px-3 py-2 text-xs dark:border-zinc-700 dark:bg-zinc-900"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="inline-block h-3.5 w-3.5 rounded-full"
                        style={{ backgroundColor: color }}
                      />
                      <span className="capitalize text-zinc-800 dark:text-zinc-100">
                        {label.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="font-semibold text-zinc-900 dark:text-zinc-50">{value}</span>
                      <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                        {percent}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
