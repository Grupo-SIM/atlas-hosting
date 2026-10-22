"use client";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface MetricsData {
  timestamp: Date | string;
  cpuUsage: number;
  ramUsage: number;
  diskUsage: number;
  [key: string]: any;
}

interface VpsMetricsChartsProps {
  data: MetricsData[];
}

export default function VpsMetricsCharts({ data }: VpsMetricsChartsProps) {
  // Formatamos os dados para o gráfico
  const chartData = data
    .map(m => ({
      cpu: Math.round(m.cpuUsage),
      disk: Math.round(m.diskUsage),
      ram: Math.round(m.ramUsage),
      time: format(new Date(m.timestamp), "HH:mm", { locale: ptBR }),
    }))
    .reverse(); // Colocamos em ordem cronológica para o gráfico

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload?.length) {
      return (
        <div className="rounded-lg border bg-background p-2 text-xs shadow-sm">
          <p className="mb-1 font-bold text-muted-foreground">{label}</p>
          {payload.map((entry: any) => (
            <div
              className="flex items-center gap-2"
              key={entry.name}
              style={{ color: entry.color }}
            >
              <span className="font-semibold">{entry.name.toUpperCase()}:</span>
              <span>{entry.value}%</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      {/* Gráfico de CPU */}
      <Card className="col-span-1">
        <CardHeader>
          <CardTitle className="font-medium text-sm">Uso de CPU (%)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <div className="h-[200px] min-w-[280px]">
              <ResponsiveContainer height="100%" width="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorCpu" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    stroke="#334155"
                    strokeDasharray="3 3"
                    vertical={false}
                  />
                  <XAxis
                    axisLine={false}
                    dataKey="time"
                    fontSize={10}
                    tickLine={false}
                  />
                  <YAxis
                    axisLine={false}
                    domain={[0, 100]}
                    fontSize={10}
                    tickLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    dataKey="cpu"
                    fill="url(#colorCpu)"
                    fillOpacity={1}
                    name="cpu"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    type="monotone"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Gráfico de Memória RAM */}
      <Card className="col-span-1">
        <CardHeader>
          <CardTitle className="font-medium text-sm">
            Uso de Memória RAM (%)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <div className="h-[200px] min-w-[280px]">
              <ResponsiveContainer height="100%" width="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorRam" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    stroke="#334155"
                    strokeDasharray="3 3"
                    vertical={false}
                  />
                  <XAxis
                    axisLine={false}
                    dataKey="time"
                    fontSize={10}
                    tickLine={false}
                  />
                  <YAxis
                    axisLine={false}
                    domain={[0, 100]}
                    fontSize={10}
                    tickLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    dataKey="ram"
                    fill="url(#colorRam)"
                    fillOpacity={1}
                    name="ram"
                    stroke="#8b5cf6"
                    strokeWidth={2}
                    type="monotone"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Gráfico de Disco */}
      <Card className="col-span-1 md:col-span-2">
        <CardHeader>
          <CardTitle className="font-medium text-sm">
            Histórico de Uso de Disco (%)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <div className="h-[200px] min-w-[280px]">
              <ResponsiveContainer height="100%" width="100%">
                <LineChart data={chartData}>
                  <CartesianGrid
                    stroke="#334155"
                    strokeDasharray="3 3"
                    vertical={false}
                  />
                  <XAxis
                    axisLine={false}
                    dataKey="time"
                    fontSize={10}
                    tickLine={false}
                  />
                  <YAxis
                    axisLine={false}
                    domain={[0, 100]}
                    fontSize={10}
                    tickLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    dataKey="disk"
                    dot={false}
                    name="disco"
                    stroke="#10b981"
                    strokeWidth={2}
                    type="monotone"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
