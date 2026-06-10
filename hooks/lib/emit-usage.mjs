// emit-usage.mjs — the node handler behind the D69 token-instrumentation hooks (issue #21,
// design §2/§3/§4). Plain JavaScript (no TS syntax) so `node` runs this ENTRY file directly on
// any supported version; the deterministic token math is REUSED from the core
// (workspace/renderer/lib/transcript-usage.ts) via a dynamic import — the source is
// Bun-global-free so node's type-stripping runs it. If an old node cannot strip types the import
// throws and we append a LOUD instrumentation-error event (never a silent drop, never a wrong number).
//
// Invoked by sg-token-hook.sh AFTER the POSIX scope + node-resolvable guards pass. Reads the hook
// payload JSON on stdin; the hook kind is argv[2] (postToolUse | subagentStop | stop). Appends ONE
// token event (or one instrumentation-error) with a single open(O_APPEND)+one write. Always exits 0
// — token capture must never break the session; failure is surfaced as a visible event + stderr.
//
// Layout invariant: this file sits at <root>/hooks/lib/emit-usage.mjs and the core at
// <root>/workspace/renderer/lib/transcript-usage.ts in BOTH the factory and the vendored plugin
// (vendor.ts preserves hooks/ and workspace/renderer/), so the relative import below is stable.

import { openSync, writeSync, closeSync, readFileSync } from "node:fs";

const EVENT_V = "0.4.0";
const MAX_EVENT_BYTES = 4096; // POSIX guarantees an atomic O_APPEND write only up to PIPE_BUF (≈4KB)

const KIND = process.argv[2] || "unknown";
const LOG = process.env.SG_EVENT_LOG; // absolute org-root path (shell already verified it is set)

function nowIso() {
  // Stable UTC ISO-8601 instant (seconds precision) matching the publisher's ISO_UTC_RE.
  return new Date().toISOString().replace(/\.\d{3}Z$/, "Z");
}

/** Append one JSON line with a single open(O_APPEND)+write — the atomic-append contract (06-analytics
 *  "Append contract for concurrent sessions"). Lines are kept < 4KB so the append stays atomic. */
function appendLine(obj) {
  const line = JSON.stringify(obj) + "\n";
  if (Buffer.byteLength(line, "utf8") >= MAX_EVENT_BYTES) {
    // Should never happen — by_model + raw evidence are excluded by construction. Degrade loud
    // rather than risk a non-atomic interleave.
    return appendError(`token event exceeded ${MAX_EVENT_BYTES} bytes — dropped to preserve append atomicity`);
  }
  const fd = openSync(LOG, "a"); // "a" = O_APPEND
  try {
    writeSync(fd, line);
  } finally {
    closeSync(fd);
  }
}

/** Append a visible instrumentation-error event (loud-fail) + stderr. Never throws. */
function appendError(message) {
  const ev = { ts: nowIso(), kind: "instrumentation-error", hook: KIND, error: String(message), v: EVENT_V };
  try {
    const fd = openSync(LOG, "a");
    try { writeSync(fd, JSON.stringify(ev) + "\n"); } finally { closeSync(fd); }
  } catch (e) {
    // Even the error append failed (log unwritable) — last resort stderr only.
    process.stderr.write(`sg-token-hook: could not append instrumentation-error: ${e}\n`);
  }
  process.stderr.write(`sg-token-hook[${KIND}]: ${message}\n`);
}

function readStdin() {
  try {
    return readFileSync(0, "utf8"); // fd 0 = stdin
  } catch {
    return "";
  }
}

/** Read the carrier triple from the scope env; null when any element is absent/blank. */
function carrierTriple() {
  const carrier = process.env.SG_CARRIER_ID;
  const carrier_kind = process.env.SG_CARRIER_KIND;
  const arc = process.env.SG_ARC;
  if (!carrier || !carrier_kind || !arc) return { carrier: null, carrier_kind: null, arc: null };
  return { carrier, carrier_kind, arc };
}

/** Dominant model = the model with the largest total in a by_model map; "unknown" if none. */
function dominantModel(byModel) {
  let best = null;
  let bestTotal = -1;
  for (const [model, c] of Object.entries(byModel || {})) {
    if (c && typeof c.total === "number" && c.total > bestTotal) { best = model; bestTotal = c.total; }
  }
  return best || "unknown";
}

/** The 6-component token_usage block (cache split preserved; by_model deliberately excluded from the
 *  line per design §2 — kept < 4KB so the append stays atomic). */
function usageBlock(c) {
  return {
    input: c.input, output: c.output,
    cache_creation_5m: c.cache_creation_5m, cache_creation_1h: c.cache_creation_1h,
    cache_read: c.cache_read, total: c.total,
  };
}

async function loadCore() {
  // Dynamic import so an old-node type-strip failure is catchable (→ loud instrumentation-error).
  return import("../../workspace/renderer/lib/transcript-usage.ts");
}

async function main() {
  if (!LOG) { appendErrorNoLog("SG_EVENT_LOG unset in the node handler"); return; }

  let payload = {};
  try {
    const raw = readStdin();
    payload = raw ? JSON.parse(raw) : {};
  } catch (e) {
    appendError(`could not parse hook payload JSON: ${e}`);
    return;
  }

  let core;
  try {
    core = await loadCore();
  } catch (e) {
    appendError(`could not load the transcript-usage core (node type-stripping unavailable?): ${e}`);
    return;
  }
  const { sumUsage, usageFromObject } = core;

  const triple = carrierTriple();
  const session = process.env.SG_SESSION_ID || payload.session_id || null;

  try {
    if (KIND === "postToolUse") {
      // PRIMARY per-IU path: a completed SYNC subagent carries native usage on tool_response.usage.
      // A background (run_in_background) call returns status:"async_launched" with no usage — no-op
      // (the SubagentStop path captures it instead).
      const tr = payload.tool_response || {};
      if (tr.status === "async_launched") return; // background dispatch — handled at SubagentStop
      if (!tr.usage || typeof tr.usage !== "object") return; // not a usage-bearing tool result
      const comp = usageFromObject(tr.usage);
      const scope_id = process.env.SG_SCOPE_ID || process.env.SG_IU_ID || null;
      appendLine({
        ts: nowIso(), session, kind: "unit-usage",
        scope_id, agent_id: tr.agentId || payload.agent_id || null, iu: process.env.SG_IU_ID || null,
        carrier: triple.carrier, carrier_kind: triple.carrier_kind, arc: triple.arc,
        cumulative: false,
        model: process.env.SG_MODEL || tr.model || "unknown",
        token_usage: usageBlock(comp), v: EVENT_V,
      });
      return;
    }

    if (KIND === "subagentStop") {
      // BACKGROUND-subagent fallback: no native usage in the payload — sum the agent transcript.
      const tpath = payload.agent_transcript_path || payload.transcript_path;
      if (!tpath) { appendError("subagentStop payload carried no agent_transcript_path"); return; }
      const r = sumUsage(tpath);
      if (r.counted_messages === 0 && r.warnings.length) { appendError(`subagentStop transcript yielded no usage: ${r.warnings[0]}`); return; }
      const scope_id = process.env.SG_SCOPE_ID || process.env.SG_IU_ID || null;
      appendLine({
        ts: nowIso(), session, kind: "unit-usage",
        scope_id, agent_id: payload.agent_id || payload.agentId || null, iu: process.env.SG_IU_ID || null,
        carrier: triple.carrier, carrier_kind: triple.carrier_kind, arc: triple.arc,
        cumulative: false,
        model: dominantModel(r.by_model),
        token_usage: usageBlock(r), v: EVENT_V,
      });
      return;
    }

    if (KIND === "stop") {
      // SESSION baseline: sum the main transcript. Stop fires PER TURN → cumulative:true (the
      // publisher keeps latest-per-session). When the session is an arc-dispatch (carrier triple in
      // scope) ALSO emit a carrier-keyed dispatch-usage from the same sum.
      const tpath = payload.transcript_path;
      if (!tpath) { appendError("stop payload carried no transcript_path"); return; }
      const r = sumUsage(tpath);
      if (r.counted_messages === 0 && r.warnings.length) { appendError(`stop transcript yielded no usage: ${r.warnings[0]}`); return; }
      const model = dominantModel(r.by_model);
      appendLine({
        ts: nowIso(), session, kind: "session-usage",
        scope_id: session,
        carrier: null, carrier_kind: null, arc: null,
        cumulative: true,
        model, token_usage: usageBlock(r), v: EVENT_V,
      });
      if (triple.carrier && triple.arc) {
        appendLine({
          ts: nowIso(), session, kind: "dispatch-usage",
          scope_id: triple.carrier,
          carrier: triple.carrier, carrier_kind: triple.carrier_kind, arc: triple.arc,
          cumulative: true,
          model, token_usage: usageBlock(r), v: EVENT_V,
        });
      }
      return;
    }

    appendError(`unknown hook kind "${KIND}"`);
  } catch (e) {
    appendError(`handler threw on ${KIND}: ${e && e.stack ? e.stack.split("\n")[0] : e}`);
  }
}

// A final fallback when SG_EVENT_LOG is unset (cannot append anywhere) — stderr only.
function appendErrorNoLog(message) {
  process.stderr.write(`sg-token-hook[${KIND}]: ${message}\n`);
}

main();
