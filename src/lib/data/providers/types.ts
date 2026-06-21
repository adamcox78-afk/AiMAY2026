/**
 * Provider abstraction layer.
 *
 * Every external data source (Polygon, Alpaca, Coinbase, Kalshi, Polymarket,
 * news/social APIs) implements one of these interfaces. The app only ever talks
 * to the interface, so swapping mock → live is a one-line registry change in
 * `src/lib/data/index.ts`. No engine or UI code changes when real keys arrive.
 */

import type {
  Asset,
  MarketSnapshot,
  PredictionMarketData,
  SentimentData,
  Timeframe,
} from "../../types";

export interface MarketDataProvider {
  readonly name: string;
  listAssets(): Promise<Asset[]>;
  getSnapshot(symbol: string, timeframe?: Timeframe): Promise<MarketSnapshot | null>;
}

export interface SentimentProvider {
  readonly name: string;
  getSentiment(symbol: string): Promise<SentimentData | null>;
}

export interface PredictionMarketProvider {
  readonly name: string;
  getMarkets(symbol: string): Promise<PredictionMarketData[]>;
  /** All currently tracked markets, for the prediction-market scanner. */
  listAll(): Promise<PredictionMarketData[]>;
}

export interface DataProviders {
  market: MarketDataProvider;
  sentiment: SentimentProvider;
  prediction: PredictionMarketProvider;
}
