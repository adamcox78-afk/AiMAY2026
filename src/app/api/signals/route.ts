import { apiError, apiOk, timeframeSchema } from "@/lib/api";
import { getAllSignals, getSignal, getSignals } from "@/lib/data";
import type { Timeframe } from "@/lib/types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * GET /api/signals
 *   ?symbol=BTC            → one signal
 *   ?symbols=BTC,ETH,SOL   → many signals
 *   (none)                 → full default universe
 *   &timeframe=1D          → optional timeframe override
 */
export async function GET(req: Request): Promise<Response> {
  const { searchParams } = new URL(req.url);
  const tfRaw = searchParams.get("timeframe");
  const tf = tfRaw ? timeframeSchema.safeParse(tfRaw) : null;
  if (tf && !tf.success) return apiError("Invalid timeframe");
  const timeframe = (tf?.success ? tf.data : undefined) as Timeframe | undefined;

  const symbol = searchParams.get("symbol");
  const symbols = searchParams.get("symbols");

  if (symbol) {
    const signal = await getSignal(symbol, timeframe);
    if (!signal) return apiError(`Unknown symbol: ${symbol}`, 404);
    return apiOk({ signal });
  }

  if (symbols) {
    const list = symbols.split(",").map((s) => s.trim()).filter(Boolean);
    return apiOk({ signals: await getSignals(list, timeframe) });
  }

  return apiOk({ signals: await getAllSignals(timeframe) });
}
