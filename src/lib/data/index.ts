/**
 * Data service facade.
 *
 * The single seam between the app and the outside world. UI and API routes call
 * these functions and never touch a provider directly. To go live, swap the
 * provider construction below (gated on APEX_DATA_MODE) — nothing else changes.
 */

import { generateSignal } from "../signal-engine";
import { MARKET_SCAN_SYMBOLS } from "../config";
import type {
  Asset,
  MarketSnapshot,
  PerformanceSummary,
  PredictionMarketData,
  SentimentData,
  Signal,
  SignalHistoryEntry,
  Timeframe,
} from "../types";
import { generateSignalHistory, summarizePerformance } from "./history";
import {
  MockMarketProvider,
  MockPredictionProvider,
  MockSentimentProvider,
} from "./providers/mock";
import type { DataProviders } from "./providers/types";

let providers: DataProviders | null = null;

/**
 * Build the active provider set. Today everything is mock. When live keys exist
 * (APEX_DATA_MODE=live), construct PolygonProvider/CoinbaseProvider/etc. here.
 */
function getProviders(): DataProviders {
  if (providers) return providers;
  // const mode = process.env.APEX_DATA_MODE ?? "mock";
  // if (mode === "live") { providers = buildLiveProviders(); return providers; }
  providers = {
    market: new MockMarketProvider(),
    sentiment: new MockSentimentProvider(),
    prediction: new MockPredictionProvider(),
  };
  return providers;
}

export async function listAssets(): Promise<Asset[]> {
  return getProviders().market.listAssets();
}

export async function getMarketSnapshot(
  symbol: string,
  timeframe?: Timeframe
): Promise<MarketSnapshot | null> {
  return getProviders().market.getSnapshot(symbol, timeframe);
}

export async function getSentiment(symbol: string): Promise<SentimentData | null> {
  return getProviders().sentiment.getSentiment(symbol);
}

export async function getPredictionMarkets(symbol: string): Promise<PredictionMarketData[]> {
  return getProviders().prediction.getMarkets(symbol);
}

export async function listAllPredictionMarkets(): Promise<PredictionMarketData[]> {
  return getProviders().prediction.listAll();
}

/** Assemble all inputs for one asset and run the engine. */
export async function getSignal(symbol: string, timeframe?: Timeframe): Promise<Signal | null> {
  const p = getProviders();
  const market = await p.market.getSnapshot(symbol, timeframe);
  if (!market) return null;
  const [sentiment, predictionMarkets] = await Promise.all([
    p.sentiment.getSentiment(symbol),
    p.prediction.getMarkets(symbol),
  ]);
  return generateSignal({
    market,
    sentiment: sentiment ?? undefined,
    predictionMarkets,
    timeframe,
  });
}

export async function getSignals(symbols: string[], timeframe?: Timeframe): Promise<Signal[]> {
  const results = await Promise.all(symbols.map((s) => getSignal(s, timeframe)));
  return results.filter((s): s is Signal => s !== null);
}

/** Signals for the full default universe (powers the market scan + Signals page). */
export async function getAllSignals(timeframe?: Timeframe): Promise<Signal[]> {
  return getSignals(MARKET_SCAN_SYMBOLS, timeframe);
}

export async function getSignalHistory(): Promise<SignalHistoryEntry[]> {
  return generateSignalHistory();
}

export async function getPerformance(): Promise<PerformanceSummary> {
  return summarizePerformance(await getSignalHistory());
}
