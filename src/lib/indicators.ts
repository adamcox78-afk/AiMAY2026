/**
 * Apex Signal — technical indicator math.
 *
 * Pure, dependency-free functions over OHLCV series. The signal engine consumes
 * these; users never see them. Everything here is deterministic and unit-testable.
 */

import type { Candle } from "./types";

export const closes = (candles: Candle[]): number[] => candles.map((c) => c.c);
export const highs = (candles: Candle[]): number[] => candles.map((c) => c.h);
export const lows = (candles: Candle[]): number[] => candles.map((c) => c.l);
export const volumes = (candles: Candle[]): number[] => candles.map((c) => c.v);

export const last = <T>(arr: T[]): T => arr[arr.length - 1];

export function mean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

export function stdDev(values: number[]): number {
  if (values.length < 2) return 0;
  const m = mean(values);
  const variance = mean(values.map((v) => (v - m) ** 2));
  return Math.sqrt(variance);
}

/** Simple moving average of the most recent `period` values. */
export function sma(values: number[], period: number): number {
  if (values.length < period) return mean(values);
  return mean(values.slice(values.length - period));
}

/** Full exponential-moving-average series (same length as input). */
export function emaSeries(values: number[], period: number): number[] {
  if (values.length === 0) return [];
  const k = 2 / (period + 1);
  const out: number[] = [values[0]];
  for (let i = 1; i < values.length; i++) {
    out.push(values[i] * k + out[i - 1] * (1 - k));
  }
  return out;
}

export function ema(values: number[], period: number): number {
  return last(emaSeries(values, period));
}

/**
 * Wilder's RSI over the last `period` deltas. Returns 0..100.
 */
export function rsi(values: number[], period = 14): number {
  if (values.length < period + 1) return 50;
  let gains = 0;
  let losses = 0;
  for (let i = values.length - period; i < values.length; i++) {
    const delta = values[i] - values[i - 1];
    if (delta >= 0) gains += delta;
    else losses -= delta;
  }
  const avgGain = gains / period;
  const avgLoss = losses / period;
  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return 100 - 100 / (1 + rs);
}

export interface MacdReading {
  macd: number;
  signal: number;
  histogram: number;
}

/** MACD (fast/slow/signal EMAs). Defaults 12 / 26 / 9. */
export function macd(values: number[], fast = 12, slow = 26, signal = 9): MacdReading {
  if (values.length < slow) return { macd: 0, signal: 0, histogram: 0 };
  const fastSeries = emaSeries(values, fast);
  const slowSeries = emaSeries(values, slow);
  const macdLine = fastSeries.map((v, i) => v - slowSeries[i]);
  const signalLine = emaSeries(macdLine, signal);
  const macdVal = last(macdLine);
  const signalVal = last(signalLine);
  return { macd: macdVal, signal: signalVal, histogram: macdVal - signalVal };
}

/** Wilder's Average True Range. */
export function atr(candles: Candle[], period = 14): number {
  if (candles.length < 2) return 0;
  const trs: number[] = [];
  for (let i = 1; i < candles.length; i++) {
    const cur = candles[i];
    const prevClose = candles[i - 1].c;
    trs.push(
      Math.max(
        cur.h - cur.l,
        Math.abs(cur.h - prevClose),
        Math.abs(cur.l - prevClose)
      )
    );
  }
  return sma(trs, Math.min(period, trs.length));
}

export interface BollingerReading {
  upper: number;
  middle: number;
  lower: number;
  /** Position of price within the bands, 0 (lower) → 1 (upper). */
  percentB: number;
  /** Band width relative to the middle band. */
  bandwidth: number;
}

export function bollinger(values: number[], period = 20, mult = 2): BollingerReading {
  const window = values.slice(Math.max(0, values.length - period));
  const middle = mean(window);
  const sd = stdDev(window);
  const upper = middle + mult * sd;
  const lower = middle - mult * sd;
  const price = last(values);
  const range = upper - lower || 1;
  return {
    upper,
    middle,
    lower,
    percentB: (price - lower) / range,
    bandwidth: middle === 0 ? 0 : (upper - lower) / middle,
  };
}

/** Per-period realized volatility from log returns, as a fraction (e.g. 0.03 = 3%). */
export function realizedVolatility(values: number[], lookback = 20): number {
  if (values.length < 2) return 0;
  const slice = values.slice(Math.max(1, values.length - lookback));
  const start = values.length - slice.length;
  const returns: number[] = [];
  for (let i = Math.max(1, start); i < values.length; i++) {
    returns.push(Math.log(values[i] / values[i - 1]));
  }
  return stdDev(returns);
}

/**
 * Normalized trend slope via least-squares regression on the recent window.
 * Returns slope per period expressed as a fraction of mean price.
 */
export function trendSlope(values: number[], lookback = 20): number {
  const window = values.slice(Math.max(0, values.length - lookback));
  const n = window.length;
  if (n < 2) return 0;
  const xs = window.map((_, i) => i);
  const xMean = mean(xs);
  const yMean = mean(window);
  let num = 0;
  let den = 0;
  for (let i = 0; i < n; i++) {
    num += (xs[i] - xMean) * (window[i] - yMean);
    den += (xs[i] - xMean) ** 2;
  }
  const slope = den === 0 ? 0 : num / den;
  return yMean === 0 ? 0 : slope / yMean;
}

export interface SupportResistance {
  support: number;
  resistance: number;
  /** Where price sits between support (0) and resistance (1). */
  position: number;
}

/** Nearest swing support/resistance from the recent window. */
export function supportResistance(candles: Candle[], lookback = 30): SupportResistance {
  const window = candles.slice(Math.max(0, candles.length - lookback));
  const support = Math.min(...window.map((c) => c.l));
  const resistance = Math.max(...window.map((c) => c.h));
  const price = last(window).c;
  const range = resistance - support || 1;
  return {
    support,
    resistance,
    position: clamp((price - support) / range, 0, 1),
  };
}

export function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

/** Map a value in [inMin,inMax] onto [outMin,outMax], clamped. */
export function scale(
  v: number,
  inMin: number,
  inMax: number,
  outMin = 0,
  outMax = 100
): number {
  if (inMax === inMin) return (outMin + outMax) / 2;
  const t = (v - inMin) / (inMax - inMin);
  return clamp(outMin + t * (outMax - outMin), Math.min(outMin, outMax), Math.max(outMin, outMax));
}
