import Link from "next/link";
import { Activity, Crosshair, Gauge, TrendingDown, TrendingUp } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SignalCard } from "@/components/signal/signal-card";
import { SignalList } from "@/components/signal/signal-list";
import { FactorBreakdown } from "@/components/signal/factor-breakdown";
import { PriceChart } from "@/components/charts/price-chart";
import { ProbabilityCone } from "@/components/charts/probability-cone";
import { getAllSignals, getMarketSnapshot, getSignal } from "@/lib/data";
import { cn } from "@/lib/utils";
import type { Signal } from "@/lib/types";

export const dynamic = "force-dynamic";

function Tile({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  accent?: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-4">
        <div className={cn("grid size-9 place-items-center rounded-lg bg-muted", accent)}>
          <Icon className="size-4" />
        </div>
        <div>
          <div className="text-xs text-muted-foreground">{label}</div>
          <div className="stat-mono text-lg font-semibold text-foreground">{value}</div>
        </div>
      </CardContent>
    </Card>
  );
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: { symbol?: string };
}) {
  const signals = await getAllSignals();
  const requested = searchParams.symbol?.toUpperCase();

  let selected: Signal | null =
    (requested && signals.find((s) => s.asset.symbol === requested)) || null;
  if (!selected && requested) selected = await getSignal(requested);
  if (!selected) selected = signals.find((s) => s.direction === "LONG") ?? signals[0];

  const snapshot = await getMarketSnapshot(selected.asset.symbol);

  const longs = signals.filter((s) => s.direction === "LONG").length;
  const shorts = signals.filter((s) => s.direction === "SHORT").length;
  const avgConf = Math.round(signals.reduce((a, s) => a + s.confidence, 0) / (signals.length || 1));
  const topSignals = [...signals].sort((a, b) => b.confidence - a.confidence);

  const chips = signals.map((s) => s.asset.symbol);

  return (
    <>
      <PageHeader
        title="Dashboard"
        subtitle="One clear call per asset — powered by the Apex composite engine."
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Tile icon={Gauge} label="Assets scanned" value={String(signals.length)} accent="text-primary" />
        <Tile icon={TrendingUp} label="Long signals" value={String(longs)} accent="text-[hsl(var(--long))]" />
        <Tile icon={TrendingDown} label="Short signals" value={String(shorts)} accent="text-[hsl(var(--short))]" />
        <Tile icon={Activity} label="Avg confidence" value={`${avgConf}%`} accent="text-primary" />
      </div>

      {/* Asset selector chips */}
      <div className="flex flex-wrap gap-2">
        {chips.map((sym) => (
          <Link
            key={sym}
            href={`/dashboard?symbol=${sym}`}
            className={cn(
              "rounded-full border px-3 py-1 text-sm transition-colors",
              sym === selected.asset.symbol
                ? "border-primary/50 bg-primary/10 text-primary"
                : "border-border text-muted-foreground hover:text-foreground"
            )}
          >
            {sym}
          </Link>
        ))}
      </div>

      <SignalCard signal={selected} />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Crosshair className="size-4 text-primary" /> Price & key levels — {selected.asset.symbol}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {snapshot && (
              <PriceChart
                candles={snapshot.candles}
                direction={selected.direction}
                entryZone={selected.entryZone}
                invalidation={selected.invalidation}
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Probability cone</CardTitle>
          </CardHeader>
          <CardContent>
            <ProbabilityCone signal={selected} />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Why this signal — factor breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <FactorBreakdown components={selected.components} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Top signals right now</CardTitle>
          </CardHeader>
          <CardContent className="p-2">
            <SignalList signals={topSignals} />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
