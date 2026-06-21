import { apiOk } from "@/lib/api";
import { listAssets } from "@/lib/data";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** GET /api/assets → the tradable asset universe. */
export async function GET(): Promise<Response> {
  return apiOk({ assets: await listAssets() });
}
