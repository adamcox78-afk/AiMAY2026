-- ============================================================================
-- Apex Signal — Supabase / PostgreSQL schema
-- ----------------------------------------------------------------------------
-- Run in the Supabase SQL editor (or `psql`). Idempotent-ish: safe to re-run on
-- a fresh project. Row Level Security is enabled with owner-only policies.
-- ============================================================================

create extension if not exists pgcrypto;

-- ---- Enums -----------------------------------------------------------------
do $$ begin
  create type signal_direction as enum ('LONG', 'SHORT', 'WAIT');
exception when duplicate_object then null; end $$;

do $$ begin
  create type risk_level as enum ('Low', 'Medium', 'High');
exception when duplicate_object then null; end $$;

do $$ begin
  create type timeframe as enum ('15m', '1H', '4H', '1D', '1W');
exception when duplicate_object then null; end $$;

do $$ begin
  create type asset_class as enum ('crypto', 'stock', 'etf', 'prediction');
exception when duplicate_object then null; end $$;

do $$ begin
  create type signal_outcome as enum ('won', 'lost', 'invalidated', 'open');
exception when duplicate_object then null; end $$;

do $$ begin
  create type plan_tier as enum ('free', 'pro', 'elite');
exception when duplicate_object then null; end $$;

do $$ begin
  create type alert_channel as enum ('email', 'sms', 'push', 'telegram', 'discord');
exception when duplicate_object then null; end $$;

-- ---- users (profile, 1:1 with auth.users) ----------------------------------
create table if not exists public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  email text unique not null,
  display_name text,
  plan plan_tier not null default 'free',
  signals_used_today int not null default 0,
  created_at timestamptz not null default now()
);

-- ---- assets (reference universe + custom user assets) -----------------------
create table if not exists public.assets (
  id uuid primary key default gen_random_uuid(),
  symbol text not null,
  name text not null,
  asset_class asset_class not null,
  exchange text,
  created_at timestamptz not null default now(),
  unique (symbol, asset_class)
);

-- ---- watchlists ------------------------------------------------------------
create table if not exists public.watchlists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  name text not null default 'My Watchlist',
  symbols text[] not null default '{}',
  created_at timestamptz not null default now()
);
create index if not exists watchlists_user_idx on public.watchlists (user_id);

-- ---- signals (latest computed signal per asset) ----------------------------
create table if not exists public.signals (
  id uuid primary key default gen_random_uuid(),
  symbol text not null,
  direction signal_direction not null,
  confidence int not null check (confidence between 0 and 100),
  composite_score int not null check (composite_score between 0 and 100),
  prob_bull int not null,
  prob_neutral int not null,
  prob_bear int not null,
  risk risk_level not null,
  risk_score int not null,
  timeframe timeframe not null,
  price numeric not null,
  entry_low numeric,
  entry_high numeric,
  invalidation numeric,
  expected_vol_pct numeric,
  reason_summary text,
  explanation text,
  components jsonb not null default '[]',
  generated_at timestamptz not null default now()
);
create index if not exists signals_symbol_idx on public.signals (symbol);
create index if not exists signals_generated_idx on public.signals (generated_at desc);

-- ---- signal_history (resolved outcomes — feeds performance) -----------------
create table if not exists public.signal_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users (id) on delete set null,
  symbol text not null,
  direction signal_direction not null,
  confidence int not null,
  entry_price numeric not null,
  outcome signal_outcome not null default 'open',
  pnl_pct numeric not null default 0,
  timeframe timeframe not null,
  opened_at timestamptz not null default now(),
  closed_at timestamptz
);
create index if not exists signal_history_symbol_idx on public.signal_history (symbol);
create index if not exists signal_history_outcome_idx on public.signal_history (outcome);

-- ---- alerts (user alert rules) ---------------------------------------------
create table if not exists public.alerts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  symbol text,
  min_confidence int not null default 72,
  channels alert_channel[] not null default '{email}',
  active boolean not null default true,
  created_at timestamptz not null default now()
);
create index if not exists alerts_user_idx on public.alerts (user_id);

-- ---- alert_history (delivered alerts) --------------------------------------
create table if not exists public.alert_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users (id) on delete cascade,
  symbol text not null,
  direction signal_direction not null,
  confidence int not null,
  channel alert_channel not null,
  message text not null,
  delivered boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists alert_history_user_idx on public.alert_history (user_id, created_at desc);

-- ---- performance_reports (daily snapshots) ---------------------------------
create table if not exists public.performance_reports (
  id uuid primary key default gen_random_uuid(),
  report_date date not null default current_date,
  total_signals int not null,
  win_rate numeric not null,
  avg_win_pct numeric not null,
  avg_loss_pct numeric not null,
  long_win_rate numeric not null,
  short_win_rate numeric not null,
  payload jsonb not null default '{}',
  created_at timestamptz not null default now(),
  unique (report_date)
);

-- ---- prediction_market_data (Kalshi / Polymarket snapshots) ----------------
create table if not exists public.prediction_market_data (
  id uuid primary key default gen_random_uuid(),
  source text not null check (source in ('kalshi', 'polymarket')),
  symbol text,
  question text not null,
  yes_price numeric not null,
  change_pct numeric not null default 0,
  volume_usd numeric not null default 0,
  captured_at timestamptz not null default now()
);
create index if not exists pmd_source_idx on public.prediction_market_data (source, captured_at desc);

-- ---- social_posts (Higgsfield-generated content log) -----------------------
create table if not exists public.social_posts (
  id uuid primary key default gen_random_uuid(),
  symbol text,
  platform text not null,
  kind text not null,
  caption text,
  media_url text,
  job_status text not null default 'stub',
  brief jsonb not null default '{}',
  created_at timestamptz not null default now()
);

-- ============================================================================
-- Row Level Security — owner-only access for user-scoped tables.
-- ============================================================================
alter table public.users enable row level security;
alter table public.watchlists enable row level security;
alter table public.signal_history enable row level security;
alter table public.alerts enable row level security;
alter table public.alert_history enable row level security;

do $$ begin
  create policy "own profile" on public.users
    for all using (auth.uid() = id) with check (auth.uid() = id);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "own watchlists" on public.watchlists
    for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "own history" on public.signal_history
    for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "own alerts" on public.alerts
    for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "own alert history" on public.alert_history
    for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
exception when duplicate_object then null; end $$;

-- Public read-only reference data (signals, assets, prediction markets) is served
-- through the API with the service role; keep RLS off or add read policies as needed.
