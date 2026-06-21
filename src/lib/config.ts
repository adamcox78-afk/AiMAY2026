/**
 * Apex Signal — global configuration.
 *
 * Tunable constants for the signal engine, the asset universe, monetization
 * tiers, and the compliance disclaimer. Centralized so the engine and UI never
 * hard-code magic numbers.
 */

import type { Asset, ComponentKey, PlanTier, Timeframe } from "./types";

/**
 * Component weights for the composite score. MUST sum to 1.0.
 * Mirrors the product spec exactly:
 *   Momentum 25% (rsi + macd), Trend 20% (movingAverages + trendStrength),
 *   Volume/Pressure 15%, Volatility 15% (atr + volatility),
 *   Sentiment 10%, Prediction Markets 10%, Pattern Matching 5%.
 */
export const SIGNAL_WEIGHTS: Record<ComponentKey, number> = {
  // Momentum — 25%
  rsi: 0.125,
  macd: 0.125,
  // Trend — 20%
  movingAverages: 0.1,
  trendStrength: 0.1,
  // Volume / Pressure — 15%
  volume: 0.15,
  // Volatility — 15%
  atr: 0.075,
  volatility: 0.075,
  // Sentiment — 10%
  sentiment: 0.1,
  // Prediction markets — 10%
  predictionMarkets: 0.1,
  // Pattern matching — 5%
  patternMatch: 0.05,
  // Support/Resistance is informational (weight 0): it shapes the entry &
  // invalidation zones rather than the composite, so the weights still sum to 1.0.
  supportResistance: 0,
};

/** Human-friendly grouping for the UI factor breakdown. */
export const FACTOR_GROUPS: { label: string; weightPct: number; keys: ComponentKey[] }[] = [
  { label: "Momentum", weightPct: 25, keys: ["rsi", "macd"] },
  { label: "Trend", weightPct: 20, keys: ["movingAverages", "trendStrength"] },
  { label: "Volume / Pressure", weightPct: 15, keys: ["volume"] },
  { label: "Volatility", weightPct: 15, keys: ["atr", "volatility"] },
  { label: "Sentiment", weightPct: 10, keys: ["sentiment"] },
  { label: "Prediction Markets", weightPct: 10, keys: ["predictionMarkets"] },
  { label: "Pattern Matching", weightPct: 5, keys: ["patternMatch"] },
];

/** Composite-score thresholds that map to a direction. */
export const SIGNAL_THRESHOLDS = {
  long: 65,
  short: 35,
} as const;

export const COMPONENT_LABELS: Record<ComponentKey, string> = {
  rsi: "RSI",
  macd: "MACD",
  movingAverages: "Moving Averages",
  volume: "Volume",
  atr: "ATR",
  volatility: "Volatility",
  trendStrength: "Trend Strength",
  supportResistance: "Support / Resistance",
  sentiment: "Sentiment",
  predictionMarkets: "Prediction Markets",
  patternMatch: "Pattern Match",
};

export const TIMEFRAMES: Timeframe[] = ["15m", "1H", "4H", "1D", "1W"];

/** Approximate one-period horizon used to scale expected volatility, in days. */
export const TIMEFRAME_HORIZON_DAYS: Record<Timeframe, number> = {
  "15m": 0.0104,
  "1H": 0.0417,
  "4H": 0.1667,
  "1D": 1,
  "1W": 7,
};

/** Default watchlist + market-scan universe. */
export const ASSET_UNIVERSE: Asset[] = [
  { symbol: "BTC", name: "Bitcoin", assetClass: "crypto", exchange: "Coinbase", glyph: "₿" },
  { symbol: "ETH", name: "Ethereum", assetClass: "crypto", exchange: "Coinbase", glyph: "Ξ" },
  { symbol: "SOL", name: "Solana", assetClass: "crypto", exchange: "Coinbase", glyph: "◎" },
  { symbol: "AAPL", name: "Apple Inc.", assetClass: "stock", exchange: "NASDAQ", glyph: "" },
  { symbol: "TSLA", name: "Tesla, Inc.", assetClass: "stock", exchange: "NASDAQ", glyph: "T" },
  { symbol: "NVDA", name: "NVIDIA Corp.", assetClass: "stock", exchange: "NASDAQ", glyph: "N" },
  { symbol: "SPY", name: "S&P 500 ETF", assetClass: "etf", exchange: "NYSE Arca", glyph: "S" },
  { symbol: "QQQ", name: "Nasdaq 100 ETF", assetClass: "etf", exchange: "NASDAQ", glyph: "Q" },
];

/** The eight symbols Ruflo's scheduled market scan covers. */
export const MARKET_SCAN_SYMBOLS = ASSET_UNIVERSE.map((a) => a.symbol);

export interface Plan {
  tier: PlanTier;
  name: string;
  priceMonthly: number;
  tagline: string;
  signalsPerDay: number | "unlimited";
  features: string[];
  highlighted?: boolean;
}

export const PLANS: Plan[] = [
  {
    tier: "free",
    name: "Free",
    priceMonthly: 0,
    tagline: "Get a feel for the signal.",
    signalsPerDay: 3,
    features: [
      "3 signals per day",
      "LONG / SHORT / WAIT calls",
      "Confidence & probability split",
      "8-asset core watchlist",
    ],
  },
  {
    tier: "pro",
    name: "Pro",
    priceMonthly: 49,
    tagline: "For the serious independent trader.",
    signalsPerDay: "unlimited",
    highlighted: true,
    features: [
      "Unlimited signals",
      "Full factor breakdown",
      "Custom watchlists & alerts",
      "Entry & invalidation zones",
      "Email + push notifications",
    ],
  },
  {
    tier: "elite",
    name: "Elite",
    priceMonthly: 199,
    tagline: "Institutional-grade intelligence.",
    signalsPerDay: "unlimited",
    features: [
      "Everything in Pro",
      "Advanced performance analytics",
      "Prediction-market intelligence (Kalshi + Polymarket)",
      "Priority SMS / Telegram / Discord alerts",
      "AI market briefings & signal videos",
    ],
  },
];

export const FREE_TIER_DAILY_LIMIT = 3;

/** Confidence at or above which Ruflo fires a high-conviction alert. */
export const ALERT_CONFIDENCE_THRESHOLD = 72;

/** Confidence at or above which Higgsfield generates an explainer video. */
export const VIDEO_CONFIDENCE_THRESHOLD = 80;

/** Prediction-market move (pct points) that triggers a Ruflo alert. */
export const PREDICTION_MOVE_ALERT_THRESHOLD = 7;

export const DISCLAIMER =
  "Apex Signal is an educational probability tool, not financial advice. " +
  "Signals are statistical estimates, not recommendations. You are solely " +
  "responsible for your own trading decisions and any resulting gains or losses.";

export const DISCLAIMER_SHORT = "Educational probability tool. Not financial advice.";

export const BRAND = {
  name: "Apex Signal",
  tagline: "Stop decoding markets. Get the signal.",
} as const;
