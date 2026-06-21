/**
 * Higgsfield client — media generation.
 *
 * Behavior:
 *  - With HIGGSFIELD_API_KEY set → makes a real authenticated HTTP request to the
 *    Higgsfield generation API and returns the live job (queued/rendering/ready).
 *  - Without a key → returns a fully-formed "stub" job (storyboard ready, render
 *    pending) so the product is never blocked.
 *  - On any network/contract error → falls back to the stub and surfaces the error
 *    in the job note, so the app never throws.
 *
 * The request shape is centralized in `buildRequest()` / `parseJob()`. Align those
 * two functions with Higgsfield's current API reference and everything else works.
 * Hard rule: this client receives finished signals and performs NO calculations.
 */

import type { PredictionMarketData, Signal } from "../../types";
import { recordHiggsfield } from "../run-log";
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

const API_URL = process.env.HIGGSFIELD_API_URL ?? "https://api.higgsfield.ai";
const API_PATH = process.env.HIGGSFIELD_API_PATH ?? "/v1/generations";
const TIMEOUT_MS = 20_000;

export class HiggsfieldClient {
  private get apiKey(): string | undefined {
    return process.env.HIGGSFIELD_API_KEY;
  }
  private get connected(): boolean {
    return Boolean(this.apiKey);
  }

  status(): HiggsfieldStatus {
    return {
      connected: this.connected,
      note: this.connected
        ? `Higgsfield API key detected → live rendering via ${API_URL}${API_PATH}.`
        : "No HIGGSFIELD_API_KEY — storyboards are generated; rendering is stubbed until connected.",
    };
  }

  /** Render a brief into media (or a stub when not connected / on error). */
  async render(brief: CreativeBrief): Promise<MediaJob> {
    const fallbackId = `hf_${brief.kind}_${Date.now().toString(36)}`;

    if (!this.connected) {
      recordHiggsfield(brief.kind, "stub");
      return {
        id: fallbackId,
        status: "stub",
        brief,
        note: "Stub: storyboard ready. Set HIGGSFIELD_API_KEY to render this brief.",
      };
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    try {
      const res = await fetch(`${API_URL}${API_PATH}`, {
        method: "POST",
        headers: {
          authorization: `Bearer ${this.apiKey}`,
          "content-type": "application/json",
        },
        body: JSON.stringify(buildRequest(brief)),
        signal: controller.signal,
      });

      if (!res.ok) {
        const body = await safeText(res);
        throw new Error(`Higgsfield ${res.status}: ${body.slice(0, 180)}`);
      }

      const data = (await res.json()) as Record<string, unknown>;
      const job = parseJob(data, brief, fallbackId);
      recordHiggsfield(brief.kind, job.status);
      return job;
    } catch (err) {
      const message = err instanceof Error ? err.message : "unknown error";
      recordHiggsfield(brief.kind, "failed");
      return {
        id: fallbackId,
        status: "stub",
        brief,
        note: `Higgsfield call failed (${message}). Storyboard returned; verify HIGGSFIELD_API_URL / contract.`,
      };
    } finally {
      clearTimeout(timer);
    }
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

/** Map a CreativeBrief → Higgsfield generation request. Align with their API spec. */
function buildRequest(brief: CreativeBrief): Record<string, unknown> {
  return {
    model: process.env.HIGGSFIELD_MODEL ?? "higgsfield-video-1",
    type: brief.kind,
    prompt: briefToPrompt(brief),
    aspect_ratio: brief.aspectRatio,
    duration_seconds: brief.durationSec,
    style: brief.style,
    storyboard: brief.scenes,
    metadata: { title: brief.title, disclaimer: brief.disclaimer },
    webhook_url: process.env.NEXT_PUBLIC_APP_URL
      ? `${process.env.NEXT_PUBLIC_APP_URL}/api/media/webhook`
      : undefined,
  };
}

/** Flatten a storyboard into a single descriptive prompt for the video model. */
function briefToPrompt(brief: CreativeBrief): string {
  const scenes = brief.scenes
    .map((s) => `Scene ${s.id} (${s.durationSec}s): ${s.visual} On-screen: "${s.onScreenText}". VO: "${s.voiceover}".`)
    .join(" ");
  return `${brief.title}. Art direction: ${brief.style} ${scenes}`;
}

/** Parse Higgsfield's response into a MediaJob, tolerating field-name variations. */
function parseJob(data: Record<string, unknown>, brief: CreativeBrief, fallbackId: string): MediaJob {
  const id = (data.id ?? data.job_id ?? data.generation_id ?? fallbackId) as string;
  const rawStatus = String(data.status ?? data.state ?? "queued").toLowerCase();
  const status = mapStatus(rawStatus);
  const output = (data.output ?? data.result ?? {}) as Record<string, unknown>;
  const assetUrl = (data.url ?? data.asset_url ?? output.url ?? output.video_url) as string | undefined;
  return {
    id,
    status,
    brief,
    assetUrl,
    note: assetUrl ? "Rendered by Higgsfield." : "Submitted to Higgsfield.",
  };
}

function mapStatus(s: string): MediaJobStatus {
  if (["ready", "succeeded", "completed", "done"].includes(s)) return "ready";
  if (["rendering", "processing", "running", "in_progress"].includes(s)) return "rendering";
  if (["failed", "error", "canceled", "cancelled"].includes(s)) return "failed";
  return "queued";
}

async function safeText(res: Response): Promise<string> {
  try {
    return await res.text();
  } catch {
    return "";
  }
}

export const higgsfield = new HiggsfieldClient();
