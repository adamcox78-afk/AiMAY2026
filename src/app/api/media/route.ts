import { apiError, apiOk } from "@/lib/api";
import { getAllSignals, getSignal, listAllPredictionMarkets } from "@/lib/data";
import { higgsfield, type SocialPlatform } from "@/lib/integrations/higgsfield";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * GET /api/media — generate a Higgsfield creative brief (and a render job).
 *   ?kind=briefing                      → daily market briefing
 *   ?kind=signal&symbol=BTC             → signal explainer (high-conviction only)
 *   ?kind=social&symbol=BTC&platform=x  → social clip
 *   ?kind=viz&symbol=BTC                → probability-cone visualization
 *
 * Higgsfield only visualizes pre-computed signals — it performs no calculations.
 */
export async function GET(req: Request): Promise<Response> {
  const { searchParams } = new URL(req.url);
  const kind = searchParams.get("kind") ?? "briefing";
  const symbol = searchParams.get("symbol") ?? "BTC";

  if (kind === "briefing") {
    const [signals, movers] = await Promise.all([getAllSignals(), listAllPredictionMarkets()]);
    const job = await higgsfield.marketBriefing(
      signals,
      movers.sort((a, b) => Math.abs(b.changePct) - Math.abs(a.changePct))
    );
    return apiOk({ job });
  }

  const signal = await getSignal(symbol);
  if (!signal) return apiError(`Unknown symbol: ${symbol}`, 404);

  if (kind === "signal") {
    const job = await higgsfield.signalVideo(signal);
    if (!job) return apiOk({ job: null, note: "Signal below the video confidence threshold (80%)." });
    return apiOk({ job });
  }

  if (kind === "social") {
    const platform = (searchParams.get("platform") ?? "x") as SocialPlatform;
    const jobs = await higgsfield.social(signal, [platform]);
    return apiOk({ jobs });
  }

  if (kind === "viz") {
    const job = await higgsfield.probabilityViz(signal);
    return apiOk({ job });
  }

  return apiError(`Unknown media kind: ${kind}`);
}
