import Link from "next/link";
import { Clapperboard, Database, ExternalLink, RadioTower } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { ruflo } from "@/lib/integrations/ruflo";
import { higgsfield } from "@/lib/integrations/higgsfield";
import { getRunLogSnapshot } from "@/lib/integrations/run-log";
import { isSupabaseConfigured } from "@/lib/db/supabase";
import { cn } from "@/lib/utils";

function ago(iso?: string | null): string {
  if (!iso) return "no runs yet";
  const m = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  return h < 24 ? `${h}h ago` : `${Math.floor(h / 24)}d ago`;
}

function Item({
  icon: Icon,
  label,
  connected,
  detail,
}: {
  icon: React.ElementType;
  label: string;
  connected: boolean;
  detail: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="grid size-9 shrink-0 place-items-center rounded-lg border border-border bg-background">
        <Icon className="size-4 text-muted-foreground" />
      </div>
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground">{label}</span>
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium",
              connected
                ? "bg-[hsl(var(--long)/0.15)] text-[hsl(var(--long))]"
                : "bg-[hsl(var(--wait)/0.15)] text-[hsl(var(--wait))]"
            )}
          >
            <span className={cn("size-1.5 rounded-full", connected ? "bg-[hsl(var(--long))]" : "bg-[hsl(var(--wait))]")} />
            {connected ? "Connected" : "Not connected"}
          </span>
        </div>
        <p className="truncate text-xs text-muted-foreground">{detail}</p>
      </div>
    </div>
  );
}

/** Live, env-driven integration status. Flips to "Connected" when keys are present. */
export async function IntegrationStatusPanel() {
  const rs = ruflo.status();
  const hs = higgsfield.status();
  const log = await getRunLogSnapshot();

  return (
    <Card>
      <CardContent className="p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Integrations
          </h3>
          <Link href="/health" className="flex items-center gap-1 text-xs text-primary hover:underline">
            System health <ExternalLink className="size-3" />
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <Item
            icon={RadioTower}
            label="Ruflo"
            connected={rs.connected}
            detail={
              rs.connected
                ? `${rs.mode} · ${rs.workflows} workflows · last run ${ago(log.rufloLast?.at)}`
                : "Set RUFLO_API_KEY or RUFLO_WEBHOOK_SECRET"
            }
          />
          <Item
            icon={Clapperboard}
            label="Higgsfield"
            connected={hs.connected}
            detail={
              hs.connected
                ? `live · last media ${ago(log.higgsfieldLast?.at)}`
                : "Set HIGGSFIELD_API_KEY to render media"
            }
          />
          <Item
            icon={Database}
            label="Supabase"
            connected={isSupabaseConfigured}
            detail={isSupabaseConfigured ? "persistence active" : "optional — mock data in use"}
          />
        </div>
      </CardContent>
    </Card>
  );
}
