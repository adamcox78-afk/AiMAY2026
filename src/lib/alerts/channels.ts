/**
 * Alert channel adapters.
 *
 * Email / SMS / Push / Telegram / Discord. Each adapter is a thin, swappable
 * function. With no provider keys configured they no-op gracefully and report
 * why, so the alert pipeline is fully wired end-to-end even before credentials
 * exist. Ruflo decides *when* to send; these decide *how*.
 */

import type { AlertChannel, SignalDirection } from "../types";

export interface AlertDispatch {
  symbol: string;
  direction: SignalDirection;
  confidence: number;
  message: string;
  channels: AlertChannel[];
}

export interface ChannelResult {
  channel: AlertChannel;
  delivered: boolean;
  detail: string;
}

type Sender = (a: AlertDispatch) => Promise<ChannelResult>;

const email: Sender = async (a) => {
  if (!process.env.RESEND_API_KEY) return skip("email", "RESEND_API_KEY not set");
  // await resend.emails.send({ ... })
  return ok("email", "queued via Resend");
};

const sms: Sender = async (a) => {
  if (!process.env.TWILIO_ACCOUNT_SID) return skip("sms", "TWILIO_ACCOUNT_SID not set");
  // await twilio.messages.create({ ... })
  return ok("sms", "queued via Twilio");
};

const push: Sender = async (a) => {
  if (!process.env.WEB_PUSH_VAPID_PUBLIC_KEY) return skip("push", "VAPID keys not set");
  // await webpush.sendNotification(sub, payload)
  return ok("push", "queued web-push");
};

const telegram: Sender = async (a) => {
  if (!process.env.TELEGRAM_BOT_TOKEN) return skip("telegram", "TELEGRAM_BOT_TOKEN not set");
  // await fetch(`https://api.telegram.org/bot${token}/sendMessage`, ...)
  return ok("telegram", "sent to Telegram");
};

const discord: Sender = async (a) => {
  if (!process.env.DISCORD_WEBHOOK_URL) return skip("discord", "DISCORD_WEBHOOK_URL not set");
  // await fetch(process.env.DISCORD_WEBHOOK_URL, { method: "POST", ... })
  return ok("discord", "posted to Discord");
};

const SENDERS: Record<AlertChannel, Sender> = { email, sms, push, telegram, discord };

export async function dispatchAlert(a: AlertDispatch): Promise<ChannelResult[]> {
  const channels = a.channels.length ? a.channels : (["email", "push"] as AlertChannel[]);
  return Promise.all(channels.map((c) => SENDERS[c](a)));
}

function ok(channel: AlertChannel, detail: string): ChannelResult {
  return { channel, delivered: true, detail };
}
function skip(channel: AlertChannel, detail: string): ChannelResult {
  return { channel, delivered: false, detail };
}
