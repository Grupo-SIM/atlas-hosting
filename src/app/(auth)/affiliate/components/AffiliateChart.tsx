"use client";

import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
} from "chart.js";
import { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";

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
    background: "#ffffff",
    border: "#e4e4e7",
    foreground: "#0a0a0a",
    mutedForeground: "#6b7280",
    primary: "#3b82f6",
    primaryMuted: "#3b82f699",
    primaryMutedWithOpacity: "#3b82f60d",
    primaryWithOpacity: "#3b82f61a",
  });

  useEffect(() => {
    const updateColors = () => {
      const isDark = document.documentElement.classList.contains("dark");

      setColors({
        background: isDark ? "#0a0a0a" : "#ffffff",
        border: isDark ? "#27272a" : "#e4e4e7",
        foreground: isDark ? "#ffffff" : "#0a0a0a",
        mutedForeground: isDark ? "#a1a1aa" : "#6b7280",
        primary: "#3b82f6",
        primaryMuted: isDark ? "#3b82f699" : "#3b82f699",
        primaryMutedWithOpacity: isDark ? "#3b82f60d" : "#3b82f60d",
        primaryWithOpacity: isDark ? "#3b82f61a" : "#3b82f61a",
      });
    };

    // Initial color setting
    updateColors();

    // Watch for theme changes
    const observer = new MutationObserver(updateColors);
    observer.observe(document.documentElement, {
      attributeFilter: ["class"],
      attributes: true,
    });

    return () => observer.disconnect();
  }, []);

  const options = {
    elements: {
      line: {
        tension: 0.4,
      },
      point: {
        hoverRadius: 6,
        radius: 4,
      },
    },
    interaction: {
      intersect: false,
      mode: "index" as const,
    },
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: colors.foreground,
          font: {
            size: 12,
          },
          usePointStyle: true,
        },
        position: "top" as const,
      },
      tooltip: {
        backgroundColor: colors.background,
        bodyColor: colors.foreground,
        borderColor: colors.border,
        borderWidth: 1,
        callbacks: {
          label: (context: {
            dataset: { label?: string };
            parsed: { y: number };
          }) => {
            const label = context.dataset.label || "";
            if (label === "Ganhos") {
              return `${label}: R$ ${context.parsed.y.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;
            }
            return `${label}: ${context.parsed.y}`;
          },
        },
        cornerRadius: 8,
        displayColors: true,
        titleColor: colors.foreground,
      },
    },
    responsive: true,
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
        display: true,
        grid: {
          color: colors.border,
          drawBorder: false,
        },
        position: "left" as const,
        ticks: {
          callback: (value: number | string) => {
            return `R$ ${Number(value).toLocaleString("pt-BR")}`;
          },
          color: colors.mutedForeground,
          font: {
            size: 12,
          },
        },
        type: "linear" as const,
      },
      y1: {
        display: true,
        grid: {
          color: colors.border,
          drawBorder: false,
          drawOnChartArea: false,
        },
        position: "right" as const,
        ticks: {
          color: colors.mutedForeground,
          font: {
            size: 12,
          },
        },
        type: "linear" as const,
      },
    },
  };

  const chartData = {
    datasets: [
      {
        backgroundColor: colors.primaryWithOpacity,
        borderColor: colors.primary,
        data: data.map(item => item.earnings),
        fill: true,
        label: "Ganhos",
        tension: 0.4,
        yAxisID: "y",
      },
      {
        backgroundColor: colors.primaryMutedWithOpacity,
        borderColor: colors.primaryMuted,
        data: data.map(item => item.referrals),
        fill: false,
        label: "Indicações",
        tension: 0.4,
        yAxisID: "y1",
      },
    ],
    labels: data.map(item => item.month),
  };

  return (
    <div className="h-[400px] w-full">
      <Line data={chartData} options={options} />
    </div>
  );
}
