"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export default function TrendChart({
  data,
}: {
  data: { weekLabel: string; total: number; meta: number }[];
}) {
  if (data.length === 0) {
    return <EmptyState />;
  }
  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data} margin={{ top: 8, right: 12, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
        <XAxis
          dataKey="weekLabel"
          tick={{ fontSize: 11, fill: "#9ca3af" }}
          tickLine={false}
          axisLine={false}
          interval="preserveStartEnd"
        />
        <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} tickLine={false} axisLine={false} />
        <Tooltip
          contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb", fontSize: 12 }}
        />
        <Line
          type="monotone"
          dataKey="meta"
          stroke="#f97316"
          strokeDasharray="6 4"
          dot={false}
          strokeWidth={2}
          name="Meta"
        />
        <Line
          type="monotone"
          dataKey="total"
          stroke="#16a34a"
          strokeWidth={2.5}
          dot={{ r: 2 }}
          activeDot={{ r: 4 }}
          name="Mejoras"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function EmptyState() {
  return (
    <div className="flex h-[260px] items-center justify-center text-sm text-neutral-400">
      Sin datos para este filtro
    </div>
  );
}
