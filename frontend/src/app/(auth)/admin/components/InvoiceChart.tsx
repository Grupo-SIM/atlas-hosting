"use client";

import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as chartJs,
  Legend,
  LinearScale,
  Title,
  Tooltip,
} from "chart.js";
import { Doughnut } from "react-chartjs-2";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

chartJs.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface StatusStat {
  status: string;
  count: number;
  total: number;
}

interface TypeStat {
  type: string;
  count: number;
}

interface InvoiceChartProps {
  statusStats: StatusStat[];
  typeStats: TypeStat[];
}

const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    failed: "Falhou",
    paid: "Pago",
    pending: "Pendente",
    refunded: "Reembolsado",
  };
  return statusMap[status] || status;
};

const getTypeText = (type: string) => {
  const typeMap: Record<string, string> = {
    domain: "Domínio",
    subscription: "Plano",
  };
  return typeMap[type] || type;
};

export function InvoiceChart({ statusStats, typeStats }: InvoiceChartProps) {
  const statusData = {
    datasets: [
      {
        backgroundColor: [
          "rgba(34, 197, 94, 0.5)", // green
          "rgba(234, 179, 8, 0.5)", // yellow
          "rgba(239, 68, 68, 0.5)", // red
          "rgba(59, 130, 246, 0.5)", // blue
        ],
        borderColor: [
          "rgb(34, 197, 94)",
          "rgb(234, 179, 8)",
          "rgb(239, 68, 68)",
          "rgb(59, 130, 246)",
        ],
        borderWidth: 1,
        data: statusStats.map(stat => stat.count),
        label: "Quantidade de Faturas",
      },
    ],
    labels: statusStats.map(stat => getStatusText(stat.status)),
  };

  const typeData = {
    datasets: [
      {
        backgroundColor: ["rgba(34, 197, 94, 0.5)", "rgba(59, 130, 246, 0.5)"],
        borderColor: ["rgb(34, 197, 94)", "rgb(59, 130, 246)"],
        borderWidth: 1,
        data: typeStats.map(stat => stat.count),
      },
    ],
    labels: typeStats.map(stat => getTypeText(stat.type)),
  };

  return (
    <section className="mb-8">
      <h2 className="mb-4 font-bold text-xl">Gráficos de Faturas</h2>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Status das Faturas</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <Doughnut
              data={statusData}
              options={{
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: "top" as const,
                  },
                },
                responsive: true,
              }}
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Tipo de Fatura - Domínio / Plano</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <Doughnut
              data={typeData}
              options={{
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: "top" as const,
                  },
                },
                responsive: true,
              }}
            />
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
