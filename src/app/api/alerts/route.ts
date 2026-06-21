import { apiOk, parseBody } from "@/lib/api";
import { getAllSignals } from "@/lib/data";
import { ALERT_CONFIDENCE_THRESHOLD } from "@/lib/config";
import { ruflo } from "@/lib/integrations/ruflo";
import { z } from "zod";
import type { AlertChannel } from "@/lib/types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** GET /api/alerts → current high-conviction alerts derived from live signals. */
export async function GET(): Promise<Response> {
  const signals = await getAllSignals();
  const alerts = signals
    .filter((s) => s.direction !== "WAIT" && s.confidence >= ALERT_CONFIDENCE_THRESHOLD)
    .map((s) => ({
      id: `alert_${s.asset.symbol}`,
      symbol: s.asset.symbol,
      direction: s.direction,
      confidence: s.confidence,
      message: `${s.asset.symbol}: ${s.direction} at ${s.confidence}% — ${s.reasonSummary}`,
      createdAt: s.generatedAt,
    }));
  return apiOk({ threshold: ALERT_CONFIDENCE_THRESHOLD, alerts });
}

const bodySchema = z.object({
  symbol: z.string().min(1).max(12),
  direction: z.enum(["LONG", "SHORT", "WAIT"]),
  confidence: z.number().min(0).max(100),
  message: z.string().min(1).max(500),
  channels: z.array(z.enum(["email", "sms", "push", "telegram", "discord"])).default([]),
});

/** POST /api/alerts → dispatch an alert through the configured channels. */
export async function POST(req: Request): Promise<Response> {
  const parsed = await parseBody(req, bodySchema);
  if ("error" in parsed) return parsed.error;
  const results = await ruflo.sendAlert({
    ...parsed.data,
    channels: parsed.data.channels as AlertChannel[],
  });
  return apiOk({ dispatched: results });
}
