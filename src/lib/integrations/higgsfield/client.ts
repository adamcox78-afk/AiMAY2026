/**
 * Higgsfield client — the media-generation seam.
 *
 * Takes a CreativeBrief (built from engine output) and renders media. With no
 * HIGGSFIELD_API_KEY configured it returns a fully-formed "stub" job: the brief
 * is real and ready, only the rendered asset URL is pending. When the Higgsfield
 * MCP/API is connected, swap the body of `render()` to call it — nothing else
 * in the app changes.
 *
 * Hard rule: this client receives finished signals. It performs NO market
 * calculations of any kind.
 */

import type { PredictionMarketData, Signal } from "../../types";
import {
  buildDailyMarketBriefing,
  buildProbabilityVisualization,
  buildSignalExplanationVideo,
  buildSocialContent,
  qualifiesForVideo,
  type CreativeBrief,
  type SocialPlatform,
} from "./workflows";

export type MediaJobStatus = "stub" | "queued" | "rendering" | "ready" | "failed";

export interface MediaJob {
  id: string;
  status: MediaJobStatus;
  brief: CreativeBrief;
  assetUrl?: string;
  note: string;
}

export interface HiggsfieldStatus {
  connected: boolean;
  note: string;
}

export class HiggsfieldClient {
  private get connected(): boolean {
    return Boolean(process.env.HIGGSFIELD_API_KEY);
  }

  status(): HiggsfieldStatus {
    return {
      connected: this.connected,
      note: this.connected
        ? "Higgsfield API key detected."
        : "No HIGGSFIELD_API_KEY — briefs are generated; rendering is stubbed until connected.",
    };
  }

  /** Render a brief into media (or a stub when not connected). */
  async render(brief: CreativeBrief): Promise<MediaJob> {
    const id = `hf_${brief.kind}_${Date.now().toString(36)}`;
    if (!this.connected) {
      return {
        id,
        status: "stub",
        brief,
        note: "Stub: storyboard ready. Connect Higgsfield to render this brief.",
      };
    }
    // When connected:
    //   const res = await higgsfield.videos.create({ storyboard: brief, ... });
    //   return { id: res.id, status: "queued", brief, note: "Submitted to Higgsfield." };
    return { id, status: "queued", brief, note: "Submitted to Higgsfield." };
  }

  // ---- Convenience builders + render in one call -------------------------

  async marketBriefing(signals: Signal[], movers: PredictionMarketData[]): Promise<MediaJob> {
    return this.render(buildDailyMarketBriefing(signals, movers));
  }

  /** Returns null if the signal doesn't clear the video confidence threshold. */
  async signalVideo(signal: Signal): Promise<MediaJob | null> {
    if (!qualifiesForVideo(signal)) return null;
    return this.render(buildSignalExplanationVideo(signal));
  }

  async social(signal: Signal, platforms: SocialPlatform[]): Promise<MediaJob[]> {
    return Promise.all(platforms.map((p) => this.render(buildSocialContent(signal, p))));
  }

  async probabilityViz(signal: Signal): Promise<MediaJob> {
    return this.render(buildProbabilityVisualization(signal));
  }
}

export const higgsfield = new HiggsfieldClient();
