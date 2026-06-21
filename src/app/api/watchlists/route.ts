import { apiOk, parseBody } from "@/lib/api";
import { getAllSignals, getSignals } from "@/lib/data";
import { MARKET_SCAN_SYMBOLS } from "@/lib/config";
import { z } from "zod";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** GET /api/watchlists → signals for the default watchlist universe. */
export async function GET(): Promise<Response> {
  return apiOk({ symbols: MARKET_SCAN_SYMBOLS, signals: await getAllSignals() });
}

const bodySchema = z.object({
  symbols: z.array(z.string().min(1).max(12)).min(1).max(50),
});

/** POST /api/watchlists { symbols } → signals for a custom watchlist. */
export async function POST(req: Request): Promise<Response> {
  const parsed = await parseBody(req, bodySchema);
  if ("error" in parsed) return parsed.error;
  const signals = await getSignals(parsed.data.symbols);
  return apiOk({ symbols: parsed.data.symbols, signals });
}
