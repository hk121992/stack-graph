// End-to-end test for the D69 token-instrumentation hooks (issue #21, design §2/§3/§4).
// Drives the POSIX guard sg-token-hook.sh + the node handler lib/emit-usage.mjs with controlled
// stdin payloads + scope env, then asserts the appended event lines. Mirrors the renderer test
// convention: a checks[] list, ✓/✗ per check, exit 1 on any failure.
//
// Run: bun run hooks/sg-token-hook.test.ts   (exit 0 = OK)

import { writeFileSync, mkdtempSync, readFileSync, rmSync, existsSync, symlinkSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const hook = path.join(here, "sg-token-hook.sh");
const fixture = path.join(here, "..", "workspace", "renderer", "fixtures", "transcript-usage", "sample-transcript.jsonl");

const dir = mkdtempSync(path.join(tmpdir(), "sg-hook-test-"));

/** Run the hook with a kind, stdin payload, and extra env. Returns the lines appended to the log. */
function runHook(kind: string, payload: object, env: Record<string, string>, opts: { restrictedPath?: boolean } = {}): any[] {
  const log = path.join(dir, `events-${Math.abs(hashCode(kind + JSON.stringify(env)))}.jsonl`);
  const runEnv: Record<string, string> = { ...process.env as Record<string, string>, SG_EVENT_LOG: log, ...env };
  if (opts.restrictedPath) {
    // A PATH with coreutils but NOT node, so `command -v node` fails (fail-loud branch). The shell
    // itself is launched by absolute path, so PATH only governs the externals it calls.
    const binDir = path.join(dir, "restricted-bin");
    if (!existsSync(binDir)) {
      mkdirSync(binDir, { recursive: true });
      for (const tool of ["cat", "date", "dirname", "env", "sh"]) {
        const src = ["/usr/bin/" + tool, "/bin/" + tool].find((p) => existsSync(p));
        if (src && !existsSync(path.join(binDir, tool))) symlinkSync(src, path.join(binDir, tool));
      }
    }
    runEnv.PATH = binDir;
  }
  try {
    execFileSync("sh", [hook, kind], { input: JSON.stringify(payload), env: runEnv, encoding: "utf8" });
  } catch (e) {
    // The hook always exits 0; a throw is itself a failure. Surface it.
    console.error(`hook threw for kind=${kind}:`, e);
  }
  if (!existsSync(log)) return [];
  return readFileSync(log, "utf8").split("\n").filter((l) => l.trim() !== "").map((l) => JSON.parse(l));
}

function hashCode(s: string): number { let h = 0; for (let i = 0; i < s.length; i++) { h = (h * 31 + s.charCodeAt(i)) | 0; } return h; }

const checks: Array<[string, boolean]> = [];

// ── 1. Scope gate: SG_TOKEN_EVENT_KIND absent → dormant no-op (no event appended) ──
{
  const evs = runHook("stop", { transcript_path: fixture }, { /* SG_TOKEN_EVENT_KIND deliberately unset */ });
  checks.push(["scope gate: no SG_TOKEN_EVENT_KIND → no event appended", evs.length === 0]);
}

// ── 2. postToolUse with native sync-subagent usage → unit-usage ──
{
  const evs = runHook("postToolUse",
    { tool_response: { agentId: "ag-1", status: "success", usage: { input_tokens: 100, output_tokens: 50, cache_read_input_tokens: 9000, cache_creation: { ephemeral_5m_input_tokens: 10, ephemeral_1h_input_tokens: 20 } } } },
    { SG_TOKEN_EVENT_KIND: "on", SG_IU_ID: "iu-007", SG_SCOPE_ID: "iu-007", SG_MODEL: "claude-opus-4-8" });
  const e = evs[0];
  checks.push(
    ["postToolUse → exactly 1 event", evs.length === 1],
    ["postToolUse → kind unit-usage", e?.kind === "unit-usage"],
    ["postToolUse → cumulative false", e?.cumulative === false],
    ["postToolUse → scope_id + iu bound from env", e?.scope_id === "iu-007" && e?.iu === "iu-007"],
    ["postToolUse → agent_id from tool_response", e?.agent_id === "ag-1"],
    ["postToolUse → model carried", e?.model === "claude-opus-4-8"],
    ["postToolUse → cache_read preserved (the dominant cost)", e?.token_usage?.cache_read === 9000],
    ["postToolUse → TTL split preserved", e?.token_usage?.cache_creation_5m === 10 && e?.token_usage?.cache_creation_1h === 20],
    ["postToolUse → disjoint total = 100+50+10+20+9000", e?.token_usage?.total === 9180],
    ["postToolUse → by_model NOT on the line (< 4KB contract)", e && !("by_model" in e)],
    ["postToolUse → v 0.4.0", e?.v === "0.4.0"],
  );
}

// ── 3. postToolUse async_launched (background) → no-op ──
{
  const evs = runHook("postToolUse", { tool_response: { status: "async_launched" } }, { SG_TOKEN_EVENT_KIND: "on", SG_IU_ID: "iu-bg" });
  checks.push(["postToolUse async_launched → no event (background handled at SubagentStop)", evs.length === 0]);
}

// ── 4. subagentStop with a transcript path → unit-usage summed from the fixture ──
{
  const evs = runHook("subagentStop", { agent_id: "ag-bg", agent_transcript_path: fixture }, { SG_TOKEN_EVENT_KIND: "on", SG_IU_ID: "iu-009", SG_SCOPE_ID: "iu-009" });
  const e = evs[0];
  checks.push(
    ["subagentStop → 1 unit-usage event", evs.length === 1 && e?.kind === "unit-usage"],
    ["subagentStop → total summed from fixture (241375)", e?.token_usage?.total === 241375],
    ["subagentStop → cache_read summed (94362)", e?.token_usage?.cache_read === 94362],
    ["subagentStop → dominant model is the max-total model (claude-opus-4-6)", e?.model === "claude-opus-4-6"],
    ["subagentStop → agent_id from payload", e?.agent_id === "ag-bg"],
  );
}

// ── 5a. stop (no carrier) → session-usage cumulative:true ──
{
  const evs = runHook("stop", { transcript_path: fixture, session_id: "sess-1" }, { SG_TOKEN_EVENT_KIND: "on", SG_SESSION_ID: "sess-1" });
  const e = evs[0];
  checks.push(
    ["stop (no carrier) → exactly 1 session-usage event", evs.length === 1 && e?.kind === "session-usage"],
    ["stop → cumulative true (Stop is per-turn)", e?.cumulative === true],
    ["stop → scope_id = session id", e?.scope_id === "sess-1"],
    ["stop → total summed from fixture", e?.token_usage?.total === 241375],
    ["stop → no carrier triple", e?.carrier === null && e?.arc === null],
  );
}

// ── 5b. stop WITH an arc-dispatch carrier triple → session-usage AND dispatch-usage ──
{
  const evs = runHook("stop", { transcript_path: fixture, session_id: "sess-2" },
    { SG_TOKEN_EVENT_KIND: "on", SG_SESSION_ID: "sess-2", SG_CARRIER_ID: "ci-77", SG_CARRIER_KIND: "standalone-iu", SG_ARC: "incremental" });
  const kinds = evs.map((e) => e.kind).sort();
  const dispatch = evs.find((e) => e.kind === "dispatch-usage");
  checks.push(
    ["stop (arc-dispatch) → both session-usage + dispatch-usage", kinds.join(",") === "dispatch-usage,session-usage"],
    ["dispatch-usage → carrier triple", dispatch?.carrier === "ci-77" && dispatch?.carrier_kind === "standalone-iu" && dispatch?.arc === "incremental"],
    ["dispatch-usage → scope_id = carrier id", dispatch?.scope_id === "ci-77"],
    ["dispatch-usage → cumulative true", dispatch?.cumulative === true],
    ["dispatch-usage → total summed from fixture", dispatch?.token_usage?.total === 241375],
  );
}

// ── 6. FAIL LOUD: node not resolvable → instrumentation-error, never silent ──
{
  const evs = runHook("stop", { transcript_path: fixture }, { SG_TOKEN_EVENT_KIND: "on", SG_SESSION_ID: "sess-x" }, { restrictedPath: true });
  const e = evs[0];
  checks.push(
    ["fail-loud: node missing → exactly 1 event", evs.length === 1],
    ["fail-loud: kind instrumentation-error (not silent)", e?.kind === "instrumentation-error"],
    ["fail-loud: error names the node runtime", typeof e?.error === "string" && e.error.includes("node")],
    ["fail-loud: tagged with the hook kind", e?.hook === "stop"],
  );
}

// ── 7. stop with a missing transcript_path → loud instrumentation-error ──
{
  const evs = runHook("stop", { session_id: "no-path" }, { SG_TOKEN_EVENT_KIND: "on", SG_SESSION_ID: "no-path" });
  checks.push(["stop without transcript_path → instrumentation-error", evs.length === 1 && evs[0].kind === "instrumentation-error"]);
}

let ok = true;
for (const [name, pass] of checks) {
  console.log(`${pass ? "✓" : "✗"} ${name}`);
  if (!pass) ok = false;
}

rmSync(dir, { recursive: true, force: true });
console.log(ok ? "\nSG-TOKEN-HOOK TEST OK" : "\nSG-TOKEN-HOOK TEST FAILED");
process.exit(ok ? 0 : 1);
