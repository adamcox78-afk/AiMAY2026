import { apiOk, rufloGuard } from "@/lib/api";
import { ruflo, runSignalOutcomeLogger } from "@/lib/integrations/ruflo";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** Ruflo Signal Outcome Logger (hourly): mark resolved signals won/lost/invalidated. */
async function handle(req: Request): Promise<Response> {
  const denied = rufloGuard(req);
  if (denied) return denied;
  const result = await runSignalOutcomeLogger();
  ruflo.log("outcome-logger.completed", { resolved: result.resolved });
  return apiOk({ result });
}

export const GET = handle;
export const POST = handle;
