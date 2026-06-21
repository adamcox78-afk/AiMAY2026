import { apiOk, rufloGuard } from "@/lib/api";
import { ruflo, runLeadFollowups } from "@/lib/integrations/ruflo";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** Ruflo Lead Follow-ups (daily): personalized activation / upgrade / re-engage touches. */
async function handle(req: Request): Promise<Response> {
  const denied = rufloGuard(req);
  if (denied) return denied;
  const result = await runLeadFollowups();
  ruflo.log("lead-followup.completed", { followups: result.followups.length });
  return apiOk({ result });
}

export const GET = handle;
export const POST = handle;
