/**
 * Apex Signal — component scorers.
 *
 * Each function converts raw market/sentiment/prediction data into a single
 * directional score in [0,100] (50 = neutral) plus a short human detail. The
 * engine then weights and blends them into the composite. Keeping these pure and
 * isolated makes the whole engine auditable: every number traces to a function.
 */

import {
  atr,
  bollinger,
  clamp,
  closes,
  last,
  macd as macdReading,
  mean,
  realizedVolatility,
  rsi,
  scale,
  sma,
  supportResistance,
  trendSlope,
  volumes,
} from "../indicators";
import { COMPONENT_LABELS, SIGNAL_WEIGHTS } from "../config";
import type {
  Candle,
  ComponentKey,
  ComponentScore,
  MarketSnapshot,
  PredictionMarketData,
  SentimentData,
} from "../types";

interface Reading {
  score: number;
  detail: string;
}

const pct = (n: number) => `${n >= 0 ? "+" : ""}${n.toFixed(1)}%`;

function scoreRsi(c: Candle[]): Reading {
  const r = rsi(closes(c));
  // Momentum reading: above 50 bullish, below bearish. Fade extremes slightly
  // so blow-off tops and capitulation wicks don't max the score.
  let score = scale(r, 30, 70, 22, 78);
  if (r > 78) score -= (r - 78) * 0.8; // overbought caution
  if (r < 22) score += (22 - r) * 0.8; // oversold bounce
  score = clamp(score, 0, 100);
  const tone = r > 60 ? "strong upward" : r < 40 ? "weak / downward" : "balanced";
  return { score, detail: `Momentum is ${tone} (RSI ${r.toFixed(0)}).` };
}

function scoreMacd(c: Candle[]): Reading {
  const cl = closes(c);
  const { macd, signal, histogram } = macdReading(cl);
  const price = last(cl) || 1;
  // Normalize the histogram by price so the score is comparable across assets.
  const norm = (histogram / price) * 100;
  let score = 50 + scale(norm, -1.5, 1.5, -45, 45);
  if (macd > signal) score += 4;
  else score -= 4;
  score = clamp(score, 0, 100);
  const cross = macd > signal ? "bullish (line above signal)" : "bearish (line below signal)";
  return { score, detail: `Trend momentum is ${cross}.` };
}

function scoreMovingAverages(c: Candle[]): Reading {
  const cl = closes(c);
  const price = last(cl);
  const fast = sma(cl, 20);
  const slow = sma(cl, 50);
  let score = 50;
  score += price > fast ? 14 : -14;
  score += fast > slow ? 14 : -14;
  score += price > slow ? 8 : -8;
  score = clamp(score, 0, 100);
  const stacked =
    price > fast && fast > slow
      ? "stacked bullishly"
      : price < fast && fast < slow
        ? "stacked bearishly"
        : "mixed";
  return { score, detail: `Price vs moving averages is ${stacked}.` };
}

function scoreTrendStrength(c: Candle[]): Reading {
  const slope = trendSlope(closes(c)); // fraction of price per bar
  const score = clamp(50 + scale(slope * 100, -1.2, 1.2, -48, 48), 0, 100);
  const dir = slope > 0.0005 ? "rising" : slope < -0.0005 ? "falling" : "flat";
  return { score, detail: `The underlying trend is ${dir}.` };
}

function scoreVolume(c: Candle[]): Reading {
  const vols = volumes(c);
  const cl = closes(c);
  if (vols.length < 6) return { score: 50, detail: "Not enough volume history." };
  const recentVol = mean(vols.slice(-3));
  const baseVol = sma(vols, 20) || recentVol || 1;
  const ratio = recentVol / baseVol;
  const ret = (last(cl) - cl[cl.length - 4]) / cl[cl.length - 4];
  // Volume confirms the move: heavy volume + up = buying pressure, and vice versa.
  const direction = Math.sign(ret) || 1;
  const intensity = scale(ratio, 0.6, 1.8, 0, 32);
  const score = clamp(50 + direction * intensity, 0, 100);
  const label = ratio > 1.15 ? "above average" : ratio < 0.85 ? "below average" : "average";
  const flow = direction > 0 ? "buying" : "selling";
  return { score, detail: `Volume is ${label}, confirming ${flow} pressure.` };
}

function scoreAtr(c: Candle[]): Reading {
  const cl = closes(c);
  const price = last(cl) || 1;
  const a = atr(c);
  const atrPct = (a / price) * 100;
  const recentRet = cl.length > 5 ? (last(cl) - cl[cl.length - 6]) / cl[cl.length - 6] : 0;
  // Volatility expansion in the direction of the move adds conviction.
  const tilt = Math.sign(recentRet) * scale(atrPct, 0.5, 5, 0, 14);
  const score = clamp(50 + tilt, 0, 100);
  const regime = atrPct > 4 ? "high" : atrPct < 1.2 ? "low" : "moderate";
  return { score, detail: `True range is ${regime} (${atrPct.toFixed(1)}% of price).` };
}

function scoreVolatility(c: Candle[]): Reading {
  const cl = closes(c);
  const b = bollinger(cl);
  // %B above 0.5 = upper half of the range (bullish), below = lower half.
  let score = scale(b.percentB, 0, 1, 12, 88);
  // A volatility squeeze (very tight bands) is coiled energy → pull toward neutral.
  if (b.bandwidth < 0.04) score = 50 + (score - 50) * 0.5;
  score = clamp(score, 0, 100);
  const where =
    b.percentB > 0.8 ? "near the top" : b.percentB < 0.2 ? "near the bottom" : "mid-range";
  return { score, detail: `Price sits ${where} of its volatility band.` };
}

function scoreSentiment(s?: SentimentData): Reading {
  if (!s) return { score: 50, detail: "No sentiment feed connected." };
  const score = clamp(scale(s.score, -1, 1, 5, 95), 0, 100);
  const mood = s.score > 0.25 ? "positive" : s.score < -0.25 ? "negative" : "mixed";
  return { score, detail: `News & social sentiment is ${mood}.` };
}

function scorePredictionMarkets(pm?: PredictionMarketData[]): Reading {
  if (!pm || pm.length === 0) return { score: 50, detail: "No prediction markets tracked." };
  const totalVol = pm.reduce((a, m) => a + m.volumeUsd, 0) || 1;
  const weightedYes =
    pm.reduce((a, m) => a + m.yesPrice * m.volumeUsd, 0) / totalVol; // 0..1
  const drift = pm.reduce((a, m) => a + m.changePct, 0) / pm.length; // pct pts
  let score = scale(weightedYes, 0.2, 0.8, 10, 90);
  score += clamp(drift, -10, 10) * 0.8;
  score = clamp(score, 0, 100);
  const odds = Math.round(weightedYes * 100);
  return { score, detail: `Prediction markets imply ${odds}% bullish odds (${pct(drift)} drift).` };
}

/**
 * Historical pattern match: nearest-neighbor search over the asset's own past.
 * Finds the most similar recent price fractal and reports what happened next.
 */
function scorePatternMatch(c: Candle[]): Reading {
  const cl = closes(c);
  const W = 10; // pattern window
  const K = 5; // forward horizon
  if (cl.length < W + K + 20) return { score: 50, detail: "Insufficient history for analogs." };

  const normalize = (slice: number[]) => {
    const base = slice[0] || 1;
    return slice.map((v) => v / base - 1);
  };
  const target = normalize(cl.slice(cl.length - W));

  let bestDist = Infinity;
  let bestForward = 0;
  for (let i = 0; i <= cl.length - W - K - 1; i++) {
    // Skip windows that overlap the target.
    if (i > cl.length - 2 * W) break;
    const cand = normalize(cl.slice(i, i + W));
    let dist = 0;
    for (let j = 0; j < W; j++) dist += (cand[j] - target[j]) ** 2;
    if (dist < bestDist) {
      bestDist = dist;
      const after = cl[i + W + K - 1];
      const at = cl[i + W - 1];
      bestForward = (after - at) / at;
    }
  }
  const score = clamp(50 + scale(bestForward * 100, -8, 8, -42, 42), 0, 100);
  return {
    score,
    detail: `Closest historical analog resolved ${pct(bestForward * 100)} over the next ${K} bars.`,
  };
}

/** Informational: not weighted, but powers entry/invalidation zones. */
function scoreSupportResistance(c: Candle[]): Reading {
  const sr = supportResistance(c);
  // Room to run up (near support) is constructive; pinned at resistance is not.
  const score = clamp(scale(sr.position, 0, 1, 78, 22), 0, 100);
  const where =
    sr.position < 0.25 ? "near support" : sr.position > 0.75 ? "near resistance" : "mid-structure";
  return { score, detail: `Price is ${where} of its recent range.` };
}

const build = (key: ComponentKey, r: Reading): ComponentScore => {
  const weight = SIGNAL_WEIGHTS[key] ?? 0;
  return {
    key,
    label: COMPONENT_LABELS[key],
    score: Math.round(r.score),
    weight,
    contribution: r.score * weight,
    detail: r.detail,
  };
};

/** Compute all eleven component scores for one asset. */
export function computeComponents(
  market: MarketSnapshot,
  sentiment?: SentimentData,
  predictionMarkets?: PredictionMarketData[]
): ComponentScore[] {
  const c = market.candles;
  return [
    build("rsi", scoreRsi(c)),
    build("macd", scoreMacd(c)),
    build("movingAverages", scoreMovingAverages(c)),
    build("trendStrength", scoreTrendStrength(c)),
    build("volume", scoreVolume(c)),
    build("atr", scoreAtr(c)),
    build("volatility", scoreVolatility(c)),
    build("sentiment", scoreSentiment(sentiment)),
    build("predictionMarkets", scorePredictionMarkets(predictionMarkets)),
    build("patternMatch", scorePatternMatch(c)),
    build("supportResistance", scoreSupportResistance(c)),
  ];
}
