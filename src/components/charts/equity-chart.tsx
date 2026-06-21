"use client";

import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { fmtUsdCompact } from "@/lib/utils";

export function EquityChart({
  points,
  height = 260,
}: {
  points: { t: string; value: number }[];
  height?: number;
}) {
  const data = points.map((p, i) => ({
    i,
    label: new Date(p.t).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    value: p.value,
  }));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id="equityFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(187 92% 48%)" stopOpacity={0.35} />
            <stop offset="100%" stopColor="hsl(187 92% 48%)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis dataKey="label" tick={{ fontSize: 11, fill: "hsl(215 16% 55%)" }} axisLine={false} tickLine={false} minTickGap={48} />
        <YAxis
          tick={{ fontSize: 11, fill: "hsl(215 16% 55%)" }}
          axisLine={false}
          tickLine={false}
          width={52}
          tickFormatter={(v) => fmtUsdCompact(v)}
        />
        <Tooltip
          contentStyle={{
            background: "hsl(222 24% 8%)",
            border: "1px solid hsl(220 16% 18%)",
            borderRadius: 10,
            fontSize: 12,
          }}
          formatter={(v: number) => [`$${v.toLocaleString()}`, "Equity"]}
        />
        <Area type="monotone" dataKey="value" stroke="hsl(187 92% 48%)" strokeWidth={2} fill="url(#equityFill)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}
