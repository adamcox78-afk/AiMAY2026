import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { WatchlistManager } from "@/components/signal/watchlist-manager";
import { getAllSignals } from "@/lib/data";

export const dynamic = "force-dynamic";
export const metadata = { title: "Watchlist" };

export default async function WatchlistPage() {
  const coreSignals = await getAllSignals();
  return (
    <>
      <PageHeader
        title="Watchlist"
        subtitle="Your core universe plus any custom assets you track. Re-scanned every 5 minutes."
      />
      <Card>
        <CardContent className="p-4">
          <WatchlistManager coreSignals={coreSignals} />
        </CardContent>
      </Card>
    </>
  );
}
