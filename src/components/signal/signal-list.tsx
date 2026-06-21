import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { SignalBadge } from "./signal-badge";
import { cn, fmtPrice } from "@/lib/utils";
import type { Signal } from "@/lib/types";

function Row({ signal }: { signal: Signal }) {
  const { asset } = signal;
  return (
    <Link
      href={`/dashboard?symbol=${asset.symbol}`}
      className="group flex items-center gap-3 rounded-lg border border-transparent px-3 py-3 transition-colors hover:border-border hover:bg-muted/40"
    >
      <div className="grid size-9 shrink-0 place-items-center rounded-lg border border-border bg-background text-sm font-semibold text-primary">
        {asset.glyph || asset.symbol.slice(0, 1)}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="font-medium text-foreground">{asset.symbol}</span>
          <span className="hidden text-xs text-muted-foreground sm:inline">{asset.name}</span>
        </div>
        <p className="truncate text-xs text-muted-foreground">{signal.reasonSummary}</p>
      </div>
      <div className="hidden w-28 text-right md:block">
        <div className="stat-mono text-sm text-foreground">${fmtPrice(signal.price)}</div>
        <div className="text-[11px] text-muted-foreground">{signal.timeframe}</div>
      </div>
      <div className="w-16 text-right">
        <div className="stat-mono text-sm font-semibold text-foreground">{signal.confidence}%</div>
        <div className="text-[11px] text-muted-foreground">conf.</div>
      </div>
      <SignalBadge direction={signal.direction} size="sm" className="w-[78px] justify-center" />
      <ChevronRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
    </Link>
  );
}

export function SignalList({ signals, className }: { signals: Signal[]; className?: string }) {
  return (
    <div className={cn("divide-y divide-border/50", className)}>
      {signals.map((s) => (
        <Row key={s.asset.symbol} signal={s} />
      ))}
    </div>
  );
}
