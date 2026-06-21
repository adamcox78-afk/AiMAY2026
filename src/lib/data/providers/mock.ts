/**
 * Mock provider implementations.
 *
 * These satisfy the same interfaces a live Polygon/Coinbase/Kalshi adapter would.
 * They are deterministic (see seed.ts) so the demo is stable and testable.
 */

import { ASSET_UNIVERSE } from "../../config";
import type {
  Asset,
  MarketSnapshot,
  PredictionMarketData,
  SentimentData,
  Timeframe,
} from "../../types";
import {
  generateCandles,
  generatePredictionMarkets,
  generateSentiment,
} from "../seed";
import type {
  MarketDataProvider,
  PredictionMarketProvider,
  SentimentProvider,
} from "./types";

function resolveAsset(symbol: string): Asset {
  const found = ASSET_UNIVERSE.find((a) => a.symbol.toUpperCase() === symbol.toUpperCase());
  if (found) return found;
  // Synthesize a plausible asset for custom tickers.
  const isCrypto = symbol.length <= 4 && symbol === symbol.toUpperCase();
  return {
    symbol: symbol.toUpperCase(),
    name: symbol.toUpperCase(),
    assetClass: isCrypto ? "crypto" : "stock",
    exchange: isCrypto ? "Coinbase" : "NASDAQ",
  };
}

export class MockMarketProvider implements MarketDataProvider {
  readonly name = "mock-market";

  async listAssets(): Promise<Asset[]> {
    return ASSET_UNIVERSE;
  }

  async getSnapshot(symbol: string, _timeframe?: Timeframe): Promise<MarketSnapshot | null> {
    const asset = resolveAsset(symbol);
    const candles = generateCandles(asset.symbol);
    if (candles.length === 0) return null;
    const price = candles[candles.length - 1].c;
    const prev = candles[candles.length - 2]?.c ?? price;
    return {
      asset,
      candles,
      price,
      changePct24h: Number((((price - prev) / prev) * 100).toFixed(2)),
      source: "mock",
    };
  }
}

export class MockSentimentProvider implements SentimentProvider {
  readonly name = "mock-sentiment";
  async getSentiment(symbol: string): Promise<SentimentData | null> {
    return generateSentiment(symbol.toUpperCase());
  }
}

export class MockPredictionProvider implements PredictionMarketProvider {
  readonly name = "mock-prediction";

  async getMarkets(symbol: string): Promise<PredictionMarketData[]> {
    return generatePredictionMarkets(symbol.toUpperCase());
  }

  async listAll(): Promise<PredictionMarketData[]> {
    const all: PredictionMarketData[] = [];
    for (const asset of ASSET_UNIVERSE) {
      all.push(...generatePredictionMarkets(asset.symbol));
    }
    return all;
  }
}
