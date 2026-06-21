/**
 * Higgsfield workflow builders.
 *
 * Higgsfield is the VISUAL layer: market-briefing videos, signal explainers,
 * social clips, and animated probability visualizations. It must NEVER perform
 * calculations — it consumes signals the engine already produced and turns them
 * into a structured creative brief (script + storyboard + style) that a video
 * model can render.
 *
 * The briefs below are genuinely useful on their own: they are exactly what you
 * hand to Higgsfield (or any generative video pipeline) to produce the media.
 */

import { BRAND, DISCLAIMER_SHORT, VIDEO_CONFIDENCE_THRESHOLD } from "../../config";
import type { PredictionMarketData, Signal } from "../../types";

export type BriefKind =
  | "market-briefing"
  | "signal-explainer"
  | "social-clip"
  | "probability-viz";

export interface BriefScene {
  id: number;
  durationSec: number;
  /** What the camera/animation shows. */
  visual: string;
  /** Narration line (kept jargon-free for a general audience). */
  voiceover: string;
  /** Large on-screen text/lower-third. */
  onScreenText: string;
}

export interface CreativeBrief {
  kind: BriefKind;
  title: string;
  /** Art direction — the spec calls for Bloomberg × Apple × Palantir. */
  style: string;
  aspectRatio: "16:9" | "9:16" | "1:1";
  durationSec: number;
  scenes: BriefScene[];
  caption?: string;
  hashtags?: string[];
  disclaimer: string;
}

const STYLE =
  "Cinematic dark fintech: near-black backdrop, glassmorphism cards, electric-cyan " +
  "accents, crisp Inter typography, subtle data-grid motion. Bloomberg authority × " +
  "Apple restraint × Palantir density. No casino energy, no meme aesthetics.";

const dir = (s: Signal) =>
  s.direction === "LONG" ? "leaning up" : s.direction === "SHORT" ? "leaning down" : "no clear edge";

/** 1. Daily Market Briefing — a 60s premium recap. */
export function buildDailyMarketBriefing(
  signals: Signal[],
  predictionMovers: PredictionMarketData[]
): CreativeBrief {
  const focus = ["BTC", "SPY", "NVDA", "TSLA"]
    .map((sym) => signals.find((s) => s.asset.symbol === sym))
    .filter((s): s is Signal => Boolean(s));

  const scenes: BriefScene[] = [
    {
      id: 1,
      durationSec: 6,
      visual: `${BRAND.name} logo resolves over a slow-drifting market grid.`,
      voiceover: `Your 60-second market briefing from ${BRAND.name}.`,
      onScreenText: `${BRAND.name} — Daily Briefing`,
    },
  ];

  focus.forEach((s, i) => {
    scenes.push({
      id: i + 2,
      durationSec: 10,
      visual: `${s.asset.symbol} card animates in; probability bars fill to ${s.probability.bull}/${s.probability.neutral}/${s.probability.bear}.`,
      voiceover: `${s.asset.name} is ${dir(s)} — ${s.confidence}% confidence. ${s.reasonSummary}`,
      onScreenText: `${s.asset.symbol} · ${s.direction} · ${s.confidence}%`,
    });
  });

  const movers = predictionMovers.slice(0, 3);
  if (movers.length) {
    scenes.push({
      id: scenes.length + 1,
      durationSec: 8,
      visual: "Split panel: Kalshi vs Polymarket odds tickers sliding.",
      voiceover: `In prediction markets, the biggest moves: ${movers
        .map((m) => `${m.question} ${m.changePct > 0 ? "up" : "down"} ${Math.abs(m.changePct)} points`)
        .join("; ")}.`,
      onScreenText: "Prediction Market Movers",
    });
  }

  scenes.push({
    id: scenes.length + 1,
    durationSec: 6,
    visual: "Outro card with tagline and disclaimer fine print.",
    voiceover: `${BRAND.tagline}`,
    onScreenText: BRAND.tagline,
  });

  return {
    kind: "market-briefing",
    title: `${BRAND.name} Daily Market Briefing`,
    style: STYLE,
    aspectRatio: "16:9",
    durationSec: scenes.reduce((a, s) => a + s.durationSec, 0),
    scenes,
    disclaimer: DISCLAIMER_SHORT,
  };
}

/** 2. Signal Explanation Video — generated only for high-conviction signals. */
export function buildSignalExplanationVideo(signal: Signal): CreativeBrief {
  const bull = signal.drivers.slice(0, 2).join(" and ") || "the broad trend";
  return {
    kind: "signal-explainer",
    title: `Why ${signal.asset.symbol} is ${signal.direction}`,
    style: STYLE,
    aspectRatio: "16:9",
    durationSec: 45,
    scenes: [
      {
        id: 1,
        durationSec: 8,
        visual: `${signal.asset.symbol} hero with a large ${signal.direction} badge and ${signal.confidence}% ring.`,
        voiceover: `${signal.asset.name} just hit ${signal.confidence}% confidence — here's why.`,
        onScreenText: `${signal.asset.symbol} · ${signal.direction} · ${signal.confidence}%`,
      },
      {
        id: 2,
        durationSec: 10,
        visual: "Animated factor bars highlight the strongest contributors.",
        voiceover: `The bull case: ${bull} are pushing in the same direction.`,
        onScreenText: "Bull Case",
      },
      {
        id: 3,
        durationSec: 9,
        visual: "Opposing factors dim and pull back.",
        voiceover:
          signal.drivers.length > 2
            ? `The bear case: not everything agrees, which is why it isn't a certainty.`
            : `The bear case is thin here — most factors align.`,
        onScreenText: "Bear Case",
      },
      {
        id: 4,
        durationSec: 9,
        visual: `Risk dial swings to ${signal.risk}; entry zone ${signal.entryZone.low}–${signal.entryZone.high} and invalidation ${signal.invalidation} appear.`,
        voiceover: `Risk is ${signal.risk.toLowerCase()}. The thesis breaks if price closes past ${signal.invalidation}.`,
        onScreenText: `Risk: ${signal.risk}`,
      },
      {
        id: 5,
        durationSec: 9,
        visual: `Probability cone fans out: ${signal.probability.bull}% up, ${signal.probability.neutral}% flat, ${signal.probability.bear}% down.`,
        voiceover: `Bottom line: ${signal.probability.bull}% chance up, ${signal.probability.bear}% down. ${BRAND.tagline}`,
        onScreenText: `${signal.probability.bull}% ▲ / ${signal.probability.bear}% ▼`,
      },
    ],
    disclaimer: DISCLAIMER_SHORT,
  };
}

export function qualifiesForVideo(signal: Signal): boolean {
  return signal.direction !== "WAIT" && signal.confidence >= VIDEO_CONFIDENCE_THRESHOLD;
}

export type SocialPlatform = "tiktok" | "instagram" | "youtube-shorts" | "x";

/** 3. Social Content Generator — short vertical clip + caption per platform. */
export function buildSocialContent(signal: Signal, platform: SocialPlatform): CreativeBrief {
  const arrow = signal.direction === "LONG" ? "▲" : signal.direction === "SHORT" ? "▼" : "■";
  const hashtags = [
    "#ApexSignal",
    "#trading",
    `#${signal.asset.symbol}`,
    signal.asset.assetClass === "crypto" ? "#crypto" : "#stocks",
    "#probability",
  ];
  const caption =
    platform === "x"
      ? `${signal.asset.symbol} ${arrow} ${signal.direction} — ${signal.confidence}% confidence. ${signal.reasonSummary} ${DISCLAIMER_SHORT}`
      : `${signal.asset.symbol} is ${dir(signal)} at ${signal.confidence}% confidence ${arrow}\n\n${signal.reasonSummary}\n\n${DISCLAIMER_SHORT}`;

  return {
    kind: "social-clip",
    title: `${signal.asset.symbol} ${signal.direction} — ${platform}`,
    style: STYLE,
    aspectRatio: platform === "x" ? "1:1" : "9:16",
    durationSec: 15,
    scenes: [
      {
        id: 1,
        durationSec: 3,
        visual: `Hard cut to ${signal.asset.symbol} ticker slamming in with ${arrow}.`,
        voiceover: `${signal.asset.symbol}: ${signal.direction}.`,
        onScreenText: `${signal.asset.symbol} ${arrow}`,
      },
      {
        id: 2,
        durationSec: 8,
        visual: "Probability bars race to fill; confidence ring snaps to value.",
        voiceover: signal.reasonSummary,
        onScreenText: `${signal.confidence}% confidence`,
      },
      {
        id: 3,
        durationSec: 4,
        visual: "Logo sting + tagline.",
        voiceover: BRAND.tagline,
        onScreenText: BRAND.tagline,
      },
    ],
    caption,
    hashtags,
    disclaimer: DISCLAIMER_SHORT,
  };
}

/** 4. Probability Visualization — animated cone (bull / neutral / bear paths). */
export function buildProbabilityVisualization(signal: Signal): CreativeBrief {
  return {
    kind: "probability-viz",
    title: `${signal.asset.symbol} Probability Cone`,
    style: STYLE,
    aspectRatio: "16:9",
    durationSec: 12,
    scenes: [
      {
        id: 1,
        durationSec: 12,
        visual: `From the current price, three paths fan out: a bullish path weighted ${signal.probability.bull}%, a neutral path ${signal.probability.neutral}%, and a bearish path ${signal.probability.bear}%, with expected movement of ±${signal.expectedVolatilityPct.toFixed(1)}%. Entry band shaded ${signal.entryZone.low}–${signal.entryZone.high}; invalidation line at ${signal.invalidation}.`,
        voiceover: `${signal.asset.symbol}: ${signal.probability.bull}% up, ${signal.probability.neutral}% flat, ${signal.probability.bear}% down.`,
        onScreenText: `${signal.asset.symbol} Probability Cone`,
      },
    ],
    disclaimer: DISCLAIMER_SHORT,
  };
}
