import { apiOk, rufloGuard } from "@/lib/api";
import { ruflo, runMarketScan } from "@/lib/integrations/ruflo";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** Ruflo Market Scan (every 15 min): scan the core universe, generate & store signals. */
async function handle(req: Request): Promise<Response> {
  const denied = rufloGuard(req);
  if (denied) return denied;
  const result = await runMarketScan();
  ruflo.log("market-scan.completed", {
    count: result.count,
    longs: result.longs,
    shorts: result.shorts,
    waits: result.waits,
  });
  return apiOk({ result });
}

export const GET = handle;
export const POST = handle;
