"use client";

import { useMemo, useState } from "react";
import { SignalList } from "./signal-list";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Signal, SignalDirection } from "@/lib/types";

type Filter = "ALL" | SignalDirection;
type Sort = "confidence" | "composite" | "symbol";

export function SignalsExplorer({ signals }: { signals: Signal[] }) {
  const [filter, setFilter] = useState<Filter>("ALL");
  const [sort, setSort] = useState<Sort>("confidence");

  const counts = useMemo(
    () => ({
      ALL: signals.length,
      LONG: signals.filter((s) => s.direction === "LONG").length,
      SHORT: signals.filter((s) => s.direction === "SHORT").length,
      WAIT: signals.filter((s) => s.direction === "WAIT").length,
    }),
    [signals]
  );

  const view = useMemo(() => {
    const filtered = filter === "ALL" ? signals : signals.filter((s) => s.direction === filter);
    return [...filtered].sort((a, b) => {
      if (sort === "symbol") return a.asset.symbol.localeCompare(b.asset.symbol);
      if (sort === "composite") return b.compositeScore - a.compositeScore;
      return b.confidence - a.confidence;
    });
  }, [signals, filter, sort]);

  const filters: Filter[] = ["ALL", "LONG", "SHORT", "WAIT"];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {filters.map((f) => (
            <Button
              key={f}
              variant={filter === f ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(f)}
              className={cn(filter !== f && "text-muted-foreground")}
            >
              {f === "ALL" ? "All" : f} <span className="ml-1 opacity-70">{counts[f]}</span>
            </Button>
          ))}
        </div>
        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          Sort
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as Sort)}
            className="rounded-lg border border-input bg-background px-2 py-1.5 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="confidence">Confidence</option>
            <option value="composite">Composite</option>
            <option value="symbol">Symbol</option>
          </select>
        </label>
      </div>
      {view.length ? (
        <SignalList signals={view} />
      ) : (
        <p className="py-12 text-center text-sm text-muted-foreground">No {filter.toLowerCase()} signals right now.</p>
      )}
    </div>
  );
}
