import { PageHeader } from "@/components/layout/page-header";
import { AlertCenter, type AlertItem } from "@/components/alerts/alert-center";
import { getAllSignals } from "@/lib/data";
import { ALERT_CONFIDENCE_THRESHOLD } from "@/lib/config";

export const dynamic = "force-dynamic";
export const metadata = { title: "Alerts" };

export default async function AlertsPage() {
  const signals = await getAllSignals();
  const alerts: AlertItem[] = signals
    .filter((s) => s.direction !== "WAIT")
    .sort((a, b) => b.confidence - a.confidence)
    .map((s) => ({
      symbol: s.asset.symbol,
      direction: s.direction,
      confidence: s.confidence,
      message: s.reasonSummary,
      triggered: s.confidence >= ALERT_CONFIDENCE_THRESHOLD,
    }));

  return (
    <>
      <PageHeader
        title="Alerts"
        subtitle="High-conviction signals, delivered the instant they cross your threshold."
      />
      <AlertCenter alerts={alerts} threshold={ALERT_CONFIDENCE_THRESHOLD} />
    </>
  );
}
