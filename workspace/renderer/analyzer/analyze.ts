#!/usr/bin/env bun
/**
 * analyze.ts — the transcript-analytics analyzer entry point (Cluster A §1, §9).
 *
 * Reads the raw Claude Code session transcripts under SG_TRANSCRIPT_ROOT (default ~/.claude/projects),
 * derives the analytics substrate deterministically, and FULL-REWRITES a single derived event log:
 *
 *     <org-root>/.stack-graph/derived/analyzer-events.jsonl   (the derived stream the publisher reads)
 *     <org-root>/.stack-graph/derived/analyzer-cursor.json    (the per-transcript skip-cache)
 *
 * IDEMPOTENCY (§9, S2). The output is fully rewritten each run in canonical sorted order
 * ((ts, session, kind)), ONE settled row per (session, scope). A re-run with no new activity yields a
 * BYTE-IDENTICAL file. The cursor is a PERFORMANCE skip-cache only — correctness never depends on it;
 * `--no-cursor` forces a full re-read and produces the identical file.
 *
 * LOCALITY (§1, §9, S1). The analyzer emits ONLY allowlist-shaped values (ids ID_RE-clean, ts
 * strict-UTC ISO, models MODEL_RE-clean) and NEVER free-text (no denial command, rejection reason, or
 * raw permission text — only categorised counts / enums). The derived log is local-only and gitignored;
 * only portal-projection.json (the publisher's sanitised output) ever leaves the machine.
 *
 * PORTABILITY: node `fs`/`os`/`path` + JSON only (no Bun.* globals), so it runs under bun or node.
 *
 * USAGE:
 *   bun run analyze.ts [--no-cursor] [--root <dir>] [--out <events.jsonl>] [--threshold-min <n>]
 *
 * ENV:
 *   SG_TRANSCRIPT_ROOT   transcript root (default ~/.claude/projects)
 *   STACK_GRAPH_EVENTS_DIR   the .stack-graph/ dir (default <repo-root>/.stack-graph)
 *   SG_STALL_THRESHOLD_MIN   stall gap threshold in minutes (default 30)
 */

import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { execSync } from "node:child_process";

import {
  serializeRows,
  normalizeTs,
} from "./schema.ts";
import type { TranscriptEntry, TranscriptMeta, DerivedRow } from "./schema.ts";
import { loadCursor, saveCursor, fileSignature, isUnchanged } from "./cursor.ts";
import type { CursorFile } from "./cursor.ts";
import { deriveTokenRows } from "./derive-tokens.ts";

// ── CLI / config ──────────────────────────────────────────────────────────────────────────────

interface Options {
  noCursor: boolean;
  root: string;
  outPath: string;
  cursorPath: string;
  stallThresholdMs: number;
}

const DEFAULT_STALL_THRESHOLD_MIN = 30;

function expandHome(p: string): string {
  if (p === "~") return os.homedir();
  if (p.startsWith("~/")) return path.join(os.homedir(), p.slice(2));
  return p;
}

/** Resolve the org-root (where .stack-graph/ lives). The bound STACK_GRAPH_EVENTS_DIR wins; otherwise
 *  the git-common-dir parent (worktree-correct, mirrors publish-projection.ts), else cwd. */
function resolveStackGraphDir(): string {
  const env = process.env.STACK_GRAPH_EVENTS_DIR;
  if (env && env.trim() !== "") return expandHome(env.trim());
  const start = path.dirname(new URL(import.meta.url).pathname);
  try {
    const commonDir = execSync("git rev-parse --git-common-dir", { cwd: start, encoding: "utf8" }).trim();
    if (commonDir) {
      const abs = path.isAbsolute(commonDir) ? commonDir : path.resolve(start, commonDir);
      return path.join(path.dirname(abs), ".stack-graph");
    }
  } catch {
    /* git unavailable — fall through */
  }
  return path.join(process.cwd(), ".stack-graph");
}

function parseOptions(argv: string[]): Options {
  let noCursor = false;
  let root: string | null = null;
  let outPath: string | null = null;
  let thresholdMin = Number(process.env.SG_STALL_THRESHOLD_MIN) || DEFAULT_STALL_THRESHOLD_MIN;

  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--no-cursor") noCursor = true;
    else if (a === "--root") root = argv[++i] ?? null;
    else if (a === "--out") outPath = argv[++i] ?? null;
    else if (a === "--threshold-min") thresholdMin = Number(argv[++i]) || thresholdMin;
    else if (a === "--help" || a === "-h") {
      process.stdout.write(
        "Usage: analyze.ts [--no-cursor] [--root <dir>] [--out <events.jsonl>] [--threshold-min <n>]\n",
      );
      process.exit(0);
    }
  }

  const resolvedRoot = expandHome(
    root ?? process.env.SG_TRANSCRIPT_ROOT ?? path.join(os.homedir(), ".claude", "projects"),
  );
  const sgDir = resolveStackGraphDir();
  const derivedDir = path.join(sgDir, "derived");
  const resolvedOut = outPath ?? path.join(derivedDir, "analyzer-events.jsonl");
  // The cursor lives ALONGSIDE the events file (analyzer-cursor.json in the same dir), so an
  // explicit --out (e.g. a test tmpdir) keeps the cache local to that output rather than the repo's
  // .stack-graph/. With the default --out, this resolves to derived/analyzer-cursor.json as designed.
  return {
    noCursor,
    root: resolvedRoot,
    outPath: resolvedOut,
    cursorPath: path.join(path.dirname(resolvedOut), "analyzer-cursor.json"),
    stallThresholdMs: Math.max(0, thresholdMin) * 60_000,
  };
}

// ── Transcript discovery + parsing ──────────────────────────────────────────────────────────────

/** Recursively collect every `*.jsonl` under root (including `<session>/subagents/agent-*.jsonl`).
 *  Returned sorted for deterministic walk order. Symlinks are not followed (avoid cycles). */
export function walkTranscripts(root: string): string[] {
  const out: string[] = [];
  function recurse(dir: string): void {
    let entries: fs.Dirent[];
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const e of entries) {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) recurse(full);
      else if (e.isFile() && e.name.endsWith(".jsonl")) out.push(full);
    }
  }
  recurse(root);
  out.sort();
  return out;
}

/** Parse one transcript into (entries, meta). Never throws — a malformed line is skipped (the final
 *  line of a live transcript is commonly truncated). `isSubagent` is true for a path under a
 *  `subagents/` directory. */
export function parseTranscript(filePath: string): { entries: TranscriptEntry[]; meta: TranscriptMeta } {
  const isSubagent = filePath.split(path.sep).includes("subagents");
  let text = "";
  try {
    text = fs.readFileSync(filePath, "utf8");
  } catch {
    /* unreadable — empty */
  }

  const entries: TranscriptEntry[] = [];
  let sessionId: string | null = null;
  let firstTs: string | null = null;
  let lastTs: string | null = null;
  let gitBranch: string | null = null;
  let cwd: string | null = null;

  for (const line of text.split("\n")) {
    const trimmed = line.trim();
    if (trimmed === "") continue;
    let obj: TranscriptEntry;
    try {
      obj = JSON.parse(trimmed) as TranscriptEntry;
    } catch {
      continue; // truncated/malformed line — skip, never throw
    }
    entries.push(obj);
    if (sessionId === null && typeof obj.sessionId === "string" && obj.sessionId !== "") sessionId = obj.sessionId;
    const ts = normalizeTs(obj.timestamp);
    if (ts) {
      if (firstTs === null) firstTs = ts;
      lastTs = ts;
    }
    if (gitBranch === null && typeof obj.gitBranch === "string" && obj.gitBranch !== "") gitBranch = obj.gitBranch;
    if (cwd === null && typeof obj.cwd === "string" && obj.cwd !== "") cwd = obj.cwd;
  }

  // Fall back to the filename stem for the session id (real transcripts are named <sessionId>.jsonl;
  // subagents are agent-<hash>.jsonl, so we keep the parent session dir name where available).
  if (sessionId === null) {
    if (isSubagent) {
      // <session>/subagents/agent-*.jsonl → the session dir is two levels up.
      const parts = filePath.split(path.sep);
      const subIdx = parts.lastIndexOf("subagents");
      sessionId = subIdx > 0 ? parts[subIdx - 1] : path.basename(filePath, ".jsonl");
    } else {
      sessionId = path.basename(filePath, ".jsonl");
    }
  }

  const meta: TranscriptMeta = {
    path: filePath,
    sessionId,
    isSubagent,
    firstTs,
    lastTs,
    gitBranch,
    cwd,
  };
  return { entries, meta };
}

// ── The run ─────────────────────────────────────────────────────────────────────────────────────

/** Per-transcript parsed product the derivations consume. */
export interface ParsedTranscript {
  entries: TranscriptEntry[];
  meta: TranscriptMeta;
}

/**
 * Derive ALL rows for a workspace from its parsed transcripts. Pure: same parsed transcripts in ⇒
 * the same rows out (order-independent — the caller sorts canonically). Split out from runtime I/O so
 * the test harness can drive it directly.
 *
 * A1 wires the token derivation; A2–A4 add friction, activity+attribution, and stalls.
 */
export function deriveAll(parsed: ParsedTranscript[], _opts: { stallThresholdMs: number }): DerivedRow[] {
  const rows: DerivedRow[] = [];
  for (const p of parsed) {
    // A3 will resolve real attribution; A1 uses the null triple (no carrier signal from tokens alone).
    rows.push(...deriveTokenRows(p.meta, { carrier: null, carrier_kind: null, arc: null, iu: null }));
  }
  return rows;
}

function main(): void {
  const opts = parseOptions(process.argv.slice(2));

  // Ensure the derived/ dir exists (the analyzer's only writes are inside .stack-graph/).
  fs.mkdirSync(path.dirname(opts.outPath), { recursive: true });

  const files = walkTranscripts(opts.root);
  const cursor: CursorFile = opts.noCursor ? { v: "1", entries: {} } : loadCursor(opts.cursorPath);
  const nextCursor: CursorFile = { v: "1", entries: {} };

  // Parse every transcript. The cursor lets us SKIP re-reading unchanged transcripts for the
  // per-transcript derivations, BUT the output is fully rewritten regardless — so we still need every
  // transcript's rows. To keep correctness independent of the cursor while still optimising, we cache
  // nothing across runs here at the row level (a future optimisation); the cursor today records
  // signatures so a `--no-cursor` run and a cursor run produce the identical file (verified in tests).
  const parsed: ParsedTranscript[] = [];
  for (const file of files) {
    let sig;
    try {
      sig = fileSignature(file);
    } catch {
      continue; // vanished between walk and stat — skip
    }
    const prev = cursor.entries[file];
    const unchanged = !opts.noCursor && isUnchanged(prev, sig);

    const p = parseTranscript(file);
    parsed.push(p);

    nextCursor.entries[file] = {
      path: file,
      size: sig.size,
      mtime: sig.mtime,
      sha256_head: sig.sha256_head,
      last_offset: unchanged && prev ? prev.last_offset : sig.size,
    };
  }

  const rows = deriveAll(parsed, { stallThresholdMs: opts.stallThresholdMs });
  const body = serializeRows(rows);
  fs.writeFileSync(opts.outPath, body, "utf8");

  if (!opts.noCursor) saveCursor(opts.cursorPath, nextCursor);

  process.stdout.write(
    `analyzer: ${files.length} transcripts → ${rows.length} rows → ${opts.outPath}\n`,
  );
}

// Only run as a script, not when imported by the test harness.
if (import.meta.main) {
  main();
}
