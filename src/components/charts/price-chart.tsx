"use client";

import {
  Area,
  AreaChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { Candle, PriceZone, SignalDirection } from "@/lib/types";
import { fmtPrice } from "@/lib/utils";

const DIR_COLOR: Record<SignalDirection, string> = {
  LONG: "hsl(152 64% 46%)",
  SHORT: "hsl(0 75% 60%)",
  WAIT: "hsl(187 92% 48%)",
};

export function PriceChart({
  candles,
  direction = "WAIT",
  entryZone,
  invalidation,
  height = 260,
  points = 70,
}: {
  candles: Candle[];
  direction?: SignalDirection;
  entryZone?: PriceZone;
  invalidation?: number;
  height?: number;
  points?: number;
}) {
  const data = candles.slice(-points).map((c) => ({
    t: c.t,
    label: new Date(c.t).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    price: c.c,
  }));
  const color = DIR_COLOR[direction];
  const prices = data.map((d) => d.price);
  const min = Math.min(...prices, invalidation ?? Infinity, entryZone?.low ?? Infinity);
  const max = Math.max(...prices, invalidation ?? -Infinity, entryZone?.high ?? -Infinity);
  const pad = (max - min) * 0.08 || 1;

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id="priceFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.35} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis
          dataKey="label"
          tick={{ fontSize: 11, fill: "hsl(215 16% 55%)" }}
          axisLine={false}
          tickLine={false}
          minTickGap={48}
        />
        <YAxis
          domain={[min - pad, max + pad]}
          tick={{ fontSize: 11, fill: "hsl(215 16% 55%)" }}
          axisLine={false}
          tickLine={false}
          width={52}
          tickFormatter={(v) => fmtPrice(v)}
        />
        <Tooltip
          contentStyle={{
            background: "hsl(222 24% 8%)",
            border: "1px solid hsl(220 16% 18%)",
            borderRadius: 10,
            fontSize: 12,
          }}
          labelStyle={{ color: "hsl(215 16% 62%)" }}
          formatter={(v: number) => [fmtPrice(v), "Price"]}
        />
        {entryZone && (
          <ReferenceLine y={entryZone.high} stroke={color} strokeDasharray="4 4" strokeOpacity={0.5} />
        )}
        {entryZone && (
          <ReferenceLine y={entryZone.low} stroke={color} strokeDasharray="4 4" strokeOpacity={0.5} />
        )}
        {invalidation !== undefined && (
          <ReferenceLine
            y={invalidation}
            stroke="hsl(0 75% 60%)"
            strokeDasharray="2 4"
            label={{ value: "invalidation", fontSize: 10, fill: "hsl(0 75% 65%)", position: "insideBottomRight" }}
          />
        )}
        <Area type="monotone" dataKey="price" stroke={color} strokeWidth={2} fill="url(#priceFill)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}
