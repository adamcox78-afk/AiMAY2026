/**
 * Run-log for observability.
 *
 * Records the last execution of each Ruflo workflow and the last Higgsfield
 * generation (incl. resolved asset URLs from webhooks) so the health endpoint /
 * page / dashboard panel can answer "what ran, when, and did it produce media?".
 *
 * Storage: a fast in-process singleton on `globalThis` (survives HMR) PLUS a
 * best-effort, fire-and-forget write to the Supabase `run_log` table when
 * configured. Reads (`getRunLogSnapshot`) hydrate from Supabase so history
 * survives restarts / spans serverless instances, then overlay the live memory.
 */

import { getSupabaseAdmin } from "../db/supabase";

export interface RunRecord {
  id: string;
  at: string;
  summary: string;
  ok: boolean;
  source?: "ruflo" | "higgsfield";
  kind?: string;
  status?: string;
  assetUrl?: string;
}

interface RunLogStore {
  ruflo: Record<string, RunRecord>;
  rufloLast: RunRecord | null;
  higgsfieldLast: RunRecord | null;
  higgsfieldJobs: Record<string, RunRecord>;
}

export interface RunLogSnapshot {
  ruflo: Record<string, RunRecord>;
  rufloLast: RunRecord | null;
  higgsfieldLast: RunRecord | null;
}

const store: RunLogStore =
  ((globalThis as Record<string, unknown>).__apexRunLog as RunLogStore) ?? {
    ruflo: {},
    rufloLast: null,
    higgsfieldLast: null,
    higgsfieldJobs: {},
  };
(globalThis as Record<string, unknown>).__apexRunLog = store;

function workflowId(event: string): string {
  return event.split(".")[0];
}

/** Fire-and-forget durable write; never throws, no-ops without Supabase. */
function persist(row: Record<string, unknown>): void {
  const admin = getSupabaseAdmin();
  if (!admin) return;
  void admin
    .from("run_log")
    .insert(row)
    .then(
      () => {},
      () => {}
    );
}

export function recordRufloRun(event: string, payload: Record<string, unknown> = {}, ok = true): void {
  const record: RunRecord = {
    id: workflowId(event),
    at: new Date().toISOString(),
    summary: summarize(payload),
    ok,
    source: "ruflo",
  };
  store.ruflo[record.id] = record;
  store.rufloLast = record;
  persist({ source: "ruflo", workflow_id: record.id, status: ok ? "ok" : "failed", summary: record.summary, ok });
}

export function recordHiggsfield(kind: string, status: string, jobId?: string, assetUrl?: string): void {
  const record: RunRecord = {
    id: jobId ?? kind,
    kind,
    at: new Date().toISOString(),
    summary: `${kind}: ${status}`,
    ok: status !== "failed",
    source: "higgsfield",
    status,
    assetUrl,
  };
  store.higgsfieldLast = record;
  if (jobId) store.higgsfieldJobs[jobId] = record;
  persist({ source: "higgsfield", workflow_id: kind, job_id: jobId ?? null, status, summary: record.summary, asset_url: assetUrl ?? null, ok: record.ok });
}

/** Update a job when its async render resolves (called by the Higgsfield webhook). */
export function resolveHiggsfield(jobId: string, status: string, assetUrl?: string): RunRecord {
  const prev = store.higgsfieldJobs[jobId];
  const kind = prev?.kind ?? "render";
  const record: RunRecord = {
    id: jobId,
    kind,
    at: new Date().toISOString(),
    summary: `${kind}: ${status}`,
    ok: status !== "failed",
    source: "higgsfield",
    status,
    assetUrl: assetUrl ?? prev?.assetUrl,
  };
  store.higgsfieldJobs[jobId] = record;
  store.higgsfieldLast = record;
  persist({ source: "higgsfield", workflow_id: kind, job_id: jobId, status, summary: record.summary, asset_url: record.assetUrl ?? null, ok: record.ok });
  return record;
}

/** Synchronous in-memory view (fast path). */
export function getRunLog(): RunLogStore {
  return store;
}

/** Durable view: hydrate from Supabase (if configured), then overlay live memory. */
export async function getRunLogSnapshot(): Promise<RunLogSnapshot> {
  const memory: RunLogSnapshot = {
    ruflo: store.ruflo,
    rufloLast: store.rufloLast,
    higgsfieldLast: store.higgsfieldLast,
  };
  const admin = getSupabaseAdmin();
  if (!admin) return memory;
  try {
    const { data } = await admin
      .from("run_log")
      .select("source, workflow_id, status, summary, asset_url, ok, created_at")
      .order("created_at", { ascending: false })
      .limit(100);
    if (!data) return memory;
    const ruflo: Record<string, RunRecord> = {};
    let rufloLast: RunRecord | null = null;
    let higgsfieldLast: RunRecord | null = null;
    for (const row of data as DbRow[]) {
      const rec = rowToRecord(row);
      if (row.source === "ruflo") {
        if (!rufloLast) rufloLast = rec;
        if (!ruflo[row.workflow_id]) ruflo[row.workflow_id] = rec;
      } else if (row.source === "higgsfield" && !higgsfieldLast) {
        higgsfieldLast = rec;
      }
    }
    // Live memory wins where present (same-instance freshness).
    return {
      ruflo: { ...ruflo, ...store.ruflo },
      rufloLast: store.rufloLast ?? rufloLast,
      higgsfieldLast: store.higgsfieldLast ?? higgsfieldLast,
    };
  } catch {
    return memory;
  }
}

interface DbRow {
  source: "ruflo" | "higgsfield";
  workflow_id: string;
  status: string;
  summary: string;
  asset_url: string | null;
  ok: boolean;
  created_at: string;
}

function rowToRecord(row: DbRow): RunRecord {
  return {
    id: row.workflow_id,
    kind: row.workflow_id,
    at: row.created_at,
    summary: row.summary,
    ok: row.ok,
    source: row.source,
    status: row.status,
    assetUrl: row.asset_url ?? undefined,
  };
}

function summarize(payload: Record<string, unknown>): string {
  const entries = Object.entries(payload);
  if (!entries.length) return "ok";
  return entries
    .slice(0, 4)
    .map(([k, v]) => `${k}=${typeof v === "object" ? JSON.stringify(v) : v}`)
    .join(" · ");
}
