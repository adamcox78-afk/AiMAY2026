import { apiOk } from "@/lib/api";
import { getPerformance, getSignalHistory } from "@/lib/data";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** GET /api/performance → win rate, best/worst, equity curve + raw history. */
export async function GET(): Promise<Response> {
  const [performance, history] = await Promise.all([getPerformance(), getSignalHistory()]);
  return apiOk({ performance, history });
}
