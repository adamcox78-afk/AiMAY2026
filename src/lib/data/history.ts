/**
 * Deterministic track-record + performance synthesis.
 *
 * In production these rows come from the `signal_history` table (outcomes logged
 * by Ruflo's Signal Outcome Logger workflow). For the MVP we synthesize a
 * believable history so the Performance and Track Record pages are populated.
 */

import { MARKET_SCAN_SYMBOLS } from "../config";
import type {
  PerformanceSummary,
  SignalDirection,
  SignalHistoryEntry,
  SignalOutcome,
  Timeframe,
} from "../types";

function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const TIMEFRAMES: Timeframe[] = ["15m", "1H", "4H", "1D", "1W"];

export function generateSignalHistory(count = 60): SignalHistoryEntry[] {
  const r = rng(0xa9e1);
  const entries: SignalHistoryEntry[] = [];
  const dayMs = 24 * 60 * 60 * 1000;
  for (let i = 0; i < count; i++) {
    const symbol = MARKET_SCAN_SYMBOLS[Math.floor(r() * MARKET_SCAN_SYMBOLS.length)];
    const direction: SignalDirection = r() > 0.42 ? "LONG" : "SHORT";
    const confidence = Math.round(62 + r() * 33);
    // Higher-confidence signals win more often — the model should be calibrated.
    const winProb = 0.4 + (confidence - 62) / 33 * 0.4;
    const win = r() < winProb;
    const invalidated = !win && r() < 0.25;
    const outcome: SignalOutcome = invalidated ? "invalidated" : win ? "won" : "lost";
    const magnitude = 1 + r() * 6;
    const sign = direction === "LONG" ? 1 : -1;
    const pnlPct = Number(
      (win ? magnitude : invalidated ? -magnitude * 0.5 : -magnitude * 0.8).toFixed(2)
    );
    const openedAt = new Date(Date.now() - (count - i) * dayMs - r() * dayMs);
    const closedAt = new Date(openedAt.getTime() + (1 + r() * 3) * dayMs);
    const entryPrice = Number((10 + r() * 600).toFixed(2));
    entries.push({
      id: `sh_${i}_${symbol}`,
      symbol,
      direction,
      confidence,
      entryPrice,
      outcome,
      pnlPct,
      openedAt: openedAt.toISOString(),
      closedAt: closedAt.toISOString(),
      timeframe: TIMEFRAMES[Math.floor(r() * TIMEFRAMES.length)],
      // sign is baked into pnlPct already; kept for clarity
    });
    void sign;
  }
  return entries;
}

export function summarizePerformance(history: SignalHistoryEntry[]): PerformanceSummary {
  const closed = history.filter((h) => h.outcome !== "open");
  const wins = closed.filter((h) => h.outcome === "won");
  const losses = closed.filter((h) => h.outcome !== "won");
  const longs = closed.filter((h) => h.direction === "LONG");
  const shorts = closed.filter((h) => h.direction === "SHORT");

  const winRate = closed.length ? (wins.length / closed.length) * 100 : 0;
  const avgWinPct = avg(wins.map((h) => h.pnlPct));
  const avgLossPct = avg(losses.map((h) => h.pnlPct));
  const longWinRate = rate(longs);
  const shortWinRate = rate(shorts);

  const sorted = [...closed].sort((a, b) => b.pnlPct - a.pnlPct);
  const bestSignal = sorted[0];
  const worstSignal = sorted[sorted.length - 1];

  // Equity curve: compound 1% risk per trade by pnl sign.
  let equity = 10000;
  const ordered = [...closed].sort(
    (a, b) => new Date(a.openedAt).getTime() - new Date(b.openedAt).getTime()
  );
  const equityCurve = ordered.map((h) => {
    equity *= 1 + h.pnlPct / 100 * 0.25;
    return { t: h.closedAt ?? h.openedAt, value: Math.round(equity) };
  });

  return {
    totalSignals: closed.length,
    winRate: Number(winRate.toFixed(1)),
    avgWinPct: Number(avgWinPct.toFixed(2)),
    avgLossPct: Number(avgLossPct.toFixed(2)),
    longWinRate: Number(longWinRate.toFixed(1)),
    shortWinRate: Number(shortWinRate.toFixed(1)),
    bestSignal,
    worstSignal,
    equityCurve,
  };
}

const avg = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);
const rate = (xs: SignalHistoryEntry[]) =>
  xs.length ? (xs.filter((h) => h.outcome === "won").length / xs.length) * 100 : 0;
