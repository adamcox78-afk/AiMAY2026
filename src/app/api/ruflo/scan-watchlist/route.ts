import { apiOk, parseBody, rufloGuard } from "@/lib/api";
import { ruflo, runWatchlistScan } from "@/lib/integrations/ruflo";
import { MARKET_SCAN_SYMBOLS } from "@/lib/config";
import { z } from "zod";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const bodySchema = z.object({
  symbols: z.array(z.string().min(1).max(12)).min(1).max(50).optional(),
});

/** GET (cron): re-scan the default universe. */
export async function GET(req: Request): Promise<Response> {
  const denied = rufloGuard(req);
  if (denied) return denied;
  const result = await runWatchlistScan(MARKET_SCAN_SYMBOLS);
  ruflo.log("watchlist-scan.completed", { count: result.count });
  return apiOk({ result });
}

/** Ruflo Watchlist Scan (every 5 min): re-scan a user's watchlist assets. */
export async function POST(req: Request): Promise<Response> {
  const denied = rufloGuard(req);
  if (denied) return denied;
  const parsed = await parseBody(req, bodySchema);
  if ("error" in parsed) return parsed.error;
  const symbols = parsed.data.symbols ?? MARKET_SCAN_SYMBOLS;
  const result = await runWatchlistScan(symbols);
  ruflo.log("watchlist-scan.completed", { count: result.count });
  return apiOk({ result });
}
