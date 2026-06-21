import { apiError, apiOk, parseBody, rufloGuard, symbolSchema, timeframeSchema } from "@/lib/api";
import { getSignal } from "@/lib/data";
import { ruflo } from "@/lib/integrations/ruflo";
import { z } from "zod";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const bodySchema = z.object({
  symbol: symbolSchema,
  timeframe: timeframeSchema.optional(),
});

/** Ruflo Generate Signal: run the engine for one asset on demand. */
export async function POST(req: Request): Promise<Response> {
  const denied = rufloGuard(req);
  if (denied) return denied;
  const parsed = await parseBody(req, bodySchema);
  if ("error" in parsed) return parsed.error;
  const signal = await getSignal(parsed.data.symbol, parsed.data.timeframe);
  if (!signal) return apiError(`Unknown symbol: ${parsed.data.symbol}`, 404);
  ruflo.log("signal.generated", { symbol: signal.asset.symbol, direction: signal.direction });
  return apiOk({ signal });
}
