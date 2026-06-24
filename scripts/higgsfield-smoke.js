#!/usr/bin/env node
/**
 * Higgsfield connectivity preflight.
 *
 * Run after setting HIGGSFIELD_API_KEY to confirm the integration can actually
 * reach Higgsfield. Diagnoses the three failure modes precisely:
 *   1. key missing            → set HIGGSFIELD_API_KEY
 *   2. host egress-blocked    → allowlist the host in your network policy
 *   3. auth rejected (401/403)→ check the key
 *
 *   npm run higgsfield:smoke
 *
 * Exit 0 = ready to render; exit 1 = not ready (reason printed).
 */

const API_URL = (process.env.HIGGSFIELD_API_URL ?? "https://api.higgsfield.ai").replace(/\/$/, "");
const API_PATH = process.env.HIGGSFIELD_API_PATH ?? "/v1/generations";
const MCP_URL = process.env.HIGGSFIELD_MCP_URL ?? "https://mcp.higgsfield.ai/mcp";
const KEY = process.env.HIGGSFIELD_API_KEY;

const ok = (m) => console.log(`  \x1b[32m✓\x1b[0m ${m}`);
const bad = (m) => console.log(`  \x1b[31m✗\x1b[0m ${m}`);
const info = (m) => console.log(`  \x1b[2m·\x1b[0m ${m}`);

async function probe(label, url, init) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 12000);
  try {
    const res = await fetch(url, { ...init, signal: controller.signal });
    const body = await res.text().catch(() => "");
    const egressBlocked =
      res.status === 403 && /not in allowlist|host_not_allowed/i.test(body + (res.headers.get("x-deny-reason") || ""));
    if (egressBlocked) {
      bad(`${label}: egress blocked — host not in network allowlist (${new URL(url).host})`);
      return "egress";
    }
    if (res.status === 401 || res.status === 403) {
      bad(`${label}: reachable but auth rejected (HTTP ${res.status}) — check the API key`);
      return "auth";
    }
    ok(`${label}: reachable (HTTP ${res.status})`);
    return "ok";
  } catch (err) {
    bad(`${label}: unreachable (${err.name === "AbortError" ? "timeout" : err.message})`);
    return "unreachable";
  } finally {
    clearTimeout(timer);
  }
}

(async () => {
  console.log("\nHiggsfield preflight\n────────────────────");

  if (!KEY) {
    bad("HIGGSFIELD_API_KEY is not set");
    info("Set it in your environment (the MCP reads process env at Claude Code startup).");
  } else {
    ok(`HIGGSFIELD_API_KEY is set (${KEY.slice(0, 4)}…${KEY.slice(-2)})`);
  }

  const headers = KEY ? { authorization: `Bearer ${KEY}`, "content-type": "application/json" } : {};
  const api = await probe("REST API", `${API_URL}${API_PATH}`, { method: "OPTIONS", headers });
  const mcp = await probe("MCP server", MCP_URL, {
    method: "POST",
    headers: { ...headers, accept: "application/json, text/event-stream" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "initialize", params: {} }),
  });

  console.log("");
  const ready = KEY && api === "ok" && (mcp === "ok" || mcp === "auth");
  if (ready) {
    console.log("\x1b[32mReady:\x1b[0m Higgsfield is reachable. Reload Claude Code and run /mcp to finish login.");
    process.exit(0);
  }
  console.log("\x1b[33mNot ready.\x1b[0m Remediation:");
  if (!KEY) console.log("  • Set HIGGSFIELD_API_KEY");
  if (api === "egress" || mcp === "egress")
    console.log("  • Allowlist api.higgsfield.ai and mcp.higgsfield.ai in your environment's network egress policy");
  if (api === "auth" || mcp === "auth") console.log("  • The key was rejected — verify it");
  process.exit(1);
})();
