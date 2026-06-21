/**
 * Deterministic data synthesis for the MVP.
 *
 * A seeded PRNG produces realistic OHLCV, sentiment, and prediction-market data
 * that is STABLE per symbol — the same symbol always yields the same series in a
 * given build. That keeps signals reproducible, avoids React hydration
 * mismatches, and lets the engine be unit-tested against fixed fixtures.
 */

import type {
  Candle,
  PredictionMarketData,
  SentimentData,
} from "../types";

/** mulberry32 — tiny, fast, deterministic PRNG. */
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hash(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Box–Muller normal sample from a uniform generator. */
function gaussian(rng: () => number): number {
  let u = 0;
  let v = 0;
  while (u === 0) u = rng();
  while (v === 0) v = rng();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

interface SymbolProfile {
  base: number;
  /** Per-bar drift (fraction). Positive = uptrend bias. */
  drift: number;
  /** Per-bar volatility (fraction). */
  vol: number;
}

/**
 * Per-symbol character. Tuned to produce a believable spread of signals across
 * the default universe (some LONG, some SHORT, some WAIT) so the demo looks alive.
 */
const PROFILES: Record<string, SymbolProfile> = {
  BTC: { base: 67250, drift: 0.0022, vol: 0.026 },
  ETH: { base: 3520, drift: 0.0004, vol: 0.03 },
  SOL: { base: 152, drift: 0.0035, vol: 0.045 },
  AAPL: { base: 226, drift: 0.0009, vol: 0.014 },
  TSLA: { base: 251, drift: -0.0018, vol: 0.033 },
  NVDA: { base: 121, drift: 0.0026, vol: 0.028 },
  SPY: { base: 561, drift: 0.0006, vol: 0.009 },
  QQQ: { base: 482, drift: 0.0011, vol: 0.012 },
};

const DEFAULT_PROFILE: SymbolProfile = { base: 100, drift: 0.0005, vol: 0.02 };

export function profileFor(symbol: string): SymbolProfile {
  return PROFILES[symbol.toUpperCase()] ?? { ...DEFAULT_PROFILE, base: 50 + (hash(symbol) % 400) };
}

/** Generate `count` daily candles ending "now", deterministic per symbol. */
export function generateCandles(symbol: string, count = 180): Candle[] {
  const { base, drift, vol } = profileFor(symbol);
  const rng = mulberry32(hash(symbol));
  const dayMs = 24 * 60 * 60 * 1000;
  const start = Date.now() - count * dayMs;

  const candles: Candle[] = [];
  let price = base * (0.7 + rng() * 0.2); // start below current, trend into it
  // Slow-moving regime so trends persist and mean-revert realistically.
  let regime = 0;
  for (let i = 0; i < count; i++) {
    if (i % 22 === 0) regime = (gaussian(rng) * vol) / 2;
    const shock = gaussian(rng) * vol;
    const ret = drift + regime + shock;
    const open = price;
    const close = Math.max(0.01, open * (1 + ret));
    const wick = Math.abs(gaussian(rng)) * vol * open;
    const high = Math.max(open, close) + wick * 0.6;
    const low = Math.min(open, close) - wick * 0.6;
    const baseVol = (PROFILES[symbol.toUpperCase()]?.base ?? 100) > 1000 ? 1e9 : 5e6;
    const volume = baseVol * (0.6 + rng() * 1.4) * (1 + Math.abs(ret) * 8);
    candles.push({
      t: start + i * dayMs,
      o: round(open),
      h: round(high),
      l: round(low),
      c: round(close),
      v: Math.round(volume),
    });
    price = close;
  }
  return candles;
}

export function generateSentiment(symbol: string): SentimentData {
  const rng = mulberry32(hash(symbol + ":sentiment"));
  const score = Number((gaussian(rng) * 0.45).toFixed(2));
  const clamped = Math.max(-1, Math.min(1, score));
  const mood = clamped > 0.2 ? "bullish" : clamped < -0.2 ? "bearish" : "mixed";
  return {
    score: clamped,
    newsVolume: Math.round(40 + rng() * 55),
    socialVolume: Math.round(35 + rng() * 60),
    headlines: [
      `${symbol} ${mood} chatter rises across financial media`,
      `Analysts revisit ${symbol} positioning amid ${mood} tape`,
      `Retail flows tilt ${mood} on ${symbol} this week`,
    ],
    source: "mock",
  };
}

const PREDICTION_TEMPLATES: Record<string, { q: string; src: "kalshi" | "polymarket" }[]> = {
  BTC: [
    { q: "Will BTC close above $70,000 this month?", src: "polymarket" },
    { q: "BTC above $65k at end of week?", src: "kalshi" },
  ],
  ETH: [{ q: "Will ETH outperform BTC this month?", src: "polymarket" }],
  SOL: [{ q: "Will SOL reach a new 90-day high this month?", src: "polymarket" }],
  NVDA: [{ q: "Will NVDA beat earnings estimates?", src: "kalshi" }],
  TSLA: [{ q: "Will TSLA close green this week?", src: "kalshi" }],
  SPY: [{ q: "Will the S&P 500 end the week higher?", src: "kalshi" }],
  QQQ: [{ q: "Will the Nasdaq 100 make a new high this quarter?", src: "kalshi" }],
  AAPL: [{ q: "Will AAPL hold above its 50-day average?", src: "kalshi" }],
};

export function generatePredictionMarkets(symbol: string): PredictionMarketData[] {
  const templates = PREDICTION_TEMPLATES[symbol.toUpperCase()] ?? [];
  const rng = mulberry32(hash(symbol + ":prediction"));
  return templates.map((t) => ({
    source: t.src,
    question: t.q,
    yesPrice: Number((0.25 + rng() * 0.55).toFixed(2)),
    changePct: Number((gaussian(rng) * 6).toFixed(1)),
    volumeUsd: Math.round(50000 + rng() * 4_500_000),
  }));
}

function round(n: number): number {
  if (n >= 1000) return Math.round(n * 10) / 10;
  if (n >= 1) return Math.round(n * 100) / 100;
  return Math.round(n * 10000) / 10000;
}
