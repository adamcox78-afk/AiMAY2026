/**
 * Ruflo client — the automation/monitoring/alerting seam.
 *
 * In production this dispatches to the Ruflo daemon (MCP/CLI) which owns the
 * cron schedule, retries, logging and monitoring. Until that daemon is wired up,
 * the client logs structured events and routes alerts through the channel
 * adapters, so the whole automation surface is exercised locally.
 *
 * Ruflo NEVER makes a trading decision. It triggers the engine and moves bytes.
 */

import { dispatchAlert, type AlertDispatch, type ChannelResult } from "../../alerts/channels";
import { RUFLO_WORKFLOWS, type RufloWorkflowDef } from "./workflows";

export interface RufloStatus {
  connected: boolean;
  mode: "daemon" | "local";
  workflows: number;
}

export class RufloClient {
  /** True when a real Ruflo daemon/secret is configured. */
  private get connected(): boolean {
    return Boolean(process.env.RUFLO_WEBHOOK_SECRET && process.env.RUFLO_BASE_URL);
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

  /** Structured monitoring/logging hook. */
  log(event: string, payload: Record<string, unknown> = {}): void {
    // In production: forward to Ruflo's logging/monitoring sink.
    console.info(`[ruflo] ${event}`, JSON.stringify(payload));
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
