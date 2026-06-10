---
kind: reference
id: instrumentation-preamble
title: Instrumentation preamble — node enter/exit emit contract
description: "The deterministic enter/exit emit contract every backbone node depends on. On entry, record a node-enter event; on exit, a node-exit event carrying the outcome, any gates touched, and optional ax / trend-metrics aggregates. Carrier-tagged when a carrier is in context. Events append as JSONL to the .stack-graph/ event log in the workspace. Single-sourced into every consumer at build via @-import (load: import). Token aggregates are HOOK-appended (D69), never body-emitted — the body owns structural facts, the hooks own cost; an explicit do-NOT-emit list bars tokens_per_iu / tokens_per_session / token_usage. note and review-fix are recognised structural kinds."
status: v0.4.0 — 2026-06-10
---

# Instrumentation preamble

This is the shared emit contract every node imports. It governs how a node records its
lifecycle to the event log. The contract is deterministic — it is not a judgment call.

## On entry

At the start of your run, emit a `node-enter` event. Append it as a single JSON line to
`.stack-graph/events.jsonl` in the workspace (create the file and the `.stack-graph/`
directory if absent).

```json
{ "ts": "<ISO-8601 timestamp>", "session": "<session-id>", "kind": "enter",
  "node": "<your-node-id>", "carrier": "<carrier-id-or-null>",
  "carrier_kind": "<carrier-kind-or-null>", "arc": "<arc-id-or-null>" }
```

- `ts` — the current UTC timestamp in ISO-8601 format (`YYYY-MM-DDTHH:MM:SSZ`).
- `session` — the active session identifier (use the value available from the harness
  environment; fall back to a generated short id if absent).
- `kind` — literal `"enter"`.
- `node` — your node's `id` frontmatter value.
- `carrier` — the carrier id if a carrier is in context (the work item this traversal
  serves); `null` if no carrier is active. Do not invent a carrier id; if there is no
  carrier binding in scope, emit `null`.
- `carrier_kind` — the carrier's kind (`work-item` / `standalone-iu`); `null` when
  `carrier` is `null`. Lets the projection key by (id, kind, arc) without re-reading the
  carrier file.
- `arc` — the arc this traversal belongs to (the `composes-into` arc id, e.g.
  `dev-sprint` / `incremental`); `null` if no arc is in context. The third element of the
  projection key, so a node shared by two arcs never bleeds stage between them.

Emit this event before reading the carrier or performing any phase work.

## On exit

At the end of your run — after all phases complete, before you return control — emit a
`node-exit` event:

```json
{ "ts": "<ISO-8601 timestamp>", "session": "<session-id>", "kind": "exit",
  "node": "<your-node-id>", "carrier": "<carrier-id-or-null>",
  "carrier_kind": "<carrier-kind-or-null>", "arc": "<arc-id-or-null>",
  "outcome": "<outcome-string>", "gates": ["<gate-name>:<pass|fail>", ...],
  "metrics": { "<series-name>": <number>, ... } }
```

- `ts`, `session`, `node`, `carrier`, `carrier_kind`, `arc` — same as the enter event.
- `kind` — literal `"exit"`.
- `outcome` — a short string describing the result of this node's run. Use one of the
  canonical outcome labels the node's goals name (e.g. `"intent-settled"`,
  `"design-doc-produced"`, `"plan-approved"`, `"change-landed"`) or `"aborted"` if the
  run did not complete. Choose the label that best matches the actual result; do not
  invent new labels beyond what the node's goals define.
- `gates` — an array of gate records for every explicit gate this run touched. Each entry
  is `"<gate-name>:<pass|fail>"` — e.g. `"commit-to-build:pass"` or
  `"live-confirmed:fail"`. Emit an empty array `[]` if no gates were explicitly checked.
- `metrics` — **optional**. An object of named scalar **trend measurements** this run
  produced, each a finite number, keyed by a canonical series name (e.g.
  `{ "benchmark.perf": 2310 }` from `benchmark`, `{ "health.quality": 8.6 }` from `health`).
  Omit the field entirely when the node produces no trend measurement. Only nodes whose goals
  name a trend series emit this; the analytics layer projects each series across runs as a
  *metric-trend*. The projection publisher reads `metrics` by a **closed series allowlist**
  with a finite-number guard and never copies the object verbatim — an unknown series name or
  a non-numeric value is dropped (the same sanitisation discipline as the `ax` aggregate).

Note on `ax`: an experience-verification node (`simulate-users`) also attaches an optional
`ax` aggregate object on its exit event — its allowlisted numeric agent-experience metrics
(see that node's *Instrumentation* section). Like `metrics`, `ax` is read by a closed numeric
allowlist, never spread verbatim. `metrics` carries **trend measurements**; `ax` carries the
**per-run agent-experience profile**. Both are optional and only the nodes whose goals name
them emit them.

## Token usage is HOOK-appended — never emit token numbers from a node body (D69)

Token cost is captured **deterministically by the plugin's hooks** (`PostToolUse` native usage /
`SubagentStop` + `Stop` transcript sums — see `06-analytics`), which append their **own** usage
events (`unit-usage` / `session-usage` / `dispatch-usage`, each carrying a 6-component
`token_usage` block). A node body **cannot** observe its own token cost accurately — it cannot see
cache reads, which dominate spend — so a body-emitted figure is fabrication. **The historic ~25×
cost error came from exactly this.**

**Do NOT emit, from any node body, any of:**

- `tokens_per_iu`
- `tokens_per_session`
- `token_usage` (or any `tokens_*` aggregate) on a `metrics` object

The projection publisher **rejects** these keys if they appear on a model-authored event (a
fabrication guard), so emitting them is wasted and flagged. **Structural facts stay body-owned;
cost is hook-owned.** Your body emits the structural `unit-complete` / `dispatch-complete` (the IU
id, the carrier, the **acceptance evidence** — which only the body knows) **without token fields**;
the hook joins its usage event by scope id.

## Recognised event kinds — `note` and `review-fix`

Two further structural kinds are **recognised** (a consumer may emit them; the projection ignores
unknown kinds, so they are recorded but **not projected** into a surface today — no fictitious
routing):

- **`review-fix`** — emit on a **review-gate-fail re-entry**: when a `review` finding sends work
  back to `build`/`reconcile`, emit a `review-fix` event tagged with the source node and the IU it
  re-enters, so the loop re-entry is on the record. Shape: a structural event (`kind: "review-fix"`,
  the node, carrier triple, the IU) — no token fields.
- **`note`** — **operator-discretion**: a free structural marker a node may append to record a
  decision point or context worth keeping in the timeline. Emit it only when it earns its place;
  it is recognised-but-not-projected (the publisher ignores it), so it never invents a surface — it
  is a durable breadcrumb in the log, nothing more.

Emit this event after all phase work is done and any final operator output has been
delivered. Never emit a node-exit before the work is complete.

## Appending to the event log

Events are JSONL — one JSON object per line, newline-terminated. The log path is always
`.stack-graph/events.jsonl` relative to the workspace root.

- If the file does not exist, create it (and the `.stack-graph/` directory if needed).
- Append — never overwrite the log. Each run of a node adds two lines: one enter, one exit.
- The log is ephemeral: it is gitignored in the factory and in consuming workspaces.
  Its content is the event substrate; the permanent record is the frozen traversal
  snapshot in the closed carrier file (see `06-analytics`).

## Carrier tagging

When a carrier is in context, every event is tagged with the carrier id, its kind, and the
arc. This makes the carrier's stage-position a derived projection from the event log — the
analytics layer reads the latest stage event matching the **(carrier id, carrier kind, arc)**
triple to compute `current_stage`. Keying by carrier id alone would let one carrier's stage
bleed between arcs at a node shared by two arcs (see `carrier-interface`); the kind + arc in
the tag keep each arc's projection separate. Do not write `current_stage` to the carrier file;
let the projection compute it from these events.

If no carrier is in context (a standalone invocation, a factory-loop traversal, or any
run that does not serve a specific work item), emit `"carrier": null` (and `carrier_kind`/`arc`
`null`). The event is still valid and is counted in factory conformance metrics; it simply
does not contribute to any carrier's stage projection.

## Method note

This contract is method-agnostic: it does not prescribe how you append to the file
(a tool call, a script, an inline write). Use whatever append method is available in
your execution context. The contract governs the content and the timing, not the
mechanism.
