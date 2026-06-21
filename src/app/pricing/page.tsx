import { SiteHeader } from "@/components/marketing/site-header";
import { SiteFooter } from "@/components/marketing/site-footer";
import { PricingCards } from "@/components/marketing/pricing-cards";
import { DisclaimerBar } from "@/components/layout/disclaimer";

export const metadata = { title: "Pricing" };

const FAQ = [
  {
    q: "Is Apex Signal financial advice?",
    a: "No. Apex Signal is an educational probability tool. Signals are statistical estimates, not recommendations — you are responsible for your own trades.",
  },
  {
    q: "What markets are covered?",
    a: "Stocks, ETFs, and crypto out of the box, plus prediction markets (Kalshi, Polymarket). You can add any custom ticker to your watchlist.",
  },
  {
    q: "How often do signals update?",
    a: "The core universe is re-scanned every 15 minutes and your watchlist every 5 minutes. Elite alerts fire the instant conviction crosses your threshold.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes. Plans are month-to-month with no lock-in. Downgrade to Free whenever you like.",
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen">
      <SiteHeader />

      <section className="mx-auto max-w-6xl px-4 py-16 text-center">
        <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
          Simple pricing for serious traders
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
          Start free with three signals a day. Go Pro for unlimited conviction, or Elite for
          prediction-market intelligence and AI briefings.
        </p>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-16">
        <PricingCards />
      </section>

      <section className="mx-auto max-w-3xl px-4 py-16">
        <h2 className="text-center text-2xl font-semibold tracking-tight text-foreground">Questions, answered</h2>
        <div className="mt-8 space-y-4">
          {FAQ.map((item) => (
            <div key={item.q} className="rounded-xl border border-border bg-card p-5">
              <h3 className="font-medium text-foreground">{item.q}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{item.a}</p>
            </div>
          ))}
        </div>
        <div className="mt-8">
          <DisclaimerBar full />
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
