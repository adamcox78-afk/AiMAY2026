import { cn } from "@/lib/utils";
import type { ProbabilityDistribution } from "@/lib/types";

/** Horizontal stacked probability bar: bull / neutral / bear. */
export function ProbabilityBars({
  probability,
  className,
  showLegend = true,
}: {
  probability: ProbabilityDistribution;
  className?: string;
  showLegend?: boolean;
}) {
  const { bull, neutral, bear } = probability;
  const segments = [
    { key: "Bull", value: bull, color: "hsl(var(--long))" },
    { key: "Neutral", value: neutral, color: "hsl(var(--wait))" },
    { key: "Bear", value: bear, color: "hsl(var(--short))" },
  ];

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex h-3 w-full overflow-hidden rounded-full bg-muted">
        {segments.map((s) => (
          <div
            key={s.key}
            className="h-full transition-all"
            style={{ width: `${s.value}%`, backgroundColor: s.color }}
            title={`${s.key} ${s.value}%`}
          />
        ))}
      </div>
      {showLegend && (
        <div className="flex items-center justify-between text-xs">
          {segments.map((s) => (
            <div key={s.key} className="flex items-center gap-1.5">
              <span className="size-2 rounded-full" style={{ backgroundColor: s.color }} />
              <span className="text-muted-foreground">{s.key}</span>
              <span className="stat-mono font-medium text-foreground">{s.value}%</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
