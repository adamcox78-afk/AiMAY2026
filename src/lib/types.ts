/**
 * Apex Signal — core domain types.
 *
 * These are the contracts shared across the signal engine, data providers,
 * API routes, and UI. They are intentionally free of any framework or
 * provider-specific detail so the engine stays portable and testable.
 */

export type SignalDirection = "LONG" | "SHORT" | "WAIT";

export type RiskLevel = "Low" | "Medium" | "High";

export type Timeframe = "15m" | "1H" | "4H" | "1D" | "1W";

export type AssetClass = "crypto" | "stock" | "etf" | "prediction";

export type DataSource =
  | "polygon"
  | "alpaca"
  | "coinbase"
  | "robinhood"
  | "kalshi"
  | "polymarket"
  | "news"
  | "social"
  | "mock";

export interface Asset {
  symbol: string;
  name: string;
  assetClass: AssetClass;
  /** e.g. "NASDAQ", "Coinbase", "Kalshi". */
  exchange?: string;
  /** Optional logo/emblem for UI. */
  glyph?: string;
}

/** A single OHLCV candle. `t` is a unix epoch (ms). */
export interface Candle {
  t: number;
  o: number;
  h: number;
  l: number;
  c: number;
  v: number;
}

export interface MarketSnapshot {
  asset: Asset;
  /** Oldest → newest. */
  candles: Candle[];
  price: number;
  changePct24h: number;
  source: DataSource;
}

export interface SentimentData {
  /** Normalized sentiment, -1 (max bearish) → +1 (max bullish). */
  score: number;
  /** 0..100 relative news activity. */
  newsVolume: number;
  /** 0..100 relative social activity. */
  socialVolume: number;
  headlines: string[];
  source: DataSource;
}

export interface PredictionMarketData {
  source: "kalshi" | "polymarket";
  question: string;
  /** Implied probability of the bullish/"YES" outcome, 0..1. */
  yesPrice: number;
  /** Net move in implied probability over the lookback window, in pct points. */
  changePct: number;
  volumeUsd: number;
}

/** One of the eleven weighted inputs that form the composite score. */
export interface ComponentScore {
  key: ComponentKey;
  label: string;
  /** Directional score, 0 (max bearish) → 100 (max bullish), 50 = neutral. */
  score: number;
  /** Share of the composite this component owns, 0..1. */
  weight: number;
  /** score * weight, pre-normalized contribution. */
  contribution: number;
  /** Human-readable one-liner explaining the reading. */
  detail: string;
}

export type ComponentKey =
  | "rsi"
  | "macd"
  | "movingAverages"
  | "volume"
  | "atr"
  | "volatility"
  | "trendStrength"
  | "supportResistance"
  | "sentiment"
  | "predictionMarkets"
  | "patternMatch";

/** Probability mass across the three regimes; sums to 100. */
export interface ProbabilityDistribution {
  bull: number;
  neutral: number;
  bear: number;
}

export interface PriceZone {
  low: number;
  high: number;
}

/** The full, user-facing output of the engine for one asset. */
export interface Signal {
  asset: Asset;
  direction: SignalDirection;
  /** 0..100 — how strongly the evidence agrees with the direction. */
  confidence: number;
  /** 0..100 weighted composite. >=65 LONG, <=35 SHORT, else WAIT. */
  compositeScore: number;
  probability: ProbabilityDistribution;
  risk: RiskLevel;
  /** 0..100, higher = riskier. */
  riskScore: number;
  timeframe: Timeframe;
  price: number;
  entryZone: PriceZone;
  /** Price level that invalidates the thesis. */
  invalidation: number;
  /** Expected move over the timeframe, in percent (one sigma). */
  expectedVolatilityPct: number;
  /** One-sentence summary for cards/tables. */
  reasonSummary: string;
  /** Full plain-English explanation, no jargon. */
  explanation: string;
  components: ComponentScore[];
  /** Top contributing components, strongest first. */
  drivers: string[];
  generatedAt: string;
}

/** Bundle of everything the engine needs to score one asset. */
export interface SignalEngineInput {
  market: MarketSnapshot;
  sentiment?: SentimentData;
  predictionMarkets?: PredictionMarketData[];
  timeframe?: Timeframe;
}

/** A recorded outcome for track-record / performance analytics. */
export type SignalOutcome = "won" | "lost" | "invalidated" | "open";

export interface SignalHistoryEntry {
  id: string;
  symbol: string;
  direction: SignalDirection;
  confidence: number;
  entryPrice: number;
  outcome: SignalOutcome;
  pnlPct: number;
  openedAt: string;
  closedAt?: string;
  timeframe: Timeframe;
}

export interface PerformanceSummary {
  totalSignals: number;
  winRate: number;
  avgWinPct: number;
  avgLossPct: number;
  longWinRate: number;
  shortWinRate: number;
  bestSignal?: SignalHistoryEntry;
  worstSignal?: SignalHistoryEntry;
  equityCurve: { t: string; value: number }[];
}

export type AlertChannel = "email" | "sms" | "push" | "telegram" | "discord";

export interface Alert {
  id: string;
  symbol: string;
  direction: SignalDirection;
  confidence: number;
  channel: AlertChannel;
  message: string;
  createdAt: string;
  read: boolean;
}

export type PlanTier = "free" | "pro" | "elite";
