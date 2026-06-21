import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { SignalsExplorer } from "@/components/signal/signals-explorer";
import { getAllSignals } from "@/lib/data";

export const dynamic = "force-dynamic";
export const metadata = { title: "Signals" };

export default async function SignalsPage() {
  const signals = await getAllSignals();
  return (
    <>
      <PageHeader title="Signals" subtitle="Every asset, ranked. Filter by direction, sort by conviction." />
      <Card>
        <CardContent className="p-4">
          <SignalsExplorer signals={signals} />
        </CardContent>
      </Card>
    </>
  );
}
