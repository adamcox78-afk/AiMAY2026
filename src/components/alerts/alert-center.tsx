"use client";

import { useEffect, useState } from "react";
import { Bell, Check, Loader2, Send } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SignalBadge } from "@/components/signal/signal-badge";
import { cn } from "@/lib/utils";
import type { AlertChannel, SignalDirection } from "@/lib/types";

export interface AlertItem {
  symbol: string;
  direction: SignalDirection;
  confidence: number;
  message: string;
  triggered: boolean;
}

const CHANNELS: { key: AlertChannel; label: string; defaultOn: boolean }[] = [
  { key: "email", label: "Email", defaultOn: true },
  { key: "push", label: "Push", defaultOn: true },
  { key: "sms", label: "SMS", defaultOn: false },
  { key: "telegram", label: "Telegram", defaultOn: false },
  { key: "discord", label: "Discord", defaultOn: false },
];

const STORAGE_KEY = "apex.alert.channels";

export function AlertCenter({ alerts, threshold }: { alerts: AlertItem[]; threshold: number }) {
  const [enabled, setEnabled] = useState<Record<AlertChannel, boolean>>(
    () => Object.fromEntries(CHANNELS.map((c) => [c.key, c.defaultOn])) as Record<AlertChannel, boolean>
  );
  const [sending, setSending] = useState<string | null>(null);
  const [sent, setSent] = useState<Record<string, string[]>>({});

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) setEnabled((e) => ({ ...e, ...JSON.parse(saved) }));
  }, []);

  function toggle(key: AlertChannel, value: boolean) {
    const next = { ...enabled, [key]: value };
    setEnabled(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }

  async function dispatch(a: AlertItem) {
    setSending(a.symbol);
    const channels = CHANNELS.filter((c) => enabled[c.key]).map((c) => c.key);
    try {
      const res = await fetch("/api/alerts", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          symbol: a.symbol,
          direction: a.direction,
          confidence: a.confidence,
          message: a.message,
          channels,
        }),
      });
      const data = await res.json();
      const delivered = (data.dispatched ?? []).map(
        (r: { channel: string; delivered: boolean }) => `${r.channel}:${r.delivered ? "✓" : "—"}`
      );
      setSent((s) => ({ ...s, [a.symbol]: delivered }));
    } catch {
      setSent((s) => ({ ...s, [a.symbol]: ["failed"] }));
    } finally {
      setSending(null);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <Bell className="size-4 text-primary" /> Live alerts
            <span className="text-xs font-normal text-muted-foreground">
              triggers above {threshold}% confidence
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {alerts.map((a) => (
            <div
              key={a.symbol}
              className={cn(
                "flex flex-wrap items-center gap-3 rounded-lg border p-3",
                a.triggered ? "border-primary/40 bg-primary/5" : "border-border"
              )}
            >
              <SignalBadge direction={a.direction} size="sm" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-foreground">{a.symbol}</span>
                  <span className="stat-mono text-xs text-muted-foreground">{a.confidence}%</span>
                  {a.triggered && <Badge className="text-[10px]">Triggered</Badge>}
                </div>
                <p className="truncate text-xs text-muted-foreground">{a.message}</p>
                {sent[a.symbol] && (
                  <p className="mt-1 text-[11px] text-primary">Dispatched → {sent[a.symbol].join(" · ")}</p>
                )}
              </div>
              <Button size="sm" variant="outline" onClick={() => dispatch(a)} disabled={sending === a.symbol}>
                {sending === a.symbol ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : sent[a.symbol] ? (
                  <Check className="size-4" />
                ) : (
                  <Send className="size-4" />
                )}
                Send
              </Button>
            </div>
          ))}
          {alerts.length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">No active alerts right now.</p>
          )}
        </CardContent>
      </Card>

      <Card className="h-fit">
        <CardHeader>
          <CardTitle className="text-sm">Alert channels</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {CHANNELS.map((c) => (
            <div key={c.key} className="flex items-center justify-between">
              <span className="text-sm text-foreground">{c.label}</span>
              <Switch checked={enabled[c.key]} onCheckedChange={(v) => toggle(c.key, v)} />
            </div>
          ))}
          <p className="border-t border-border pt-3 text-xs text-muted-foreground">
            Channels without configured provider keys are skipped gracefully — wire keys in
            <code className="mx-1 rounded bg-muted px-1">.env.local</code> to go live.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
