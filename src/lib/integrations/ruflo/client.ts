/**
 * Ruflo client — automation / monitoring / alerting seam.
 *
 * Ruflo owns the cron schedule, retries, logging and monitoring. It dispatches to
 * the engine and moves bytes; it NEVER makes a trading decision.
 *
 * Connectivity: considered "connected" when a Ruflo credential is configured
 * (RUFLO_API_KEY or RUFLO_WEBHOOK_SECRET). Every `log()` is recorded to the
 * run-log (powering the health endpoint) and, when RUFLO_API_URL is set, forwarded
 * to Ruflo's ingestion endpoint for centralized monitoring.
 */

import { dispatchAlert, type AlertDispatch, type ChannelResult } from "../../alerts/channels";
import { recordRufloRun } from "../run-log";
import { RUFLO_WORKFLOWS, type RufloWorkflowDef } from "./workflows";

export interface RufloStatus {
  connected: boolean;
  mode: "daemon" | "local";
  workflows: number;
}

export class RufloClient {
  private get connected(): boolean {
    return Boolean(process.env.RUFLO_API_KEY || process.env.RUFLO_WEBHOOK_SECRET);
  }

  status(): RufloStatus {
    return {
      connected: this.connected,
      mode: this.connected ? "daemon" : "local",
      workflows: RUFLO_WORKFLOWS.length,
    };
  }

  /** The cron manifest to register with the Ruflo scheduler. */
  scheduleManifest(): RufloWorkflowDef[] {
    return RUFLO_WORKFLOWS;
  }

  /** Structured monitoring/logging hook — records locally and optionally forwards. */
  log(event: string, payload: Record<string, unknown> = {}): void {
    console.info(`[ruflo] ${event}`, JSON.stringify(payload));
    recordRufloRun(event, payload);
    this.forward(event, payload);
  }

  /** Best-effort forward to a Ruflo monitoring endpoint; never throws. */
  private forward(event: string, payload: Record<string, unknown>): void {
    const url = process.env.RUFLO_API_URL;
    const key = process.env.RUFLO_API_KEY;
    if (!url || !key) return;
    void fetch(`${url.replace(/\/$/, "")}/events`, {
      method: "POST",
      headers: { authorization: `Bearer ${key}`, "content-type": "application/json" },
      body: JSON.stringify({ event, payload, at: new Date().toISOString() }),
    }).catch(() => {
      /* monitoring forward is best-effort */
    });
  }

  /** Route an alert to its channels (email/sms/push/telegram/discord). */
  async sendAlert(alert: AlertDispatch): Promise<ChannelResult[]> {
    const results = await dispatchAlert(alert);
    this.log("alert.dispatched", {
      symbol: alert.symbol,
      channels: results.map((r) => `${r.channel}:${r.delivered ? "ok" : "skip"}`),
    });
    return results;
  }
}

export const ruflo = new RufloClient();
