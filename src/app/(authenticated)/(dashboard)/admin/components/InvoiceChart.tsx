"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bar, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";

ChartJS.register(
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
    paid: "Pago",
    pending: "Pendente",
    failed: "Falhou",
    refunded: "Reembolsado",
  };
  return statusMap[status] || status;
};

const getTypeText = (type: string) => {
  const typeMap: Record<string, string> = {
    domain: "Domínio",
    plan: "Plano",
  };
  return typeMap[type] || type;
};

export function InvoiceChart({ statusStats, typeStats }: InvoiceChartProps) {
  const statusData = {
    labels: statusStats.map((stat) => getStatusText(stat.status)),
    datasets: [
      {
        label: "Quantidade de Faturas",
        data: statusStats.map((stat) => stat.count),
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
      },
    ],
  };

  const typeData = {
    labels: typeStats.map((stat) => getTypeText(stat.type)),
    datasets: [
      {
        data: typeStats.map((stat) => stat.count),
        backgroundColor: ["rgba(34, 197, 94, 0.5)", "rgba(59, 130, 246, 0.5)"],
        borderColor: ["rgb(34, 197, 94)", "rgb(59, 130, 246)"],
        borderWidth: 1,
      },
    ],
  };

  return (
    <section className="mb-8">
      <h2 className="text-xl font-bold mb-4">Gráficos de Faturas</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Status das Faturas</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <Doughnut
              data={statusData}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: "top" as const,
                  },
                },
                maintainAspectRatio: false,
              }}
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Tipo de Fatura (Domínio/Plano)</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <Doughnut
              data={typeData}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: "top" as const,
                  },
                },
                maintainAspectRatio: false,
              }}
            />
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
