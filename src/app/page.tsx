import Link from "next/link";
import {
  ArrowRight,
  Bell,
  Brain,
  Clapperboard,
  Crosshair,
  Gauge,
  Layers,
  PauseCircle,
  ScanLine,
  Sparkles,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { SiteHeader } from "@/components/marketing/site-header";
import { SiteFooter } from "@/components/marketing/site-footer";
import { PricingCards } from "@/components/marketing/pricing-cards";
import { SignalCard } from "@/components/signal/signal-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getSignal } from "@/lib/data";
import { BRAND, FACTOR_GROUPS } from "@/lib/config";

export const dynamic = "force-dynamic";

const ANSWERS = [
  { dir: "LONG", icon: TrendingUp, color: "var(--long)", text: "The evidence favors upside. Here's your entry and where the idea is wrong." },
  { dir: "WAIT", icon: PauseCircle, color: "var(--wait)", text: "Signals conflict. No edge yet — we'll ping you the moment that changes." },
  { dir: "SHORT", icon: TrendingDown, color: "var(--short)", text: "The evidence favors downside, with the same clarity and risk controls." },
];

const STEPS = [
  { icon: ScanLine, title: "Enter any asset", text: "Stocks, ETFs, crypto, or a prediction market. Paste a ticker or import a watchlist." },
  { icon: Brain, title: "The engine does the work", text: "Eleven factors — momentum, trend, volume, volatility, sentiment, prediction markets — weighted into one score." },
  { icon: Gauge, title: "Get one clear call", text: "LONG, SHORT, or WAIT with confidence, probabilities, and a plain-English why." },
];

const FEATURES = [
  { icon: Layers, title: "Composite signal engine", text: "Seven weighted factor groups distilled into a single, auditable 0–100 score." },
  { icon: Gauge, title: "Probability split", text: "Bull / neutral / bear odds for every asset — not just a buzzer, a distribution." },
  { icon: Crosshair, title: "Entry & invalidation", text: "Exact zones to act and the level that proves the thesis wrong. Risk-first." },
  { icon: TrendingUp, title: "Prediction-market intel", text: "Kalshi and Polymarket odds folded directly into the signal." },
  { icon: Bell, title: "Real-time alerts", text: "Email, SMS, push, Telegram, Discord — fired the instant conviction crosses your line." },
  { icon: Clapperboard, title: "AI briefings", text: "60-second market videos and signal explainers, auto-generated from your signals." },
];

export default async function LandingPage() {
  const sample = await getSignal("BTC");

  return (
    <div className="min-h-screen">
      <SiteHeader />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 apex-grid opacity-40" />
        <div className="absolute inset-0 apex-glow" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 py-20 lg:grid-cols-2 lg:py-28">
          <div>
            <Badge variant="outline" className="gap-1.5 border-primary/30 text-primary">
              <Sparkles className="size-3" /> Probability intelligence platform
            </Badge>
            <h1 className="mt-5 text-4xl font-semibold leading-[1.05] tracking-tight text-foreground sm:text-6xl">
              Stop decoding markets.
              <br />
              <span className="text-gradient">Get the signal.</span>
            </h1>
            <p className="mt-5 max-w-md text-lg text-muted-foreground">
              {BRAND.name} turns RSI, options flow, order books, sentiment and prediction markets into one
              decision: <span className="font-medium text-foreground">LONG, SHORT, or WAIT</span>. No jargon. No noise.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href="/dashboard">
                  Open the dashboard <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/pricing">See pricing</Link>
              </Button>
            </div>
            <p className="mt-6 text-xs text-muted-foreground">
              Bloomberg-grade depth · Apple-grade clarity · No card required for the free tier.
            </p>
          </div>

          <div className="relative">
            <div className="absolute -inset-4 rounded-3xl bg-primary/10 blur-2xl" />
            {sample && <SignalCard signal={sample} className="relative glass" />}
          </div>
        </div>
      </section>

      {/* Three answers */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="grid gap-4 md:grid-cols-3">
          {ANSWERS.map((a) => (
            <Card key={a.dir}>
              <CardContent className="p-6">
                <a.icon className="size-6" style={{ color: `hsl(${a.color})` }} />
                <div className="mt-3 text-xl font-semibold" style={{ color: `hsl(${a.color})` }}>
                  {a.dir}
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{a.text}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-center text-3xl font-semibold tracking-tight text-foreground">From chaos to clarity in three steps</h2>
        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <div key={s.title} className="relative">
              <div className="flex size-11 items-center justify-center rounded-xl border border-border bg-card text-primary">
                <s.icon className="size-5" />
              </div>
              <div className="mt-4 text-xs font-medium text-primary">STEP {i + 1}</div>
              <h3 className="mt-1 text-lg font-semibold text-foreground">{s.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-6xl px-4 py-16">
        <div className="max-w-xl">
          <h2 className="text-3xl font-semibold tracking-tight text-foreground">Everything the pros have. None of the complexity.</h2>
          <p className="mt-3 text-muted-foreground">
            The terminal-grade machinery runs underneath. You get the answer on top.
          </p>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <Card key={f.title}>
              <CardContent className="p-6">
                <f.icon className="size-5 text-primary" />
                <h3 className="mt-3 font-semibold text-foreground">{f.title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{f.text}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Factor weights / credibility */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <Card className="overflow-hidden">
          <CardContent className="grid gap-8 p-8 lg:grid-cols-2">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-foreground">One score. Seven forces. Eleven factors.</h2>
              <p className="mt-3 text-sm text-muted-foreground">
                Each signal is a transparent, weighted blend. No black box — every call traces back to the data.
              </p>
              <Button asChild variant="outline" size="sm" className="mt-6">
                <Link href="/signals">Explore live signals <ArrowRight className="size-4" /></Link>
              </Button>
            </div>
            <div className="space-y-3">
              {FACTOR_GROUPS.map((g) => (
                <div key={g.label} className="grid grid-cols-[1fr_auto] items-center gap-3">
                  <div>
                    <div className="flex justify-between text-sm">
                      <span className="text-foreground/90">{g.label}</span>
                      <span className="stat-mono text-muted-foreground">{g.weightPct}%</span>
                    </div>
                    <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-muted">
                      <div className="h-full rounded-full bg-primary" style={{ width: `${(g.weightPct / 25) * 100}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Pricing */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-foreground">Start free. Upgrade when it pays for itself.</h2>
          <p className="mt-3 text-muted-foreground">Three tiers, no lock-in.</p>
        </div>
        <PricingCards />
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 pb-24">
        <Card className="relative overflow-hidden border-primary/30">
          <div className="absolute inset-0 apex-glow" />
          <CardContent className="relative flex flex-col items-center gap-4 p-12 text-center">
            <h2 className="text-3xl font-semibold tracking-tight text-foreground">Your next trade deserves a second opinion.</h2>
            <p className="max-w-md text-muted-foreground">
              Get an unbiased, probability-weighted read on any market — in seconds.
            </p>
            <Button asChild size="lg">
              <Link href="/dashboard">Get the signal <ArrowRight className="size-4" /></Link>
            </Button>
          </CardContent>
        </Card>
      </section>

      <SiteFooter />
    </div>
  );
}
