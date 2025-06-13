"use client";

import React, { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

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

interface AffiliateChartProps {
  data: {
    month: string;
    earnings: number;
    referrals: number;
  }[];
}

export function AffiliateChart({ data }: AffiliateChartProps) {
  const [colors, setColors] = useState({
    foreground: '#0a0a0a',
    mutedForeground: '#6b7280',
    border: '#e4e4e7',
    background: '#ffffff',
    primary: '#3b82f6',
    primaryWithOpacity: '#3b82f61a',
    primaryMuted: '#3b82f699',
    primaryMutedWithOpacity: '#3b82f60d',
  });

  useEffect(() => {
    const updateColors = () => {
      const isDark = document.documentElement.classList.contains('dark');
      
      setColors({
        foreground: isDark ? '#ffffff' : '#0a0a0a',
        mutedForeground: isDark ? '#a1a1aa' : '#6b7280',
        border: isDark ? '#27272a' : '#e4e4e7',
        background: isDark ? '#0a0a0a' : '#ffffff',
        primary: '#3b82f6',
        primaryWithOpacity: isDark ? '#3b82f61a' : '#3b82f61a',
        primaryMuted: isDark ? '#3b82f699' : '#3b82f699',
        primaryMutedWithOpacity: isDark ? '#3b82f60d' : '#3b82f60d',
      });
    };

    // Initial color setting
    updateColors();

    // Watch for theme changes
    const observer = new MutationObserver(updateColors);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, []);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          color: colors.foreground,
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        backgroundColor: colors.background,
        titleColor: colors.foreground,
        bodyColor: colors.foreground,
        borderColor: colors.border,
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          label: (context: { dataset: { label?: string }; parsed: { y: number } }) => {
            const label = context.dataset.label || '';
            if (label === 'Ganhos') {
              return `${label}: R$ ${context.parsed.y.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
            }
            return `${label}: ${context.parsed.y}`;
          }
        }
      },
    },
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    scales: {
      x: {
        grid: {
          color: colors.border,
          drawBorder: false,
        },
        ticks: {
          color: colors.mutedForeground,
          font: {
            size: 12,
          },
        },
      },
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        grid: {
          color: colors.border,
          drawBorder: false,
        },
        ticks: {
          color: colors.mutedForeground,
          font: {
            size: 12,
          },
          callback: (value: number | string) => {
            return `R$ ${Number(value).toLocaleString('pt-BR')}`;
          },
        },
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        grid: {
          drawOnChartArea: false,
          color: colors.border,
          drawBorder: false,
        },
        ticks: {
          color: colors.mutedForeground,
          font: {
            size: 12,
          },
        },
      },
    },
    elements: {
      line: {
        tension: 0.4,
      },
      point: {
        radius: 4,
        hoverRadius: 6,
      },
    },
  };

  const chartData = {
    labels: data.map(item => item.month),
    datasets: [
      {
        label: 'Ganhos',
        data: data.map(item => item.earnings),
        borderColor: colors.primary,
        backgroundColor: colors.primaryWithOpacity,
        fill: true,
        yAxisID: 'y',
        tension: 0.4,
      },
      {
        label: 'Indicações',
        data: data.map(item => item.referrals),
        borderColor: colors.primaryMuted,
        backgroundColor: colors.primaryMutedWithOpacity,
        fill: false,
        yAxisID: 'y1',
        tension: 0.4,
      },
    ],
  };

  return (
    <div className="h-[400px] w-full">
      <Line options={options} data={chartData} />
    </div>
  );
}
