import { apiOk, parseBody, rufloGuard } from "@/lib/api";
import {
  ruflo,
  runConfidenceAlertSweep,
  runPredictionMarketAlertSweep,
} from "@/lib/integrations/ruflo";
import { z } from "zod";
import type { AlertChannel } from "@/lib/types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const bodySchema = z.object({
  symbol: z.string().min(1).max(12).optional(),
  direction: z.enum(["LONG", "SHORT", "WAIT"]).optional(),
  confidence: z.number().min(0).max(100).optional(),
  message: z.string().min(1).max(500).optional(),
  channels: z.array(z.enum(["email", "sms", "push", "telegram", "discord"])).default([]),
});

/** GET (cron): run the alert sweeps and dispatch everything over threshold. */
export async function GET(req: Request): Promise<Response> {
  const denied = rufloGuard(req);
  if (denied) return denied;
  const [confidenceHits, predictionHits] = await Promise.all([
    runConfidenceAlertSweep(),
    runPredictionMarketAlertSweep(),
  ]);
  const dispatched = await Promise.all(
    confidenceHits.map((h) =>
      ruflo.sendAlert({
        symbol: h.symbol,
        direction: h.direction,
        confidence: h.confidence,
        message: h.message,
        channels: [],
      })
    )
  );
  ruflo.log("alert-sweep.completed", {
    confidenceHits: confidenceHits.length,
    predictionHits: predictionHits.length,
  });
  return apiOk({ mode: "sweep", confidenceHits, predictionHits, dispatchedCount: dispatched.length });
}

/**
 * Ruflo Send Alert. Two modes:
 *  - Explicit: { symbol, direction, confidence, message } → dispatch that alert.
 *  - Sweep (empty body): run the Confidence + Prediction-Market alert sweeps and
 *    dispatch everything that breaches threshold.
 */
export async function POST(req: Request): Promise<Response> {
  const denied = rufloGuard(req);
  if (denied) return denied;
  const parsed = await parseBody(req, bodySchema);
  if ("error" in parsed) return parsed.error;
  const { symbol, direction, confidence, message, channels } = parsed.data;

  if (symbol && message && direction && confidence !== undefined) {
    const dispatched = await ruflo.sendAlert({
      symbol,
      direction,
      confidence,
      message,
      channels: channels as AlertChannel[],
    });
    return apiOk({ mode: "explicit", dispatched });
  }

  const [confidenceHits, predictionHits] = await Promise.all([
    runConfidenceAlertSweep(),
    runPredictionMarketAlertSweep(),
  ]);

  const dispatched = await Promise.all(
    confidenceHits.map((h) =>
      ruflo.sendAlert({
        symbol: h.symbol,
        direction: h.direction,
        confidence: h.confidence,
        message: h.message,
        channels: channels as AlertChannel[],
      })
    )
  );

  ruflo.log("alert-sweep.completed", {
    confidenceHits: confidenceHits.length,
    predictionHits: predictionHits.length,
  });

  return apiOk({
    mode: "sweep",
    confidenceHits,
    predictionHits,
    dispatchedCount: dispatched.length,
  });
}
