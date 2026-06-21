/**
 * Hand-written row types for the Supabase tables (see config/supabase/schema.sql).
 * Swap for `supabase gen types typescript` output once the project exists.
 */

import type {
  AlertChannel,
  AssetClass,
  PlanTier,
  RiskLevel,
  SignalDirection,
  SignalOutcome,
  Timeframe,
} from "../types";

export interface UserRow {
  id: string;
  email: string;
  display_name: string | null;
  plan: PlanTier;
  signals_used_today: number;
  created_at: string;
}

export interface WatchlistRow {
  id: string;
  user_id: string;
  name: string;
  symbols: string[];
  created_at: string;
}

export interface AssetRow {
  id: string;
  symbol: string;
  name: string;
  asset_class: AssetClass;
  exchange: string | null;
  created_at: string;
}

export interface SignalRow {
  id: string;
  symbol: string;
  direction: SignalDirection;
  confidence: number;
  composite_score: number;
  prob_bull: number;
  prob_neutral: number;
  prob_bear: number;
  risk: RiskLevel;
  risk_score: number;
  timeframe: Timeframe;
  price: number;
  entry_low: number | null;
  entry_high: number | null;
  invalidation: number | null;
  expected_vol_pct: number | null;
  reason_summary: string | null;
  explanation: string | null;
  components: unknown;
  generated_at: string;
}

export interface SignalHistoryRow {
  id: string;
  user_id: string | null;
  symbol: string;
  direction: SignalDirection;
  confidence: number;
  entry_price: number;
  outcome: SignalOutcome;
  pnl_pct: number;
  timeframe: Timeframe;
  opened_at: string;
  closed_at: string | null;
}

export interface AlertRow {
  id: string;
  user_id: string;
  symbol: string | null;
  min_confidence: number;
  channels: AlertChannel[];
  active: boolean;
  created_at: string;
}

export interface AlertHistoryRow {
  id: string;
  user_id: string | null;
  symbol: string;
  direction: SignalDirection;
  confidence: number;
  channel: AlertChannel;
  message: string;
  delivered: boolean;
  created_at: string;
}
