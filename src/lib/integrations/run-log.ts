/**
 * Lightweight run-log for observability.
 *
 * Records the last execution of each Ruflo workflow and the last Higgsfield
 * generation so the health endpoint/page can answer "when did X last run?".
 *
 * Storage is an in-process singleton kept on `globalThis` (survives HMR). In a
 * serverless deployment this is per-instance and ephemeral — wire it to Supabase
 * (`performance_reports` / a `run_log` table) for durable, cross-instance history.
 */

export interface RunRecord {
  id: string;
  at: string;
  summary: string;
  ok: boolean;
}

interface RunLogStore {
  ruflo: Record<string, RunRecord>;
  rufloLast: RunRecord | null;
  higgsfieldLast: RunRecord | null;
}

const store: RunLogStore = ((globalThis as Record<string, unknown>).__apexRunLog as RunLogStore) ?? {
  ruflo: {},
  rufloLast: null,
  higgsfieldLast: null,
};
(globalThis as Record<string, unknown>).__apexRunLog = store;

/** Derive a workflow id from an event name like "market-scan.completed". */
function workflowId(event: string): string {
  return event.split(".")[0];
}

export function recordRufloRun(event: string, payload: Record<string, unknown> = {}, ok = true): void {
  const record: RunRecord = {
    id: workflowId(event),
    at: new Date().toISOString(),
    summary: summarize(payload),
    ok,
  };
  store.ruflo[record.id] = record;
  store.rufloLast = record;
}

export function recordHiggsfield(kind: string, status: string): void {
  store.higgsfieldLast = {
    id: kind,
    at: new Date().toISOString(),
    summary: `status: ${status}`,
    ok: status !== "failed",
  };
}

export function getRunLog(): RunLogStore {
  return store;
}

function summarize(payload: Record<string, unknown>): string {
  const entries = Object.entries(payload);
  if (!entries.length) return "ok";
  return entries
    .slice(0, 4)
    .map(([k, v]) => `${k}=${typeof v === "object" ? JSON.stringify(v) : v}`)
    .join(" · ");
}
