import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProfileForm } from "@/components/settings/profile-form";
import { ruflo } from "@/lib/integrations/ruflo";
import { higgsfield } from "@/lib/integrations/higgsfield";
import { isSupabaseConfigured } from "@/lib/db/supabase";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = { title: "Settings" };

function StatusRow({ label, ok, detail }: { label: string; ok: boolean; detail: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-border/50 py-2.5 last:border-0">
      <div>
        <div className="text-sm font-medium text-foreground">{label}</div>
        <div className="text-xs text-muted-foreground">{detail}</div>
      </div>
      <Badge variant={ok ? "long" : "wait"} className="shrink-0">
        <span className={cn("mr-1.5 size-1.5 rounded-full", ok ? "bg-[hsl(var(--long))]" : "bg-[hsl(var(--wait))]")} />
        {ok ? "Connected" : "Mock"}
      </Badge>
    </div>
  );
}

export default function SettingsPage() {
  const rufloStatus = ruflo.status();
  const hfStatus = higgsfield.status();

  const dataSources = [
    { label: "Polygon.io", env: "POLYGON_API_KEY" },
    { label: "Alpaca", env: "ALPACA_API_KEY_ID" },
    { label: "Coinbase", env: "COINBASE_API_KEY" },
    { label: "Kalshi", env: "KALSHI_API_KEY" },
    { label: "Polymarket", env: "POLYMARKET_API_KEY" },
    { label: "News API", env: "NEWS_API_KEY" },
  ].map((s) => ({ ...s, ok: Boolean(process.env[s.env]) }));

  return (
    <>
      <PageHeader title="Settings" subtitle="Profile, plan, and the live status of every integration." />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <ProfileForm />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Plan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground">Current plan</div>
                <div className="text-lg font-semibold text-foreground">Pro</div>
              </div>
              <Badge>$49 / mo</Badge>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link href="/pricing">Manage subscription</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Automation & media</CardTitle>
          </CardHeader>
          <CardContent>
            <StatusRow label="Ruflo (automation)" ok={rufloStatus.connected} detail={`${rufloStatus.workflows} workflows · ${rufloStatus.mode} mode`} />
            <StatusRow label="Higgsfield (media)" ok={hfStatus.connected} detail={hfStatus.note} />
            <StatusRow label="Supabase (persistence)" ok={isSupabaseConfigured} detail="Auth, watchlists, history & reports" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Data sources</CardTitle>
          </CardHeader>
          <CardContent>
            {dataSources.map((s) => (
              <StatusRow key={s.label} label={s.label} ok={s.ok} detail={s.ok ? "Live key detected" : "Using deterministic mock feed"} />
            ))}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
