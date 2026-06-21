"use client";

import { useEffect, useState } from "react";
import { Loader2, Plus, X } from "lucide-react";
import { SignalList } from "./signal-list";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Signal } from "@/lib/types";

const STORAGE_KEY = "apex.watchlist.custom";

export function WatchlistManager({ coreSignals }: { coreSignals: Signal[] }) {
  const [custom, setCustom] = useState<Signal[]>([]);
  const [symbol, setSymbol] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Restore saved symbols on mount.
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return;
    const symbols: string[] = JSON.parse(saved);
    if (!symbols.length) return;
    fetch(`/api/signals?symbols=${symbols.join(",")}`)
      .then((r) => r.json())
      .then((d) => setCustom(d.signals ?? []))
      .catch(() => {});
  }, []);

  function persist(signals: Signal[]) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(signals.map((s) => s.asset.symbol)));
  }

  async function add(e: React.FormEvent) {
    e.preventDefault();
    const sym = symbol.trim().toUpperCase();
    if (!sym) return;
    if (
      custom.some((s) => s.asset.symbol === sym) ||
      coreSignals.some((s) => s.asset.symbol === sym)
    ) {
      setError(`${sym} is already on your watchlist.`);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/signals?symbol=${encodeURIComponent(sym)}`);
      const data = await res.json();
      if (!data.signal) {
        setError(`Couldn't find ${sym}.`);
        return;
      }
      const next = [...custom, data.signal];
      setCustom(next);
      persist(next);
      setSymbol("");
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }

  function remove(sym: string) {
    const next = custom.filter((s) => s.asset.symbol !== sym);
    setCustom(next);
    persist(next);
  }

  const all = [...coreSignals, ...custom];

  return (
    <div className="space-y-5">
      <form onSubmit={add} className="flex gap-2">
        <Input
          value={symbol}
          onChange={(e) => setSymbol(e.target.value)}
          placeholder="Add a ticker (e.g. AVAX, AMD, COIN)…"
          className="max-w-xs"
          aria-label="Add ticker"
        />
        <Button type="submit" disabled={loading} size="sm">
          {loading ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
          Add
        </Button>
      </form>
      {error && <p className="text-xs text-[hsl(var(--short))]">{error}</p>}

      {custom.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {custom.map((s) => (
            <span
              key={s.asset.symbol}
              className="inline-flex items-center gap-1 rounded-full border border-border bg-muted/40 py-1 pl-3 pr-1.5 text-sm"
            >
              {s.asset.symbol}
              <button
                onClick={() => remove(s.asset.symbol)}
                className="grid size-5 place-items-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
                aria-label={`Remove ${s.asset.symbol}`}
              >
                <X className="size-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      <SignalList signals={all} />
    </div>
  );
}
