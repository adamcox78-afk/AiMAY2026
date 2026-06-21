import assert from "node:assert/strict";
import { test } from "node:test";

import { generateSignal } from "../src/lib/signal-engine";
import { SIGNAL_WEIGHTS, SIGNAL_THRESHOLDS } from "../src/lib/config";
import { MockMarketProvider, MockSentimentProvider, MockPredictionProvider } from "../src/lib/data/providers/mock";
import { MARKET_SCAN_SYMBOLS } from "../src/lib/config";
import type { SignalEngineInput } from "../src/lib/types";

const market = new MockMarketProvider();
const sentiment = new MockSentimentProvider();
const prediction = new MockPredictionProvider();

async function inputFor(symbol: string): Promise<SignalEngineInput> {
  const snap = await market.getSnapshot(symbol);
  assert.ok(snap, `snapshot for ${symbol}`);
  return {
    market: snap!,
    sentiment: (await sentiment.getSentiment(symbol)) ?? undefined,
    predictionMarkets: await prediction.getMarkets(symbol),
  };
}

test("weights sum to exactly 1.0", () => {
  const sum = Object.values(SIGNAL_WEIGHTS).reduce((a, b) => a + b, 0);
  assert.ok(Math.abs(sum - 1) < 1e-9, `weights sum = ${sum}`);
});

test("every signal is internally consistent", async () => {
  for (const symbol of MARKET_SCAN_SYMBOLS) {
    const sig = generateSignal(await inputFor(symbol));

    // Probabilities form a valid distribution.
    const probSum = sig.probability.bull + sig.probability.neutral + sig.probability.bear;
    assert.equal(probSum, 100, `${symbol} probabilities sum to 100`);

    // Bounded outputs.
    assert.ok(sig.confidence >= 0 && sig.confidence <= 100, `${symbol} confidence in range`);
    assert.ok(sig.compositeScore >= 0 && sig.compositeScore <= 100, `${symbol} composite in range`);
    assert.ok(sig.riskScore >= 0 && sig.riskScore <= 100, `${symbol} risk in range`);

    // Direction respects the documented thresholds.
    if (sig.compositeScore >= SIGNAL_THRESHOLDS.long) assert.equal(sig.direction, "LONG");
    else if (sig.compositeScore <= SIGNAL_THRESHOLDS.short) assert.equal(sig.direction, "SHORT");
    else assert.equal(sig.direction, "WAIT");

    // Entry zone is ordered and explanation is non-trivial.
    assert.ok(sig.entryZone.low <= sig.entryZone.high, `${symbol} entry zone ordered`);
    assert.ok(sig.explanation.length > 40, `${symbol} has a real explanation`);
    assert.ok(sig.components.length === 11, `${symbol} has all 11 components`);
  }
});

test("engine is deterministic", async () => {
  const a = generateSignal(await inputFor("BTC"));
  const b = generateSignal(await inputFor("BTC"));
  assert.equal(a.compositeScore, b.compositeScore);
  assert.equal(a.direction, b.direction);
  assert.equal(a.confidence, b.confidence);
});

test("LONG signals read bullish, SHORT bearish", async () => {
  for (const symbol of MARKET_SCAN_SYMBOLS) {
    const sig = generateSignal(await inputFor(symbol));
    if (sig.direction === "LONG") {
      assert.ok(sig.probability.bull >= sig.probability.bear, `${symbol} LONG ⇒ bull ≥ bear`);
    } else if (sig.direction === "SHORT") {
      assert.ok(sig.probability.bear >= sig.probability.bull, `${symbol} SHORT ⇒ bear ≥ bull`);
    }
  }
});
