import { apiOk, rufloGuard } from "@/lib/api";
import { ruflo, runMediaBriefing } from "@/lib/integrations/ruflo";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** Ruflo Media Briefing (daily): trigger Higgsfield to render the market briefing. */
async function handle(req: Request): Promise<Response> {
  const denied = rufloGuard(req);
  if (denied) return denied;
  const result = await runMediaBriefing();
  ruflo.log("media-briefing.completed", { jobId: result.jobId, status: result.status });
  return apiOk({ result });
}

export const GET = handle;
export const POST = handle;
