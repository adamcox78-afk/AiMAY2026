import { apiOk, rufloGuard } from "@/lib/api";
import { ruflo, runDailyPerformanceReport } from "@/lib/integrations/ruflo";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** Ruflo Daily Performance Report: win rate, best/worst, long vs short. */
async function handle(req: Request): Promise<Response> {
  const denied = rufloGuard(req);
  if (denied) return denied;
  const report = await runDailyPerformanceReport();
  ruflo.log("daily-report.generated", { winRate: report.winRate, total: report.totalSignals });
  return apiOk({ report });
}

export const GET = handle;
export const POST = handle;
