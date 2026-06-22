import { apiError, apiOk } from "@/lib/api";
import { resolveHiggsfield } from "@/lib/integrations/run-log";
import { z } from "zod";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * POST /api/media/webhook — Higgsfield render callback.
 *
 * Higgsfield calls this when an async generation finishes (the URL is sent as
 * `webhook_url` in the generation request). We update the run-log with the final
 * status + asset URL. Field names are normalized so it tolerates contract drift.
 *
 * Security: when HIGGSFIELD_WEBHOOK_SECRET is set, the caller must present it via
 * `x-higgsfield-signature` or `Authorization: Bearer <secret>`. Open in dev.
 */
const schema = z
  .object({
    id: z.string().optional(),
    job_id: z.string().optional(),
    generation_id: z.string().optional(),
    status: z.string().optional(),
    state: z.string().optional(),
    url: z.string().optional(),
    asset_url: z.string().optional(),
    output: z
      .object({ url: z.string().optional(), video_url: z.string().optional() })
      .partial()
      .optional(),
  })
  .passthrough();

function guard(req: Request): Response | null {
  const secret = process.env.HIGGSFIELD_WEBHOOK_SECRET;
  if (!secret) return null;
  const sig = req.headers.get("x-higgsfield-signature") ?? req.headers.get("authorization");
  if (sig === secret || sig === `Bearer ${secret}`) return null;
  return apiError("Unauthorized webhook", 401);
}

export async function POST(req: Request): Promise<Response> {
  const denied = guard(req);
  if (denied) return denied;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    body = {};
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) return apiError("Invalid webhook payload");

  const d = parsed.data;
  const jobId = d.id ?? d.job_id ?? d.generation_id;
  if (!jobId) return apiError("Missing job id");

  const status = (d.status ?? d.state ?? "ready").toLowerCase();
  const assetUrl = d.url ?? d.asset_url ?? d.output?.url ?? d.output?.video_url;
  const record = resolveHiggsfield(jobId, status, assetUrl);

  return apiOk({ updated: { jobId, status: record.status, assetUrl: record.assetUrl ?? null } });
}
