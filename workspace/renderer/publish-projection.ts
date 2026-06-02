#!/usr/bin/env bun
/**
 * publish-projection.ts
 * ---------------------
 * Projection snapshot publisher (A3b-5).
 *
 * Reads the local .stack-graph/events.jsonl event log and emits a SANITIZED
 * portal-projection.json keyed by the current git commit SHA.
 *
 * ASSUMED EVENT SCHEMA (documented here because the docs pin the fields but
 * leave a few optional ones implicit):
 *
 *   Every event is a JSON object on a single line (JSONL). Mandatory fields:
 *     ts       — ISO-8601 UTC timestamp  (e.g. "2026-06-02T10:00:00Z")
 *     session  — session identifier string
 *     kind     — "enter" | "exit" | "gate" | "traverse"
 *     node     — node id string  (present on enter/exit/gate; omit on traverse)
 *     carrier  — carrier id string, or null if no carrier is active
 *
 *   Additional fields on "exit" events (from instrumentation-preamble.md):
 *     outcome  — short outcome label string (e.g. "intent-settled")
 *     gates    — array of gate strings (e.g. ["commit-to-build:pass"])
 *
 *   Additional fields on "traverse" events (from 06-analytics README):
 *     from, to — node ids (the edge traversed)
 *     arc      — arc id string, optional
 *
 *   Additional field used for AX data:
 *     ax       — optional object with aggregate metrics; only present on ax-bearing events
 *
 *   NOTE: the docs are silent on a dedicated "stage" field — a carrier's current_stage
 *   is derived as the node id of the latest "enter" event for that carrier. This is
 *   consistent with artefacts-design.md §5 ("current_stage = the latest stage event for
 *   that carrier") and instrumentation-preamble.md ("carrier tagging" section).
 *
 *   SANITIZATION CONTRACT: this script reads only ts, kind, node, carrier, and the ax
 *   aggregate object from each event. It never reads, copies, or echoes:
 *     - outcome strings (may reflect private content)
 *     - gates arrays (may reflect private decision names)
 *     - session ids (private workspace identifiers)
 *     - from/to/arc on traverse events (structural only, not surfaced in the snapshot)
 *     - any free-text fields (e.g. a hypothetical "body", "text", "prompt" field)
 *
 * USAGE:
 *   bun run workspace/renderer/publish-projection.ts [options]
 *
 * OPTIONS:
 *   --events <path>   Path to the events.jsonl file (default: <repo>/.stack-graph/events.jsonl)
 *   --out <path>      Output path (default: workspace/dist/portal-projection.json)
 *   --help            Show this message
 *
 * ENV OVERRIDES:
 *   STACK_GRAPH_EVENTS_DIR   Override the .stack-graph/ directory path
 *   STACK_GRAPH_OUT          Override the output path
 */

import * as fs from "node:fs";
import * as path from "node:path";
import { execSync } from "node:child_process";

const GENERATOR_VERSION = "0.1.0";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function repoRoot(): string {
  // Walk up from __dirname until we find a .git directory.
  let dir = path.dirname(new URL(import.meta.url).pathname);
  while (dir !== path.dirname(dir)) {
    if (fs.existsSync(path.join(dir, ".git"))) return dir;
    dir = path.dirname(dir);
  }
  throw new Error("Could not locate repo root (no .git found above " + path.dirname(new URL(import.meta.url).pathname) + ")");
}

function gitHead(root: string): string {
  try {
    const sha = execSync("git rev-parse HEAD", { cwd: root, encoding: "utf8" }).trim();
    if (/^[0-9a-f]{40}$/i.test(sha)) return sha;
    throw new Error("Unexpected sha format: " + sha);
  } catch (e) {
    throw new Error("Failed to get git HEAD: " + String(e));
  }
}

function parseArgs(): { eventsPath: string | null; outPath: string | null } {
  const args = process.argv.slice(2);
  let eventsPath: string | null = null;
  let outPath: string | null = null;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--events" && args[i + 1]) { eventsPath = args[++i]; }
    else if (args[i] === "--out" && args[i + 1]) { outPath = args[++i]; }
    else if (args[i] === "--help") {
      console.log("Usage: bun run publish-projection.ts [--events <path>] [--out <path>]");
      process.exit(0);
    }
  }
  return { eventsPath, outPath };
}

// ---------------------------------------------------------------------------
// Event types (internal only — never leak into the output)
// ---------------------------------------------------------------------------

interface RawEvent {
  ts: string;
  session?: string;
  kind: string;
  node?: string;
  carrier?: string | null;
  // exit-specific
  outcome?: string;
  gates?: string[];
  // traverse-specific
  from?: string;
  to?: string;
  arc?: string;
  // ax aggregate object (optional)
  ax?: Record<string, unknown>;
  // any other fields must NOT be read — they may contain sensitive content
  [key: string]: unknown;
}

// ---------------------------------------------------------------------------
// Projection types (these are the sanitized output types)
// ---------------------------------------------------------------------------

interface TransitionEntry {
  stage: string;
  at: string;
}

interface CarrierProjection {
  current_stage: string | null;
  transition_summary: TransitionEntry[];
}

interface NodeProjection {
  last_used: string | null;
  traversals_30d: number;
}

interface PortalProjection {
  provenance: {
    commit: string;
    generated_at: string;
    generator_version: string;
  };
  carriers: Record<string, CarrierProjection>;
  nodes: Record<string, NodeProjection>;
  ax: Record<string, Record<string, unknown>>;
}

// ---------------------------------------------------------------------------
// Core logic
// ---------------------------------------------------------------------------

function buildEmptySnapshot(commit: string, generatedAt: string): PortalProjection {
  return {
    provenance: { commit, generated_at: generatedAt, generator_version: GENERATOR_VERSION },
    carriers: {},
    nodes: {},
    ax: {},
  };
}

/**
 * Parse the JSONL event log. Returns an array of raw events; skips malformed
 * lines with a warning.
 */
function parseEventLog(eventsFile: string): RawEvent[] {
  const text = fs.readFileSync(eventsFile, "utf8");
  const lines = text.split("\n").filter((l) => l.trim() !== "");
  const events: RawEvent[] = [];
  for (let i = 0; i < lines.length; i++) {
    try {
      const ev = JSON.parse(lines[i]) as RawEvent;
      events.push(ev);
    } catch {
      console.warn(`  [WARN] Skipped malformed event on line ${i + 1}: ${lines[i].slice(0, 80)}`);
    }
  }
  return events;
}

/**
 * Derive the sanitized projection from raw events.
 *
 * SANITIZATION: we only extract:
 *   - ts (timestamp)
 *   - kind (to filter enter/exit)
 *   - node id
 *   - carrier id
 *   - ax aggregate object (if present — already aggregated, no raw body)
 * Nothing else is read from the event objects.
 */
function deriveProjection(
  events: RawEvent[],
  generatedAt: string,
  commit: string,
  stageOverrides: Record<string, string> = {}
): PortalProjection {
  const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
  const now = new Date(generatedAt).getTime();

  // Per-carrier: ordered stage transitions (from enter events only)
  const carrierTransitions = new Map<string, TransitionEntry[]>();

  // Per-node: last_used ts (as ms for comparison) and traversal timestamps within 30d
  const nodeLastUsedMs = new Map<string, number>();
  const nodeTraversals30d = new Map<string, number>();

  // Per-node: ax aggregates (from exit events if ax field present)
  const axAggregates = new Map<string, Record<string, unknown>>();

  for (const ev of events) {
    // Only process enter and exit events (gate/traverse are not used for projection)
    if (ev.kind !== "enter" && ev.kind !== "exit") continue;

    const nodeId = ev.node;
    const carrierId = ev.carrier && ev.carrier !== "null" ? ev.carrier : null;
    const ts = ev.ts;

    if (!nodeId || !ts) {
      console.warn("  [WARN] Event missing node or ts — skipped.");
      continue;
    }

    // Validate timestamp is parseable
    const tsMs = new Date(ts).getTime();
    if (isNaN(tsMs)) {
      console.warn(`  [WARN] Unparseable timestamp "${ts}" on ${ev.kind} for node ${nodeId} — skipped.`);
      continue;
    }

    if (ev.kind === "enter") {
      // Node tracking
      const prev = nodeLastUsedMs.get(nodeId) ?? -Infinity;
      if (tsMs > prev) nodeLastUsedMs.set(nodeId, tsMs);

      const within30d = now - tsMs <= thirtyDaysMs;
      if (within30d) {
        nodeTraversals30d.set(nodeId, (nodeTraversals30d.get(nodeId) ?? 0) + 1);
      }

      // Carrier stage transition — a carrier's "stage" is the node it entered
      if (carrierId) {
        const list = carrierTransitions.get(carrierId) ?? [];
        list.push({ stage: nodeId, at: ts });
        carrierTransitions.set(carrierId, list);
      }
    }

    if (ev.kind === "exit") {
      // AX aggregates — only if an ax object is present on the exit event
      if (ev.ax && typeof ev.ax === "object" && !Array.isArray(ev.ax)) {
        // Merge: later events overwrite earlier for same node
        const existing = axAggregates.get(nodeId) ?? {};
        axAggregates.set(nodeId, { ...existing, ...ev.ax });
      }
    }
  }

  // Build carriers output
  const carriers: Record<string, CarrierProjection> = {};
  for (const [carrierId, transitions] of carrierTransitions) {
    // current_stage: honor stage_override if present; otherwise latest enter
    let current_stage: string | null = transitions.length > 0
      ? transitions[transitions.length - 1].stage
      : null;
    if (stageOverrides[carrierId]) {
      current_stage = stageOverrides[carrierId];
    }
    carriers[carrierId] = {
      current_stage,
      transition_summary: transitions,
    };
  }

  // Build nodes output
  const nodes: Record<string, NodeProjection> = {};
  const allNodes = new Set([...nodeLastUsedMs.keys(), ...nodeTraversals30d.keys()]);
  for (const nodeId of allNodes) {
    const lastUsedMs = nodeLastUsedMs.get(nodeId);
    const last_used = lastUsedMs !== undefined
      ? new Date(lastUsedMs).toISOString()
      : null;
    nodes[nodeId] = {
      last_used,
      traversals_30d: nodeTraversals30d.get(nodeId) ?? 0,
    };
  }

  // Build ax output
  const ax: Record<string, Record<string, unknown>> = {};
  for (const [nodeId, agg] of axAggregates) {
    ax[nodeId] = agg;
  }

  return {
    provenance: {
      commit,
      generated_at: generatedAt,
      generator_version: GENERATOR_VERSION,
    },
    carriers,
    nodes,
    ax,
  };
}

// ---------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------

async function main() {
  const { eventsPath: argEvents, outPath: argOut } = parseArgs();

  const root = repoRoot();
  const commit = gitHead(root);
  const generatedAt = new Date().toISOString();

  // Resolve events path
  const eventsDir = process.env["STACK_GRAPH_EVENTS_DIR"] ?? path.join(root, ".stack-graph");
  const eventsFile = argEvents ?? path.join(eventsDir, "events.jsonl");

  // Resolve output path
  const defaultOut = path.join(root, "workspace", "dist", "portal-projection.json");
  const outFile = argOut ?? process.env["STACK_GRAPH_OUT"] ?? defaultOut;

  console.log("publish-projection  v" + GENERATOR_VERSION);
  console.log("  commit     :", commit);
  console.log("  generated  :", generatedAt);
  console.log("  events     :", eventsFile);
  console.log("  output     :", outFile);
  console.log("");

  let snapshot: PortalProjection;

  if (!fs.existsSync(eventsFile)) {
    console.log("  [INFO] Event log not found — emitting empty snapshot.");
    console.log("         Path checked:", eventsFile);
    snapshot = buildEmptySnapshot(commit, generatedAt);
  } else {
    const events = parseEventLog(eventsFile);
    if (events.length === 0) {
      console.log("  [INFO] Event log exists but contains no valid events — emitting empty snapshot.");
      snapshot = buildEmptySnapshot(commit, generatedAt);
    } else {
      console.log("  [INFO] Processing", events.length, "events...");
      snapshot = deriveProjection(events, generatedAt, commit);
      console.log("  [INFO] Carriers found   :", Object.keys(snapshot.carriers).length);
      console.log("  [INFO] Nodes found      :", Object.keys(snapshot.nodes).length);
      console.log("  [INFO] AX nodes found   :", Object.keys(snapshot.ax).length);
    }
  }

  // Ensure output directory exists
  const outDir = path.dirname(outFile);
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  fs.writeFileSync(outFile, JSON.stringify(snapshot, null, 2) + "\n", "utf8");
  console.log("\n  [OK] Written:", outFile);
}

main().catch((err) => {
  console.error("[FATAL]", err);
  process.exit(1);
});
