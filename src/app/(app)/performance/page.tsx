import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SignalBadge } from "@/components/signal/signal-badge";
import { EquityChart } from "@/components/charts/equity-chart";
import { getPerformance, getSignalHistory } from "@/lib/data";
import { cn, fmtPct } from "@/lib/utils";
import type { SignalOutcome } from "@/lib/types";

export const dynamic = "force-dynamic";
export const metadata = { title: "Track Record" };

const OUTCOME_STYLE: Record<SignalOutcome, string> = {
  won: "text-[hsl(var(--long))]",
  lost: "text-[hsl(var(--short))]",
  invalidated: "text-[hsl(var(--wait))]",
  open: "text-muted-foreground",
};

function Stat({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className={cn("stat-mono mt-1 text-2xl font-semibold text-foreground", accent)}>{value}</div>
      </CardContent>
    </Card>
  );
}

export default async function PerformancePage() {
  const [perf, history] = await Promise.all([getPerformance(), getSignalHistory()]);
  const recent = [...history]
    .sort((a, b) => new Date(b.openedAt).getTime() - new Date(a.openedAt).getTime())
    .slice(0, 14);

  return (
    <>
      <PageHeader
        title="Track Record"
        subtitle="Transparent, logged outcomes. Every signal is graded won, lost, or invalidated."
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Win rate" value={`${perf.winRate}%`} accent="text-[hsl(var(--long))]" />
        <Stat label="Total signals" value={String(perf.totalSignals)} />
        <Stat label="Avg win" value={fmtPct(perf.avgWinPct)} accent="text-[hsl(var(--long))]" />
        <Stat label="Avg loss" value={fmtPct(perf.avgLossPct)} accent="text-[hsl(var(--short))]" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Equity curve (simulated, 0.25% risk/trade)</CardTitle>
          </CardHeader>
          <CardContent>
            <EquityChart points={perf.equityCurve} />
          </CardContent>
        </Card>

        <div className="space-y-3">
          <Card>
            <CardContent className="p-4">
              <div className="text-xs text-muted-foreground">Long win rate</div>
              <div className="stat-mono mt-1 text-xl font-semibold text-[hsl(var(--long))]">{perf.longWinRate}%</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-xs text-muted-foreground">Short win rate</div>
              <div className="stat-mono mt-1 text-xl font-semibold text-[hsl(var(--short))]">{perf.shortWinRate}%</div>
            </CardContent>
          </Card>
          {perf.bestSignal && (
            <Card>
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <div className="text-xs text-muted-foreground">Best signal</div>
                  <div className="font-medium text-foreground">{perf.bestSignal.symbol}</div>
                </div>
                <div className="stat-mono font-semibold text-[hsl(var(--long))]">{fmtPct(perf.bestSignal.pnlPct)}</div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Recent outcomes</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr className="border-b border-border">
                  <th className="px-6 py-3 font-medium">Asset</th>
                  <th className="px-6 py-3 font-medium">Direction</th>
                  <th className="px-6 py-3 font-medium">Confidence</th>
                  <th className="px-6 py-3 font-medium">Outcome</th>
                  <th className="px-6 py-3 text-right font-medium">P&L</th>
                  <th className="hidden px-6 py-3 text-right font-medium sm:table-cell">Date</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((h) => (
                  <tr key={h.id} className="border-b border-border/50 last:border-0">
                    <td className="px-6 py-3 font-medium text-foreground">{h.symbol}</td>
                    <td className="px-6 py-3">
                      <SignalBadge direction={h.direction} size="sm" />
                    </td>
                    <td className="stat-mono px-6 py-3 text-muted-foreground">{h.confidence}%</td>
                    <td className={cn("px-6 py-3 font-medium capitalize", OUTCOME_STYLE[h.outcome])}>{h.outcome}</td>
                    <td className={cn("stat-mono px-6 py-3 text-right font-medium", h.pnlPct >= 0 ? "text-[hsl(var(--long))]" : "text-[hsl(var(--short))]")}>
                      {fmtPct(h.pnlPct)}
                    </td>
                    <td className="hidden px-6 py-3 text-right text-muted-foreground sm:table-cell">
                      {new Date(h.openedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
