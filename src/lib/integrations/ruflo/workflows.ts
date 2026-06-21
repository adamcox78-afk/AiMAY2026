/**
 * Ruflo workflow definitions + execution logic.
 *
 * Ruflo handles automation, scheduling, alerting, monitoring, logging and
 * reporting. It does NOT make trading decisions — it just triggers these
 * functions on a schedule (via the /api/ruflo/* endpoints) and routes the
 * results. The decision logic lives entirely in the signal engine.
 *
 * The `RUFLO_WORKFLOWS` manifest is what you register with the Ruflo daemon.
 */

import {
  ALERT_CONFIDENCE_THRESHOLD,
  MARKET_SCAN_SYMBOLS,
  PREDICTION_MOVE_ALERT_THRESHOLD,
} from "../../config";
import {
  getAllSignals,
  getPerformance,
  getSignalHistory,
  getSignals,
  listAllPredictionMarkets,
} from "../../data";
import { higgsfield } from "../higgsfield";
import type { Signal } from "../../types";

export interface RufloWorkflowDef {
  id: string;
  name: string;
  /** Cron expression for the Ruflo scheduler. */
  schedule: string;
  /** Endpoint Ruflo calls to execute the workflow. */
  endpoint: string;
  description: string;
}

/** The manifest Ruflo registers. Mirrors the product spec's six workflows. */
export const RUFLO_WORKFLOWS: RufloWorkflowDef[] = [
  {
    id: "market-scan",
    name: "Market Scan",
    schedule: "*/15 * * * *",
    endpoint: "/api/ruflo/scan-market",
    description: "Every 15 min: scan the core universe, generate & store signals.",
  },
  {
    id: "watchlist-scan",
    name: "Watchlist Scan",
    schedule: "*/5 * * * *",
    endpoint: "/api/ruflo/scan-watchlist",
    description: "Every 5 min: re-scan each user's watchlist assets.",
  },
  {
    id: "confidence-alert",
    name: "Confidence Alert",
    schedule: "*/15 * * * *",
    endpoint: "/api/ruflo/send-alert",
    description: `Alert when a signal's confidence exceeds ${ALERT_CONFIDENCE_THRESHOLD}%.`,
  },
  {
    id: "prediction-market-alert",
    name: "Prediction Market Alert",
    schedule: "*/15 * * * *",
    endpoint: "/api/ruflo/send-alert",
    description: `Alert when Polymarket/Kalshi odds move more than ${PREDICTION_MOVE_ALERT_THRESHOLD}%.`,
  },
  {
    id: "signal-outcome-logger",
    name: "Signal Outcome Logger",
    schedule: "0 * * * *",
    endpoint: "/api/ruflo/log-result",
    description: "Hourly: mark resolved signals won / lost / invalidated.",
  },
  {
    id: "daily-performance-report",
    name: "Daily Performance Report",
    schedule: "0 22 * * *",
    endpoint: "/api/ruflo/daily-report",
    description: "Daily: win rate, best/worst signals, long vs short performance.",
  },
  {
    id: "media-briefing",
    name: "Daily Media Briefing",
    schedule: "0 13 * * *",
    endpoint: "/api/ruflo/media-briefing",
    description: "Daily: trigger Higgsfield to render the 60-second market briefing.",
  },
  {
    id: "lead-followup",
    name: "Lead Follow-ups",
    schedule: "0 16 * * *",
    endpoint: "/api/ruflo/lead-followup",
    description: "Daily: personalized follow-ups for trials, upgrades, and re-engagement.",
  },
];

export interface MarketScanResult {
  scannedAt: string;
  count: number;
  signals: Signal[];
  longs: number;
  shorts: number;
  waits: number;
}

export async function runMarketScan(symbols: string[] = MARKET_SCAN_SYMBOLS): Promise<MarketScanResult> {
  const signals = await getSignals(symbols);
  return {
    scannedAt: new Date().toISOString(),
    count: signals.length,
    signals,
    longs: signals.filter((s) => s.direction === "LONG").length,
    shorts: signals.filter((s) => s.direction === "SHORT").length,
    waits: signals.filter((s) => s.direction === "WAIT").length,
  };
}

export async function runWatchlistScan(symbols: string[]): Promise<MarketScanResult> {
  return runMarketScan(symbols);
}

export interface HighConvictionHit {
  symbol: string;
  direction: Signal["direction"];
  confidence: number;
  message: string;
}

/** Confidence Alert sweep: returns the signals that breach the alert threshold. */
export async function runConfidenceAlertSweep(
  threshold = ALERT_CONFIDENCE_THRESHOLD
): Promise<HighConvictionHit[]> {
  const signals = await getAllSignals();
  return signals
    .filter((s) => s.direction !== "WAIT" && s.confidence >= threshold)
    .map((s) => ({
      symbol: s.asset.symbol,
      direction: s.direction,
      confidence: s.confidence,
      message: `${s.asset.symbol}: ${s.direction} at ${s.confidence}% confidence — ${s.reasonSummary}`,
    }));
}

export interface PredictionMoveHit {
  source: string;
  question: string;
  changePct: number;
  message: string;
}

/** Prediction Market Alert sweep: large odds moves on Kalshi/Polymarket. */
export async function runPredictionMarketAlertSweep(
  threshold = PREDICTION_MOVE_ALERT_THRESHOLD
): Promise<PredictionMoveHit[]> {
  const markets = await listAllPredictionMarkets();
  return markets
    .filter((m) => Math.abs(m.changePct) >= threshold)
    .map((m) => ({
      source: m.source,
      question: m.question,
      changePct: m.changePct,
      message: `${m.source.toUpperCase()} odds moved ${m.changePct > 0 ? "+" : ""}${m.changePct}%: ${m.question}`,
    }));
}

export async function runSignalOutcomeLogger() {
  const history = await getSignalHistory();
  const recent = history.slice(-12);
  return {
    loggedAt: new Date().toISOString(),
    resolved: recent.length,
    outcomes: recent.map((h) => ({ id: h.id, symbol: h.symbol, outcome: h.outcome, pnlPct: h.pnlPct })),
  };
}

export async function runDailyPerformanceReport() {
  const performance = await getPerformance();
  return {
    generatedAt: new Date().toISOString(),
    ...performance,
  };
}

/**
 * Media Briefing workflow: Ruflo triggers Higgsfield to render the daily market
 * briefing. Ruflo automates the schedule; Higgsfield does the visualization.
 */
export async function runMediaBriefing() {
  const [signals, movers] = await Promise.all([getAllSignals(), listAllPredictionMarkets()]);
  const topMovers = [...movers].sort((a, b) => Math.abs(b.changePct) - Math.abs(a.changePct));
  const job = await higgsfield.marketBriefing(signals, topMovers);
  return {
    generatedAt: new Date().toISOString(),
    jobId: job.id,
    status: job.status,
    title: job.brief.title,
    assetUrl: job.assetUrl ?? null,
    note: job.note,
  };
}

export interface LeadFollowup {
  lead: string;
  stage: string;
  message: string;
}

/**
 * Lead Follow-up workflow (scaffold). In production this queries leads from
 * Supabase — trial day-N, free-tier limit hits, watchlist-only users — and
 * personalizes each touch with the day's highest-conviction signal, dispatched
 * through the same alert channels. Today it runs against mock lead segments.
 */
export async function runLeadFollowups(): Promise<{ processedAt: string; followups: LeadFollowup[] }> {
  const signals = await getAllSignals();
  const best = [...signals].sort((a, b) => b.confidence - a.confidence)[0];
  const hook = best
    ? `Today's top call: ${best.asset.symbol} ${best.direction} at ${best.confidence}% confidence.`
    : "Fresh signals are live.";
  const segments = [
    { lead: "trial-day-3", stage: "activation" },
    { lead: "free-limit-reached", stage: "upgrade" },
    { lead: "watchlist-only", stage: "re-engage" },
  ];
  const followups = segments.map((s) => ({
    ...s,
    message: `${hook} ${
      s.stage === "upgrade"
        ? "Upgrade to Pro to act on every signal."
        : s.stage === "activation"
          ? "Add three assets to your watchlist to get tailored alerts."
          : "Come see what changed since your last visit."
    }`,
  }));
  return { processedAt: new Date().toISOString(), followups };
}
