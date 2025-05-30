"use client";

import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

const data = [
  { month: "Jan", earnings: 1200, referrals: 15 },
  { month: "Feb", earnings: 1800, referrals: 22 },
  { month: "Mar", earnings: 2400, referrals: 28 },
  { month: "Apr", earnings: 3200, referrals: 35 },
  { month: "May", earnings: 2800, referrals: 30 },
  { month: "Jun", earnings: 3600, referrals: 42 },
];

export function AffiliateChart() {
  return (
    <div className="h-[400px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <XAxis
            dataKey="month"
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            yAxisId="left"
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `$${value}`}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `${value}`}
          />
          <Tooltip
            contentStyle={{
              background: "hsl(var(--background))",
              border: "1px solid hsl(var(--border))",
              color: "hsl(var(--foreground))",
            }}
            cursorStyle={{
              background: "hsl(var(--primary)/0.1)",
              border: "1px solid hsl(var(--primary)/0.2)",
            }}
          />
          <Bar
            yAxisId="left"
            dataKey="earnings"
            fill="hsl(var(--primary))"
            radius={[4, 4, 0, 0]}
          />
          <Bar
            yAxisId="right"
            dataKey="referrals"
            fill="hsl(var(--primary)/0.3)"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
