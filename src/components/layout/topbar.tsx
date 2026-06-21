"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2, RadioTower, Search } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { AppNav } from "./app-nav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export function Topbar() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<string | null>(null);

  function search(e: React.FormEvent) {
    e.preventDefault();
    const symbol = query.trim().toUpperCase();
    if (symbol) router.push(`/dashboard?symbol=${encodeURIComponent(symbol)}`);
  }

  async function runScan() {
    setScanning(true);
    setScanResult(null);
    try {
      const res = await fetch("/api/ruflo/scan-market", { method: "POST" });
      const data = await res.json();
      if (data?.result) {
        setScanResult(`${data.result.longs} long · ${data.result.shorts} short · ${data.result.waits} wait`);
      }
      router.refresh();
    } catch {
      setScanResult("Scan failed");
    } finally {
      setScanning(false);
    }
  }

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="flex items-center gap-3 px-4 py-3">
        <Link2Logo />
        <form onSubmit={search} className="relative ml-auto w-full max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search any ticker…"
            className="pl-9"
            aria-label="Search ticker"
          />
        </form>
        <Button onClick={runScan} disabled={scanning} variant="secondary" size="sm" className="shrink-0">
          {scanning ? <Loader2 className="size-4 animate-spin" /> : <RadioTower className="size-4" />}
          <span className="hidden sm:inline">{scanning ? "Scanning…" : "Run Scan"}</span>
        </Button>
        <Badge variant="outline" className="hidden shrink-0 sm:flex">
          Pro
        </Badge>
      </div>
      {scanResult && (
        <div className="border-t border-border/60 bg-primary/5 px-4 py-1.5 text-center text-xs text-primary">
          Market scan complete · {scanResult}
        </div>
      )}
      {/* Mobile nav */}
      <div className="border-t border-border/60 px-2 py-2 lg:hidden">
        <AppNav variant="mobile" />
      </div>
    </header>
  );
}

function Link2Logo() {
  return (
    <a href="/" className="lg:hidden">
      <Logo />
    </a>
  );
}
