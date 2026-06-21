import { cn } from "@/lib/utils";
import type { SignalDirection } from "@/lib/types";

const DIR_COLOR: Record<SignalDirection, string> = {
  LONG: "hsl(var(--long))",
  SHORT: "hsl(var(--short))",
  WAIT: "hsl(var(--wait))",
};

/** Circular confidence gauge. Pure SVG — renders on the server. */
export function ConfidenceRing({
  value,
  direction,
  size = 132,
  stroke = 10,
  label = "confidence",
  className,
}: {
  value: number;
  direction: SignalDirection;
  size?: number;
  stroke?: number;
  label?: string;
  className?: string;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, value));
  const offset = c - (pct / 100) * c;
  const color = DIR_COLOR[direction];

  return (
    <div className={cn("relative inline-grid place-items-center", className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="hsl(var(--muted))" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          style={{ filter: `drop-shadow(0 0 6px ${color})` }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="stat-mono text-3xl font-semibold leading-none text-foreground">{Math.round(pct)}</span>
        <span className="mt-1 text-[10px] uppercase tracking-widest text-muted-foreground">{label}</span>
      </div>
    </div>
  );
}
