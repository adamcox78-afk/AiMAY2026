#!/usr/bin/env node
/**
 * Apex Signal — Ruflo worker / daemon.
 *
 * A dependency-free local scheduler that drives the Ruflo automation endpoints on
 * their cron cadence. This is what "turns Ruflo on" in development without the
 * external Ruflo CLI: it reads the cron manifest (config/ruflo/workflows.json,
 * falling back to a built-in list) and POSTs each workflow's endpoint when its
 * schedule matches.
 *
 *   node scripts/ruflo-worker.js          # run continuously (daemon)
 *   node scripts/ruflo-worker.js --once   # fire every workflow once, then exit
 *
 * Env: NEXT_PUBLIC_APP_URL (target, default http://localhost:3000),
 *      RUFLO_WEBHOOK_SECRET (sent as x-ruflo-secret).
 */

const fs = require("node:fs");
const path = require("node:path");

const BASE = (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(/\/$/, "");
const SECRET = process.env.RUFLO_WEBHOOK_SECRET || "";
const ONCE = process.argv.includes("--once");

const FALLBACK = [
  { id: "market-scan", schedule: "*/15 * * * *", endpoint: "/api/ruflo/scan-market" },
  { id: "watchlist-scan", schedule: "*/5 * * * *", endpoint: "/api/ruflo/scan-watchlist" },
  { id: "confidence-alert", schedule: "*/15 * * * *", endpoint: "/api/ruflo/send-alert" },
  { id: "signal-outcome-logger", schedule: "0 * * * *", endpoint: "/api/ruflo/log-result" },
  { id: "daily-performance-report", schedule: "0 22 * * *", endpoint: "/api/ruflo/daily-report" },
  { id: "media-briefing", schedule: "0 13 * * *", endpoint: "/api/ruflo/media-briefing" },
  { id: "lead-followup", schedule: "0 16 * * *", endpoint: "/api/ruflo/lead-followup" },
];

function loadWorkflows() {
  try {
    const p = path.join(process.cwd(), "config", "ruflo", "workflows.json");
    const all = JSON.parse(fs.readFileSync(p, "utf8"));
    // Collapse duplicate endpoints (e.g. the two alert workflows share one).
    const seen = new Set();
    return all.filter((w) => (seen.has(w.endpoint) ? false : seen.add(w.endpoint)));
  } catch {
    return FALLBACK;
  }
}

function fieldMatch(field, value) {
  if (field === "*") return true;
  if (field.startsWith("*/")) return value % Number(field.slice(2)) === 0;
  return field.split(",").map(Number).includes(value);
}
function cronMatches(expr, date) {
  const [min, hr] = expr.split(" ");
  return fieldMatch(min, date.getMinutes()) && fieldMatch(hr, date.getHours());
}

async function trigger(w) {
  const url = `${BASE}${w.endpoint}`;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: SECRET ? { "x-ruflo-secret": SECRET } : {},
    });
    const ok = res.ok ? "ok" : `HTTP ${res.status}`;
    console.log(`[ruflo-worker] ${new Date().toISOString()} → ${w.id} (${ok})`);
  } catch (err) {
    console.error(`[ruflo-worker] ${w.id} failed: ${err.message} (is the app running at ${BASE}?)`);
  }
}

async function main() {
  const workflows = loadWorkflows();
  console.log(`[ruflo-worker] target=${BASE} · ${workflows.length} workflows · secret=${SECRET ? "set" : "none"}`);

  if (ONCE) {
    for (const w of workflows) await trigger(w);
    console.log("[ruflo-worker] --once complete.");
    return;
  }

  console.log("[ruflo-worker] scheduler running (Ctrl+C to stop). Schedules:");
  workflows.forEach((w) => console.log(`  ${w.schedule.padEnd(14)} ${w.endpoint}`));

  // Kick a market scan immediately so the dashboard shows activity on startup.
  await trigger(workflows[0]);

  const fired = new Map();
  setInterval(() => {
    const now = new Date();
    const stamp = `${now.getHours()}:${now.getMinutes()}`;
    for (const w of workflows) {
      if (cronMatches(w.schedule, now) && fired.get(w.id) !== stamp) {
        fired.set(w.id, stamp);
        void trigger(w);
      }
    }
  }, 15000);
}

main();
