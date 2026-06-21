"use client";

import { useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Storyboard } from "./storyboard";
import type { CreativeBrief } from "@/lib/integrations/higgsfield";

type Kind = "signal" | "social" | "viz";

export function MediaStudio({ defaultSymbol = "BTC" }: { defaultSymbol?: string }) {
  const [symbol, setSymbol] = useState(defaultSymbol);
  const [platform, setPlatform] = useState("tiktok");
  const [loading, setLoading] = useState<Kind | null>(null);
  const [brief, setBrief] = useState<CreativeBrief | null>(null);
  const [note, setNote] = useState<string | null>(null);

  async function generate(kind: Kind) {
    setLoading(kind);
    setNote(null);
    setBrief(null);
    try {
      const params = new URLSearchParams({ kind, symbol: symbol.trim().toUpperCase() || "BTC" });
      if (kind === "social") params.set("platform", platform);
      const res = await fetch(`/api/media?${params.toString()}`);
      const data = await res.json();
      const job = data.job ?? data.jobs?.[0];
      if (!job) {
        setNote(data.note ?? "Nothing generated.");
      } else {
        setBrief(job.brief);
        setNote(job.note);
      }
    } catch {
      setNote("Generation failed.");
    } finally {
      setLoading(null);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <Sparkles className="size-4 text-primary" /> Generate on demand
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <Input
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            placeholder="Symbol"
            className="w-28"
            aria-label="Symbol"
          />
          <select
            value={platform}
            onChange={(e) => setPlatform(e.target.value)}
            className="rounded-lg border border-input bg-background px-2 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Platform"
          >
            <option value="tiktok">TikTok</option>
            <option value="instagram">Instagram</option>
            <option value="youtube-shorts">YouTube Shorts</option>
            <option value="x">X</option>
          </select>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="secondary" onClick={() => generate("signal")} disabled={loading !== null}>
            {loading === "signal" ? <Loader2 className="size-4 animate-spin" /> : null} Signal explainer
          </Button>
          <Button size="sm" variant="secondary" onClick={() => generate("social")} disabled={loading !== null}>
            {loading === "social" ? <Loader2 className="size-4 animate-spin" /> : null} Social clip
          </Button>
          <Button size="sm" variant="secondary" onClick={() => generate("viz")} disabled={loading !== null}>
            {loading === "viz" ? <Loader2 className="size-4 animate-spin" /> : null} Probability viz
          </Button>
        </div>

        {note && !brief && <p className="text-sm text-muted-foreground">{note}</p>}
        {brief && (
          <div className="border-t border-border pt-4">
            <Storyboard brief={brief} stub />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
