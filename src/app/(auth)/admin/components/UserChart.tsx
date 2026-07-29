"use client";

import {
  CategoryScale,
  type ChartData,
  Chart as chartJs,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
} from "chart.js";
import { addMonths, format, getMonth, isAfter, toDate } from "date-fns";
import { Line } from "react-chartjs-2";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

chartJs.register(
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
  if (userGrowth.length === 0) {
    return [];
  }
  const months = userGrowth.map(u => u.month).sort();
  const start = months[0];
  const end = months[months.length - 1];

  const result: string[] = [];
  let current = new Date(`${start}-01`);
  const last = new Date(`${end}-01`);

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
  "Dezembro",
];

function getDateFromMonth(_month: number) {
  return format(new Date(), "YYYY-MM");
}

export function UserChart({ userGrowth }: UserChartProps) {
  // Map userGrowth to a lookup for fast access
  const growthMap = Object.fromEntries(
    userGrowth.map(u => [getMonth(toDate(`${u.month}-01`)), u.count])
  );

  // Build the data array for all months (0 if no data)
  const data: ChartData<"line", number[], string> = {
    datasets: [
      {
        backgroundColor: "rgba(59, 130, 246, 1)",
        borderColor: "rgb(59, 130, 246)",
        data: months.map((_, idx) => growthMap[idx] ?? 0),
        label: "Novos Usuários",
        tension: 0,
      },
    ],
    labels: months,
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Crescimento de Usuários</CardTitle>
      </CardHeader>
      <CardContent className="h-120 max-h-120 w-full">
        <Line
          data={data}
          options={{
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: "bottom" as const,
              },
              title: {
                display: false,
              },
            },
            responsive: true,
            scales: {
              y: {
                beginAtZero: true,
                ticks: {
                  stepSize: 1,
                },
                title: {
                  display: true,
                  padding: 10,
                  text: "Novos Usuários",
                },
              },
            },
          }}
        />
      </CardContent>
    </Card>
  );
}
