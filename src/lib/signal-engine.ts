/**
 * Apex Signal — the signal engine.
 *
 * This is the decision-maker. It takes market data (+ optional sentiment and
 * prediction-market inputs), runs the eleven weighted component scores, and
 * produces a single, plain-English signal: LONG / SHORT / WAIT with confidence,
 * probabilities, risk, an entry zone, an invalidation level, and an explanation.
 *
 * Design principles:
 *  - Deterministic & pure: same input → same output. No I/O, no randomness.
 *  - Auditable: every output number traces back to a component or indicator.
 *  - Spec-faithful: weights and thresholds match the product definition exactly.
 *
 * Ruflo automates *when* this runs. Higgsfield visualizes the *result*. Neither
 * makes the decision — this file does.
 */

import { computeComponents } from "./signal/components";
import {
  buildExplanation,
  buildReasonSummary,
  deriveDrivers,
  deriveOpposing,
} from "./signal/explain";
import {
  SIGNAL_THRESHOLDS,
  TIMEFRAME_HORIZON_DAYS,
} from "./config";
import {
  atr,
  clamp,
  closes,
  last,
  realizedVolatility,
  supportResistance,
} from "./indicators";
import type {
  ComponentScore,
  ProbabilityDistribution,
  RiskLevel,
  Signal,
  SignalDirection,
  SignalEngineInput,
  Timeframe,
} from "./types";

/** Weighted composite score in [0,100]. Weights already sum to 1. */
function composite(components: ComponentScore[]): number {
  const total = components.reduce((sum, c) => sum + c.contribution, 0);
  return clamp(total, 0, 100);
}

/** How tightly the weighted components agree, 0 (chaos) → 1 (consensus). */
function agreement(components: ComponentScore[], compositeScore: number): number {
  const weighted = components.filter((c) => c.weight > 0);
  const variance = weighted.reduce(
    (sum, c) => sum + c.weight * (c.score - compositeScore) ** 2,
    0
  );
  const dispersion = Math.sqrt(variance); // ~0..50
  return clamp(1 - dispersion / 32, 0, 1);
}

function decideDirection(compositeScore: number): SignalDirection {
  if (compositeScore >= SIGNAL_THRESHOLDS.long) return "LONG";
  if (compositeScore <= SIGNAL_THRESHOLDS.short) return "SHORT";
  return "WAIT";
}

function computeConfidence(
  direction: SignalDirection,
  compositeScore: number,
  agree: number
): number {
  if (direction === "WAIT") {
    const neutrality = 1 - clamp(Math.abs(compositeScore - 50) / 15, 0, 1);
    return Math.round(clamp(40 + neutrality * 25 + (1 - agree) * 15, 25, 75));
  }
  const base =
    direction === "LONG"
      ? scaleLinear(compositeScore, 50, 92, 50, 98)
      : scaleLinear(compositeScore, 50, 8, 50, 98);
  return Math.round(clamp(base * (0.7 + 0.3 * agree), 0, 99));
}

function computeProbability(
  compositeScore: number,
  agree: number
): ProbabilityDistribution {
  const neutral = clamp(
    Math.round((1 - agree) * 30 + ((15 - Math.min(15, Math.abs(compositeScore - 50))) / 15) * 22),
    6,
    55
  );
  const remaining = 100 - neutral;
  const bull = Math.round((remaining * compositeScore) / 100);
  const bear = remaining - bull;
  return { bull, neutral, bear };
}

function computeRisk(
  atrPct: number,
  agree: number,
  confidence: number
): { risk: RiskLevel; riskScore: number } {
  const volComponent = scaleLinear(atrPct, 0.8, 7, 10, 95);
  const disagreement = (1 - agree) * 100;
  const lowConf = 100 - confidence;
  const riskScore = Math.round(
    clamp(volComponent * 0.5 + disagreement * 0.3 + lowConf * 0.2, 0, 100)
  );
  const risk: RiskLevel = riskScore < 34 ? "Low" : riskScore <= 66 ? "Medium" : "High";
  return { risk, riskScore };
}

function pickTimeframe(
  override: Timeframe | undefined,
  components: ComponentScore[],
  atrPct: number
): Timeframe {
  if (override) return override;
  const ts = components.find((c) => c.key === "trendStrength")?.score ?? 50;
  const strength = Math.abs(ts - 50);
  if (atrPct > 5) return "4H";
  if (strength > 28) return "1D";
  if (strength > 14) return "4H";
  return "1H";
}

/** The main entry point: produce a full signal for one asset. */
export function generateSignal(input: SignalEngineInput): Signal {
  const { market, sentiment, predictionMarkets, timeframe } = input;
  const candles = market.candles;
  const price = market.price || last(closes(candles));

  const components = computeComponents(market, sentiment, predictionMarkets);
  const compositeScore = composite(components);
  const agree = agreement(components, compositeScore);
  const direction = decideDirection(compositeScore);
  const confidence = computeConfidence(direction, compositeScore, agree);
  const probability = computeProbability(compositeScore, agree);

  const a = atr(candles) || price * 0.02;
  const atrPct = (a / price) * 100;
  const { risk, riskScore } = computeRisk(atrPct, agree, confidence);
  const tf = pickTimeframe(timeframe, components, atrPct);

  const sr = supportResistance(candles);
  const { entryZone, invalidation } = computeZones(direction, price, a, sr.support, sr.resistance);

  const rv = realizedVolatility(closes(candles));
  const horizon = TIMEFRAME_HORIZON_DAYS[tf] ?? 1;
  const expectedVolatilityPct = clamp(
    Math.max(rv * 100, atrPct) * Math.sqrt(horizon),
    0.3,
    30
  );

  const drivers = deriveDrivers(components, direction);
  const opposing = deriveOpposing(components, direction);
  const reasonSummary = buildReasonSummary(direction, drivers, probability);
  const explanation = buildExplanation({
    direction,
    confidence,
    drivers,
    opposing,
    prob: probability,
    risk,
    symbol: market.asset.symbol,
    entryLow: entryZone.low,
    entryHigh: entryZone.high,
    invalidation,
    expectedVolPct: expectedVolatilityPct,
  });

  return {
    asset: market.asset,
    direction,
    confidence,
    compositeScore: Math.round(compositeScore),
    probability,
    risk,
    riskScore,
    timeframe: tf,
    price,
    entryZone,
    invalidation,
    expectedVolatilityPct,
    reasonSummary,
    explanation,
    components,
    drivers,
    generatedAt: new Date().toISOString(),
  };
}

function computeZones(
  direction: SignalDirection,
  price: number,
  a: number,
  support: number,
  resistance: number
) {
  if (direction === "LONG") {
    // Invalidation sits below price: use the nearer of recent support or a
    // 1.5-ATR stop (max picks the closer level, never an absurdly wide one).
    return {
      entryZone: { low: round(price - 0.6 * a), high: round(price + 0.15 * a) },
      invalidation: round(Math.max(Math.min(support, price - 0.8 * a), price - 1.5 * a)),
    };
  }
  if (direction === "SHORT") {
    return {
      entryZone: { low: round(price - 0.15 * a), high: round(price + 0.6 * a) },
      invalidation: round(Math.min(Math.max(resistance, price + 0.8 * a), price + 1.5 * a)),
    };
  }
  return {
    entryZone: { low: round(price - 0.4 * a), high: round(price + 0.4 * a) },
    invalidation: round(price - 1.5 * a),
  };
}

function round(n: number): number {
  if (n >= 1000) return Math.round(n);
  if (n >= 1) return Math.round(n * 100) / 100;
  return Math.round(n * 10000) / 10000;
}

function scaleLinear(
  v: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number
): number {
  if (inMax === inMin) return (outMin + outMax) / 2;
  const t = (v - inMin) / (inMax - inMin);
  const lo = Math.min(outMin, outMax);
  const hi = Math.max(outMin, outMax);
  return clamp(outMin + t * (outMax - outMin), lo, hi);
}

/** Batch helper used by the market/watchlist scanners. */
export function generateSignals(inputs: SignalEngineInput[]): Signal[] {
  return inputs.map(generateSignal);
}
