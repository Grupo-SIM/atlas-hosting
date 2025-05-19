'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartData,
} from 'chart.js';
import { addMonths, format, getDaysInMonth, getYear, isAfter, formatDate, getMonth, toDate } from "date-fns";
import { range } from "lodash";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface UserGrowth {
  month: string;
  count: number;
}

interface UserChartProps {
  userGrowth: UserGrowth[];
}

function getMonthRange(userGrowth: UserGrowth[]) {
  if (userGrowth.length === 0) return [];
  const months = userGrowth.map(u => u.month).sort();
  const start = months[0];
  const end = months[months.length - 1];

  const result: string[] = [];
  let current = new Date(start + "-01");
  const last = new Date(end + "-01");

  while (!isAfter(current, last)) {
    result.push(format(current, "yyyy-MM"));
    current = addMonths(current, 1);
  }
  return result;
}

const months = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro"  
]

function getDateFromMonth(month: number) {
  return format(new Date(), "YYYY-MM")
}

export function UserChart({ userGrowth }: UserChartProps) {
  // Map userGrowth to a lookup for fast access
  const growthMap = Object.fromEntries(userGrowth.map(u => [getMonth(toDate(u.month + '-01')), u.count]));

  // Build the data array for all months (0 if no data)
  const data: ChartData<"line", number[], string> = {
    labels: months,
    datasets: [
      {
        label: 'Novos Usuários',
        data: months.map((_, idx) => growthMap[idx] ?? 0),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 1)',
        tension: 0,
      },
    ],
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Crescimento de Usuários</CardTitle>
      </CardHeader>
      <CardContent className="max-h-120 h-120 w-full">
        <Line
          data={data}
          options={{
            responsive: true,
            plugins: {
              legend: {
                position: 'bottom' as const,
              },
              title: {
                display: false,
              },
            },
            scales: {
              y: {
                beginAtZero: true,
                ticks: {
                  stepSize: 1,
                },
                title: {
                  display: true,
                  text: 'Novos Usuários',
                  padding: 10
                },
              },
            },
            maintainAspectRatio : false
          }}
        />
      </CardContent>
    </Card>
  );
} 