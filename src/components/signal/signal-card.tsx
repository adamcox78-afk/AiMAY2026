import { Activity, Clock, Crosshair, ShieldAlert, Target } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { SignalBadge } from "./signal-badge";
import { ConfidenceRing } from "./confidence-ring";
import { ProbabilityBars } from "./probability-bars";
import { cn, fmtPct, fmtPrice } from "@/lib/utils";
import type { RiskLevel, Signal } from "@/lib/types";

const RISK_COLOR: Record<RiskLevel, string> = {
  Low: "text-[hsl(var(--long))]",
  Medium: "text-[hsl(var(--wait))]",
  High: "text-[hsl(var(--short))]",
};

function Stat({
  icon: Icon,
  label,
  value,
  valueClass,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="rounded-lg border border-border/60 bg-background/40 p-3">
      <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-muted-foreground">
        <Icon className="size-3.5" />
        {label}
      </div>
      <div className={cn("stat-mono mt-1 text-sm font-semibold text-foreground", valueClass)}>{value}</div>
    </div>
  );
}

export function SignalCard({ signal, className }: { signal: Signal; className?: string }) {
  const { asset } = signal;

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="grid size-11 place-items-center rounded-xl border border-border bg-background text-base font-semibold text-primary">
              {asset.glyph || asset.symbol.slice(0, 1)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold tracking-tight text-foreground">{asset.symbol}</h2>
                <span className="text-xs text-muted-foreground">{asset.exchange}</span>
              </div>
              <p className="text-sm text-muted-foreground">{asset.name}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="stat-mono text-lg font-semibold text-foreground">${fmtPrice(signal.price)}</div>
            <div className="text-xs text-muted-foreground">{signal.timeframe} outlook</div>
          </div>
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-[auto_1fr]">
          {/* Left: verdict */}
          <div className="flex flex-col items-center gap-3">
            <SignalBadge direction={signal.direction} className="px-4 py-1.5 text-base" />
            <ConfidenceRing value={signal.confidence} direction={signal.direction} />
            <div className="flex items-center gap-1.5 text-sm">
              <ShieldAlert className="size-4 text-muted-foreground" />
              <span className="text-muted-foreground">Risk</span>
              <span className={cn("font-semibold", RISK_COLOR[signal.risk])}>{signal.risk}</span>
            </div>
          </div>

          {/* Right: probabilities + levels */}
          <div className="space-y-5">
            <div>
              <div className="mb-2 text-xs uppercase tracking-wider text-muted-foreground">Probability</div>
              <ProbabilityBars probability={signal.probability} />
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <Stat icon={Target} label="Entry Zone" value={`${fmtPrice(signal.entryZone.low)}–${fmtPrice(signal.entryZone.high)}`} />
              <Stat icon={Crosshair} label="Invalidation" value={`$${fmtPrice(signal.invalidation)}`} valueClass="text-[hsl(var(--short))]" />
              <Stat icon={Activity} label="Exp. Move" value={`±${signal.expectedVolatilityPct.toFixed(1)}%`} />
              <Stat icon={Clock} label="Timeframe" value={signal.timeframe} />
              <Stat icon={Activity} label="Composite" value={`${signal.compositeScore}/100`} />
              <Stat icon={ShieldAlert} label="Risk Score" value={`${signal.riskScore}/100`} />
            </div>
          </div>
        </div>

        <Separator className="my-5" />

        {/* Plain-English explanation */}
        <div>
          <div className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-primary">The Signal, in plain English</div>
          <p className="text-sm leading-relaxed text-foreground/85">{signal.explanation}</p>
        </div>
      </CardContent>
    </Card>
  );
}
