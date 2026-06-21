import { FACTOR_GROUPS } from "@/lib/config";
import { cn } from "@/lib/utils";
import type { ComponentScore } from "@/lib/types";

/** Center-anchored bar: bullish fills right (green), bearish fills left (red). */
function FactorBar({ score }: { score: number }) {
  const bullish = score >= 50;
  const magnitude = Math.abs(score - 50) * 2; // 0..100
  return (
    <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted">
      <div className="absolute left-1/2 top-0 h-full w-px bg-border" />
      <div
        className={cn("absolute top-0 h-full", bullish ? "left-1/2" : "right-1/2")}
        style={{
          width: `${magnitude / 2}%`,
          backgroundColor: bullish ? "hsl(var(--long))" : "hsl(var(--short))",
        }}
      />
    </div>
  );
}

export function FactorBreakdown({
  components,
  className,
}: {
  components: ComponentScore[];
  className?: string;
}) {
  const byKey = new Map(components.map((c) => [c.key, c]));

  return (
    <div className={cn("space-y-5", className)}>
      {FACTOR_GROUPS.map((group) => (
        <div key={group.label} className="space-y-2.5">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {group.label}
            </h4>
            <span className="stat-mono text-[11px] text-muted-foreground">{group.weightPct}% weight</span>
          </div>
          {group.keys.map((key) => {
            const c = byKey.get(key);
            if (!c) return null;
            return (
              <div key={key} className="grid grid-cols-[110px_1fr_2.5rem] items-center gap-3">
                <span className="truncate text-sm text-foreground/90">{c.label}</span>
                <FactorBar score={c.score} />
                <span className="stat-mono text-right text-xs text-muted-foreground">{c.score}</span>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
