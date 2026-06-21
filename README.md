# Apex Signal

> **Stop decoding markets. Get the signal.**

Apex Signal is a probability-intelligence platform that turns complex market data —
RSI, MACD, options flow, order books, volatility curves, sentiment, and prediction
markets — into **one clear call**:

<p align="center"><b>LONG &nbsp;·&nbsp; SHORT &nbsp;·&nbsp; WAIT</b></p>

Every call ships with a confidence score, a bull/neutral/bear probability split,
risk rating, suggested timeframe, entry zone, invalidation level, expected
volatility, and a **plain-English explanation** — no jargon required.

> ⚠️ **Apex Signal is an educational probability tool, not financial advice.**
> Signals are statistical estimates. You are solely responsible for your trades.

---

## The division of labor

| Layer | Owner | Responsibility |
|------|-------|----------------|
| **Decisions** | **Claude's signal engine** | All scoring & LONG/SHORT/WAIT logic (`src/lib/signal-engine.ts`) |
| **Automation** | **Ruflo** | Scheduling, scanning, alerting, logging, reporting |
| **Visuals** | **Higgsfield** | Market-briefing videos, explainers, social clips, probability cones |

Ruflo never makes a trading decision. Higgsfield never performs a calculation.
The engine decides; Ruflo automates; Higgsfield visualizes.

---

## Tech stack

- **Next.js 14** (App Router) · **TypeScript** · **Tailwind CSS** · shadcn-style UI
- **Recharts** for visualizations · **lucide-react** icons · **zod** for validation
- **Supabase** (Postgres) for persistence — *optional; the app runs fully on mock data*
- Pure, dependency-free **signal engine** (no AI/LLM in the hot path — deterministic & auditable)

## Project structure

```
src/
├─ app/
│  ├─ (app)/                 # Authenticated app shell (sidebar + topbar)
│  │  ├─ dashboard/  signals/  watchlist/
│  │  ├─ performance/  alerts/  briefings/  settings/
│  ├─ api/                   # Route handlers
│  │  ├─ signals  assets  watchlists  performance  alerts  media
│  │  └─ ruflo/{scan-market,scan-watchlist,generate-signal,
│  │            send-alert,log-result,daily-report}
│  ├─ page.tsx               # Landing  ·  pricing/page.tsx
│  └─ layout.tsx  globals.css
├─ components/               # ui/ · signal/ · charts/ · layout/ · marketing/ · media/
└─ lib/
   ├─ signal-engine.ts       # ⭐ the decision engine
   ├─ indicators.ts          # RSI/MACD/EMA/ATR/Bollinger/trend/S-R math
   ├─ signal/                # component scorers + plain-English explainer
   ├─ data/                  # provider abstraction + deterministic mock feed
   ├─ integrations/ruflo/    # 6 workflows + swappable client
   ├─ integrations/higgsfield/ # 4 workflows + swappable client
   ├─ alerts/channels.ts     # email/sms/push/telegram/discord adapters
   └─ db/                    # Supabase client + row types
config/supabase/schema.sql   # 10-table schema with RLS
scripts/ruflo-manifest.ts    # prints the cron manifest for the Ruflo daemon
tests/signal-engine.test.ts  # engine invariants
```

---

## The signal engine

A modular, weighted scoring engine. Eleven component scores (each 0–100, 50 = neutral)
are blended into a single composite:

| Factor group | Weight | Components |
|---|---|---|
| Momentum | 25% | RSI, MACD |
| Trend | 20% | Moving Averages, Trend Strength |
| Volume / Pressure | 15% | Volume |
| Volatility | 15% | ATR, Volatility (Bollinger) |
| Sentiment | 10% | News & Social |
| Prediction Markets | 10% | Kalshi + Polymarket |
| Pattern Matching | 5% | Historical analog (nearest-neighbor) |

*(Support/Resistance is computed too — weight 0 — and drives the entry & invalidation zones.)*

**Composite → direction:** `≥ 65 → LONG`, `≤ 35 → SHORT`, otherwise `WAIT`.

The engine also derives **confidence** (magnitude × component agreement),
the **probability split**, **risk** (volatility + disagreement + low confidence),
**timeframe**, **entry zone**, **invalidation**, **expected volatility**, and the
**explanation** — all deterministic and traceable back to the inputs.

---

## Data sources (mock → live)

The app ships on a **deterministic mock feed**, so it runs with zero configuration.
Every source sits behind an interface in `src/lib/data/providers/types.ts`:

`Polygon.io · Alpaca · Coinbase · Robinhood imports · Kalshi · Polymarket · News · Social`

To go live, set `APEX_DATA_MODE=live`, add the keys, and construct the real
providers in `getProviders()` (`src/lib/data/index.ts`). No engine or UI changes.

---

## Quick start

```bash
npm install
cp .env.example .env.local      # optional — app runs on mock data with no keys
npm run dev                     # http://localhost:3000
```

Other scripts:

```bash
npm run build        # production build
npm run typecheck    # tsc --noEmit
npm test             # signal-engine invariants
npm run ruflo:manifest > config/ruflo/workflows.json   # export cron manifest
```

Everything is optional in `.env.local`. With **no** keys the platform is fully
functional on mock data. Add keys to light up live data, persistence, alerts, and media.

---

## Database (Supabase)

Persistence is optional. To enable it:

1. Create a Supabase project.
2. Run `config/supabase/schema.sql` in the SQL editor.
   Tables: `users, watchlists, assets, signals, signal_history, alerts,
   alert_history, performance_reports, prediction_market_data, social_posts`
   (Row Level Security enabled, owner-only policies).
3. Set `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and
   `SUPABASE_SERVICE_ROLE_KEY` in `.env.local`.

---

## API reference

**Public** (`{ ok, ... }` JSON):

| Endpoint | Description |
|---|---|
| `GET /api/signals?symbol=BTC` / `?symbols=BTC,ETH` / *(none)* | One / many / all signals |
| `GET /api/assets` | Tradable universe |
| `GET /api/watchlists` · `POST {symbols}` | Default / custom watchlist signals |
| `GET /api/performance` | Win rate, best/worst, equity curve, history |
| `GET /api/alerts` · `POST {symbol,direction,confidence,message,channels}` | Feed / dispatch |
| `GET /api/media?kind=briefing\|signal\|social\|viz&symbol=BTC` | Higgsfield brief + job |

**Ruflo** (the daemon calls these on schedule; protected by the
`x-ruflo-secret` header when `RUFLO_WEBHOOK_SECRET` is set):

| Endpoint | Cron | Workflow |
|---|---|---|
| `POST /api/ruflo/scan-market` | `*/15 * * * *` | Market Scan |
| `POST /api/ruflo/scan-watchlist` | `*/5 * * * *` | Watchlist Scan |
| `POST /api/ruflo/send-alert` | `*/15 * * * *` | Confidence + Prediction-market alerts |
| `POST /api/ruflo/log-result` | `0 * * * *` | Signal Outcome Logger |
| `POST /api/ruflo/daily-report` | `0 22 * * *` | Daily Performance Report |
| `POST /api/ruflo/generate-signal` | on demand | Single-asset signal |

Register them with: `npm run ruflo:manifest` (prints JSON + a curl cheat-sheet).

---

## Ruflo & Higgsfield workflows

**Ruflo (6):** Market Scan · Watchlist Scan · Confidence Alert (> 72%) ·
Prediction-Market Alert (odds move > 7%) · Signal Outcome Logger · Daily Performance Report.
Defined in `src/lib/integrations/ruflo/workflows.ts`.

**Higgsfield (4):** Daily Market Briefing (60s) · Signal Explainer (fires > 80% confidence) ·
Social Content (TikTok/IG/YouTube/X) · Probability Cone.
Defined in `src/lib/integrations/higgsfield/workflows.ts`. Each builds a complete
**storyboard** (script + scenes + art direction) from finished signals — ready to render.

### MCP / connection status (read this)

This repo is wired for both, but in the current environment:

- **Ruflo** is configured via `.mcp.json` (`ruflo@latest`) but starts with
  `autoStart: false`. Start it (`npx ruflo mcp start` / the daemon) to drive the
  schedule against `/api/ruflo/*`.
- **Higgsfield** is **not yet connected.** Storyboards are generated from real
  signal data right now; once `HIGGSFIELD_API_KEY` is set (or the Higgsfield MCP
  is connected), `HiggsfieldClient.render()` submits them for video rendering —
  no other code changes. Until then, media jobs return status `"stub"` with the
  finished brief attached.

---

## Deployment

**Vercel + Supabase (recommended):**

1. Push this repo and import it into Vercel (framework auto-detected as Next.js).
2. Add environment variables from `.env.example` (all optional, but set
   `RUFLO_WEBHOOK_SECRET` and the Supabase keys for production).
3. Deploy. Static pages prerender; data routes run on demand.
4. **Scheduling:** point the Ruflo daemon at your deployment URL using the manifest
   above, *or* mirror the cron table with Vercel Cron / GitHub Actions hitting the
   `/api/ruflo/*` endpoints with the `x-ruflo-secret` header.
5. Run `config/supabase/schema.sql` against your Supabase project.

---

## Monetization

| Tier | Price | Highlights |
|---|---|---|
| **Free** | $0 | 3 signals/day, core 8-asset watchlist |
| **Pro** | $49/mo | Unlimited signals, full factor breakdown, custom watchlists & alerts |
| **Elite** | $199/mo | Advanced analytics, prediction-market intelligence, priority alerts, AI briefings |

---

## What's real vs. mock (honest status)

- ✅ **Real & complete:** signal engine, indicators, scoring, explanations, all UI
  pages, all API routes, Ruflo + Higgsfield workflow logic, alert routing, DB schema,
  provider abstraction, tests, production build.
- 🔌 **Stubbed pending credentials:** live market/sentiment/prediction feeds
  (deterministic mock until keys added), alert delivery (no-ops without provider
  keys), Higgsfield video rendering (briefs ready, rendering on connect), Supabase
  persistence (app runs without it).

---

## Disclaimer

Apex Signal is an educational probability tool, **not financial advice**. Signals are
statistical estimates, not recommendations. Markets carry risk; you are solely
responsible for your own trading decisions and any resulting gains or losses.
