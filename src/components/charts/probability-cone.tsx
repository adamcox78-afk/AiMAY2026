"use client";

import {
  Area,
  ComposedChart,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { Signal } from "@/lib/types";
import { fmtPrice } from "@/lib/utils";

const DIR_COLOR = {
  LONG: "hsl(152 64% 46%)",
  SHORT: "hsl(0 75% 60%)",
  WAIT: "hsl(187 92% 48%)",
} as const;

/**
 * Forward probability cone. Projects bull / neutral / bear paths from the current
 * price using the signal's expected volatility and probability tilt. Illustrative
 * — it visualizes the engine's output, it does not forecast prices.
 */
export function ProbabilityCone({ signal, height = 260 }: { signal: Signal; height?: number }) {
  const steps = 24;
  const price = signal.price;
  const move = price * (signal.expectedVolatilityPct / 100); // ~1 sigma terminal
  const tilt = (signal.probability.bull - signal.probability.bear) / 100;
  const color = DIR_COLOR[signal.direction];

  const data = Array.from({ length: steps + 1 }, (_, i) => {
    const t = i / steps;
    const spread = move * Math.sqrt(t) * 1.4;
    const drift = move * t * tilt;
    const mid = price + drift;
    return {
      i,
      label: i === 0 ? "Now" : i === steps ? "Target" : "",
      band: [mid - spread, mid + spread] as [number, number],
      mid,
    };
  });

  const lows = data.map((d) => d.band[0]);
  const highs = data.map((d) => d.band[1]);
  const min = Math.min(...lows, signal.invalidation);
  const max = Math.max(...highs);
  const pad = (max - min) * 0.06 || 1;

  return (
    <ResponsiveContainer width="100%" height={height}>
      <ComposedChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id="coneFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.28} />
            <stop offset="100%" stopColor={color} stopOpacity={0.04} />
          </linearGradient>
        </defs>
        <XAxis dataKey="label" tick={{ fontSize: 11, fill: "hsl(215 16% 55%)" }} axisLine={false} tickLine={false} />
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
          formatter={(v: number | number[]) =>
            Array.isArray(v) ? [`${fmtPrice(v[0])} – ${fmtPrice(v[1])}`, "Range"] : [fmtPrice(v), "Path"]
          }
        />
        <Area type="monotone" dataKey="band" stroke="none" fill="url(#coneFill)" />
        <Line type="monotone" dataKey="mid" stroke={color} strokeWidth={2.5} dot={false} />
        <ReferenceLine y={price} stroke="hsl(215 16% 55%)" strokeDasharray="3 3" strokeOpacity={0.5} />
        <ReferenceLine y={signal.invalidation} stroke="hsl(0 75% 60%)" strokeDasharray="2 4" strokeOpacity={0.7} />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
