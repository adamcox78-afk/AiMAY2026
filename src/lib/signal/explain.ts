/**
 * Apex Signal — natural-language explanation layer.
 *
 * Turns the engine's numeric output into jargon-free prose. The user should never
 * see "RSI" or "MACD"; they see "momentum", "the trend", "buying pressure". This
 * module owns that translation so the rest of the engine can stay quantitative.
 */

import type {
  ComponentScore,
  ProbabilityDistribution,
  RiskLevel,
  Signal,
  SignalDirection,
} from "../types";

/** Jargon → plain English. */
const PLAIN: Record<string, string> = {
  rsi: "price momentum",
  macd: "momentum trend",
  movingAverages: "the overall trend",
  trendStrength: "trend strength",
  volume: "buying/selling pressure",
  atr: "market volatility",
  volatility: "where price sits in its range",
  sentiment: "news & social sentiment",
  predictionMarkets: "betting-market odds",
  patternMatch: "historical patterns",
  supportResistance: "key price levels",
};

/** How far a component leans, in the direction of the signal. */
function lean(score: number, direction: SignalDirection): number {
  if (direction === "SHORT") return 50 - score; // bearish lean is positive
  return score - 50; // bullish lean is positive
}

function phrase(direction: SignalDirection): { verb: string; bias: string } {
  if (direction === "LONG") return { verb: "favors upside", bias: "bullish" };
  if (direction === "SHORT") return { verb: "favors downside", bias: "bearish" };
  return { verb: "is mixed", bias: "neutral" };
}

/** Ordered list of supporting drivers (plain English), strongest first. */
export function deriveDrivers(
  components: ComponentScore[],
  direction: SignalDirection
): string[] {
  return components
    .filter((c) => c.weight > 0)
    .map((c) => ({ c, lean: lean(c.score, direction) }))
    .filter((x) => (direction === "WAIT" ? Math.abs(x.lean) > 18 : x.lean > 6))
    .sort((a, b) =>
      direction === "WAIT" ? Math.abs(b.lean) - Math.abs(a.lean) : b.lean - a.lean
    )
    .slice(0, 4)
    .map((x) => PLAIN[x.c.key] ?? x.c.label);
}

function listToProse(items: string[]): string {
  if (items.length === 0) return "";
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(", ")}, and ${items[items.length - 1]}`;
}

export function buildReasonSummary(
  direction: SignalDirection,
  drivers: string[],
  prob: ProbabilityDistribution
): string {
  const { bias } = phrase(direction);
  if (direction === "WAIT") {
    return `Signals are conflicting — roughly ${prob.bull}% bullish vs ${prob.bear}% bearish. No clear edge yet.`;
  }
  const top = drivers.slice(0, 2);
  const lead = top.length ? listToProse(top) : "the broad picture";
  return `${capitalize(lead)} ${top.length === 1 ? "is" : "are"} ${bias}, pointing to a ${
    direction === "LONG" ? "move up" : "move down"
  }.`;
}

export function buildExplanation(args: {
  direction: SignalDirection;
  confidence: number;
  drivers: string[];
  opposing: string[];
  prob: ProbabilityDistribution;
  risk: RiskLevel;
  symbol: string;
  entryLow: number;
  entryHigh: number;
  invalidation: number;
  expectedVolPct: number;
}): string {
  const {
    direction,
    confidence,
    drivers,
    opposing,
    prob,
    risk,
    symbol,
    entryLow,
    entryHigh,
    invalidation,
    expectedVolPct,
  } = args;
  const { verb } = phrase(direction);

  if (direction === "WAIT") {
    const parts = [
      `${symbol} doesn't have a clear edge right now.`,
      `The evidence ${verb} — about ${prob.bull}% of factors point up while ${prob.bear}% point down, so the smart move is to wait.`,
    ];
    if (drivers.length) {
      parts.push(`The biggest sources of disagreement are ${listToProse(drivers)}.`);
    }
    parts.push(
      `Expect roughly ${expectedVolPct.toFixed(1)}% of movement over this window. We'll flag ${symbol} the moment the picture clears up.`
    );
    return parts.join(" ");
  }

  const actionWord = direction === "LONG" ? "leaning up" : "leaning down";
  const parts: string[] = [];
  parts.push(
    `${symbol} is ${actionWord} with ${confidence}% confidence. The strongest forces behind this are ${listToProse(
      drivers.length ? drivers : ["the overall trend"]
    )}.`
  );
  parts.push(
    `Our model reads about a ${prob.bull}% chance of a move higher, ${prob.neutral}% of going sideways, and ${prob.bear}% of a move lower.`
  );
  if (opposing.length) {
    parts.push(`Working against the call: ${listToProse(opposing)} — which is why this isn't a sure thing.`);
  }
  parts.push(
    `A good entry zone is ${fmt(entryLow)}–${fmt(entryHigh)}. If price closes past ${fmt(
      invalidation
    )}, the setup is wrong and the signal is off. Risk on this idea is ${risk.toLowerCase()}, with about ${expectedVolPct.toFixed(
      1
    )}% of expected movement.`
  );
  return parts.join(" ");
}

/** Opposing drivers (work against the direction). */
export function deriveOpposing(
  components: ComponentScore[],
  direction: SignalDirection
): string[] {
  if (direction === "WAIT") return [];
  return components
    .filter((c) => c.weight > 0)
    .map((c) => ({ c, lean: lean(c.score, direction) }))
    .filter((x) => x.lean < -8)
    .sort((a, b) => a.lean - b.lean)
    .slice(0, 2)
    .map((x) => PLAIN[x.c.key] ?? x.c.label);
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function fmt(n: number): string {
  if (n >= 1000) return n.toLocaleString("en-US", { maximumFractionDigits: 0 });
  if (n >= 1) return n.toFixed(2);
  return n.toPrecision(3);
}

/** Convenience: attach summary + explanation to a partially-built signal. */
export type Explained = Pick<Signal, "reasonSummary" | "explanation" | "drivers">;
