import Link from "next/link";
import { Activity, ArrowLeft, CheckCircle2, Circle, Clapperboard, Database, RadioTower } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ruflo, RUFLO_WORKFLOWS } from "@/lib/integrations/ruflo";
import { higgsfield } from "@/lib/integrations/higgsfield";
import { getRunLog } from "@/lib/integrations/run-log";
import { isSupabaseConfigured } from "@/lib/db/supabase";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = { title: "System Health" };

function ago(iso?: string | null): string {
  if (!iso) return "never";
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function Dot({ ok }: { ok: boolean }) {
  return ok ? (
    <CheckCircle2 className="size-5 text-[hsl(var(--long))]" />
  ) : (
    <Circle className="size-5 text-[hsl(var(--wait))]" />
  );
}

export default function HealthPage() {
  const rs = ruflo.status();
  const hs = higgsfield.status();
  const log = getRunLog();

  const services = [
    { icon: RadioTower, label: "Ruflo (automation)", ok: rs.connected, detail: rs.connected ? `${rs.mode} mode · ${rs.workflows} workflows` : "Local mode — set RUFLO_API_KEY / RUFLO_WEBHOOK_SECRET" },
    { icon: Clapperboard, label: "Higgsfield (media)", ok: hs.connected, detail: hs.connected ? "Live rendering" : "Set HIGGSFIELD_API_KEY to render" },
    { icon: Database, label: "Supabase (persistence)", ok: isSupabaseConfigured, detail: isSupabaseConfigured ? "Connected" : "Optional — app runs on mock data" },
  ];

  return (
    <div className="min-h-screen px-4 py-10">
      <div className="mx-auto w-full max-w-3xl space-y-6">
        <div className="flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="size-4" /> Back
          </Link>
          <Logo />
        </div>

        <div className="flex items-center gap-2">
          <Activity className="size-5 text-primary" />
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">System Health</h1>
          <Badge variant="long" className="ml-2">Operational</Badge>
        </div>

        {/* Service connectivity */}
        <div className="grid gap-3 sm:grid-cols-3">
          {services.map((s) => (
            <Card key={s.label}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <s.icon className="size-4 text-muted-foreground" />
                  <Dot ok={s.ok} />
                </div>
                <div className="mt-3 text-sm font-medium text-foreground">{s.label}</div>
                <div className="text-xs text-muted-foreground">{s.detail}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Last activity */}
        <div className="grid gap-3 sm:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Last Ruflo workflow run</CardTitle>
            </CardHeader>
            <CardContent>
              {log.rufloLast ? (
                <div>
                  <div className="font-medium text-foreground">{log.rufloLast.id}</div>
                  <div className="text-xs text-muted-foreground">{ago(log.rufloLast.at)} · {log.rufloLast.summary}</div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No runs yet — trigger a workflow or wait for cron.</p>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Last Higgsfield generation</CardTitle>
            </CardHeader>
            <CardContent>
              {log.higgsfieldLast ? (
                <div>
                  <div className="font-medium capitalize text-foreground">{log.higgsfieldLast.id.replace("-", " ")}</div>
                  <div className="text-xs text-muted-foreground">{ago(log.higgsfieldLast.at)} · {log.higgsfieldLast.summary}</div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No media generated yet.</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Workflow registry */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Ruflo workflow registry</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <tr className="border-b border-border">
                    <th className="px-6 py-3 font-medium">Workflow</th>
                    <th className="px-6 py-3 font-medium">Schedule</th>
                    <th className="px-6 py-3 text-right font-medium">Last run</th>
                  </tr>
                </thead>
                <tbody>
                  {RUFLO_WORKFLOWS.map((w) => {
                    const run = log.ruflo[w.id];
                    return (
                      <tr key={w.id} className="border-b border-border/50 last:border-0">
                        <td className="px-6 py-3">
                          <div className="font-medium text-foreground">{w.name}</div>
                          <div className="text-xs text-muted-foreground">{w.endpoint}</div>
                        </td>
                        <td className="stat-mono px-6 py-3 text-muted-foreground">{w.schedule}</td>
                        <td className={cn("px-6 py-3 text-right", run ? "text-foreground" : "text-muted-foreground")}>
                          {ago(run?.at)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground">
          Machine-readable status at <Link href="/api/health" className="text-primary">/api/health</Link>
        </p>
      </div>
    </div>
  );
}
