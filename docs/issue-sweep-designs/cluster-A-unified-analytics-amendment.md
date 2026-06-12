# Spec amendment proposal — unified transcript-derived analytics (cluster A)

Companion to `cluster-A-unified-analytics.md`. Concrete edits to `06-analytics/README.md` and
`graph/_refs/instrumentation-preamble.md` (and the `bindings-contract` delta). **Proposal only —
no edits applied.** These land in IU-A6.

---

## 1. `handbook/content/06-analytics/README.md`

### 1.1 Replace "Two event sources" with "One deterministic source — the transcript analyzer"

The current page frames analytics as **two sources** (the transcript baseline + a graph hook/preamble
layer). The amendment collapses this to **one**: a scheduled batch analyzer that derives the entire
substrate from the raw transcripts. Replace the *Two event sources* table and the *How a node emits
events* section with:

> ## One deterministic source — the transcript analyzer
>
> stack-graph derives its entire analytics substrate from **one source**: the raw Claude Code session
> transcripts (`~/.claude/projects/**/*.jsonl`, `SG_TRANSCRIPT_ROOT`). A **scheduled batch analyzer**
> (`workspace/renderer/analyzer/`, cron ~1–2×/day on the harness machine) reads those transcripts and
> writes a deterministic derived event log into `.stack-graph/`. **No event originates from a hook.**
> The substrate is **two honest layers** (§1.5): a deterministic transcript-mechanical layer (tokens,
> friction, stalls, node-activity, attribution — pure functions of the bytes) **plus** a small,
> explicitly-separated, allowlist-gated **model-authored verdict layer** (the experience-contract
> verdict + trend numbers, written in a node's `<sg-signal>` output, read and under-captured — never
> invented). The analyzer fully **rewrites** the log each run (one writer; no append-only semantics).
>
> | Derived series | Transcript source | Gives |
> |---|---|---|
> | **tokens / cache / cost** | `message.usage` on assistant entries (the `transcript-usage` core) | per-IU / per-session / per-dispatch `token_usage` (6-component, cache split) |
> | **friction** | `tool_result` denials/errors/rejections + `permissionDecision`/`Reason`/`Mode` | per-session denial / rejection / error / permission-decision counts |
> | **stalls** | cross-session `timestamp` gaps | between-sessions stall spans (incl. overnight gate stalls) |
> | **node activity** | `Skill`/slash/`Task` invocations + coalesced `attributionSkill` | node enter/exit/duration spans, carrier-attributed |
> | **attribution** | the dispatched-session's first user message (the dispatch-prompt envelope) | the `(carrier, carrier_kind, arc)` each derived row is keyed to |
>
> The analyzer is **idempotent** (a per-transcript cursor; re-running over the same transcripts is
> byte-stable) and **local** (runs only where the transcripts exist; nothing is shipped — the Locality
> invariant holds by construction).

### 1.2 Retire the hook event-kind section

Delete **"Hook-captured token-usage events (D69)"** in full. The three kinds (`unit-usage`,
`session-usage`, `dispatch-usage`) **survive as analyzer-derived rows** with the **same schema** — so
replace the paragraph's framing ("Token cost rides three hook-appended event kinds") with:

> ### Token-usage rows (analyzer-derived)
> Token cost is derived by the analyzer from `message.usage` and emitted as three rows —
> `unit-usage` (an IU), `session-usage` (a session), `dispatch-usage` (a carrier) — each carrying the
> closed 6-component `token_usage` block (`input`, `output`, `cache_creation_5m`, `cache_creation_1h`,
> `cache_read`, `total`) and a dominant `model`. The cache split is load-bearing (priced at real
> multipliers). `cumulative` is always `false` — the batch reads settled transcripts, so there is one
> row per scope. The publisher's closed `USAGE_COMPONENT_KEYS` allowlist and the **fabrication guard**
> (rejecting any model-authored token key on a structural row) remain the enforced boundary.

### 1.3 Amend "How a node emits events" → "How events are derived"

Replace the preamble/hook emitter description with: nodes emit **nothing** to the event log; the
analyzer derives node activity (enter/exit/duration) from the transcript's Skill/slash/Task spans.
The **only** model-authored input is a node's **structured result block** (a fenced `<sg-signal>` JSON
in the node's final message) carrying its experience-contract verdict or trend number — read
deterministically, allowlist-gated, never invented. State explicitly: *no node appends to the event
log; the event log has exactly one writer, the analyzer.*

**Specify the `<sg-signal>` parse contract** (mirrors design §7.1) so the spec is precise about what
"read deterministically" means:

> The analyzer reads the `<sg-signal>` block from the **final result message of the verdict-emitting
> node's own transcript** — and for a **dispatched** node, the **subagent transcript's** final message
> (`<session>/subagents/agent-*.jsonl`), not the parent's. The fence wraps a single JSON object with
> optional `gates: string[]` and `metrics: { <series>: number }`; `gates[]` is validated against the
> experience-contract allowlist and `metrics` keys against the publisher's `TREND_SERIES` (values must
> be finite numbers). **Absent or malformed ⇒ the gate/metric is simply not recorded** (honest
> under-capture). There is **no conformance guarantee** a verdict-bearing node emitted a block; a
> future conformance probe could check that verdict-bearing nodes emit one (noted, not built).

### 1.4 Add the process/friction + stall layer to the shape table

Add `friction-record` and `stall-record` to the event-shape coverage (schemas in the design §3.2/3.3),
and add the **"Process cost"** axis to *The rendered analytics surface* (the fourth axis alongside
Node-activity/AX, Metric-trends, Conformance, Cost): denial/rejection/error counts, the
permission-decision breakdown, total + longest stall, gate-tagged stalls — all from the analyzer,
nothing model-emitted.

### 1.5 Restate the invariant — HONESTLY, as two layers

Rewrite the opening invariant ("Instrumentation is deterministic — a timeline scanned from real
events; model judgment is reserved for interpreting that timeline, never for producing it"). The new
text must **not** overclaim "no model judgment produces a datum" — that is false, because the
experience-contract verdict and the trend numbers ARE model-authored. State the two layers plainly:

> Instrumentation is **transcript-derived and runs in two explicitly-separated layers**:
>
> 1. a **deterministic transcript-mechanical layer** — tokens, friction, stalls, node-activity, and
>    attribution, each a **pure function of the transcript bytes** a scheduled batch analyzer scans
>    (idempotent, re-runnable, local); **no datum here originates from a hook or from model judgment**;
> 2. a **small, explicitly-separated, allowlist-gated model-authored verdict layer** — the
>    **experience-contract pass/fail verdict** and the **trend numbers** (`benchmark.perf`,
>    `health.quality`). These are **irreducibly model judgments**: a node writes them **in its own
>    output** (a fenced `<sg-signal>` block in its final result message), **not** appended to any event
>    log and **not** from a side-channel. The analyzer **reads** that block and **honestly
>    under-captures** it — absent ⇒ **not recorded**, never invented. The allowlist gates the
>    **key/shape** of the datum, **not the truth of the value**: a model-authored number is exactly as
>    trustworthy as the model that wrote it.
>
> Model judgment is reserved for *interpreting* the timeline (the improvement loop) and for the
> bounded layer-2 verdicts above — never for fabricating a layer-1 mechanical datum.

### 1.6 Carrier-state projection + Stream namespacing

The carrier-state projection (current_stage from the latest stage event matching the
`(carrier_id, carrier_kind, arc)` triple) is **unchanged in semantics** — but the stage events are now
**analyzer-derived from node-activity spans + dispatch-prompt attribution** rather than
preamble-emitted. Update the prose to say the projection reads the analyzer's derived enter/exit
rows. The three streams (product-outcomes / factory-conformance / carrier-projection) stay; the
per-IU and per-session **cost** rows are analyzer-derived (drop the "hook-captured" wording
throughout, replace with "analyzer-derived").

---

## 2. `graph/_refs/instrumentation-preamble.md`

**Retire as a runtime emit contract.** The preamble currently instructs every backbone node to append
`node-enter` / `node-exit` / `metrics` events. Under the analyzer model, node bodies emit nothing, so:

- **Remove** the *On entry* / *On exit* / *Appending to the event log* / *Carrier tagging* /
  *Method note* sections — node bodies no longer append events.
- **Remove** the `load: import` `references` edge to `instrumentation-preamble` from every backbone
  node (the analyzer replaces what the preamble did).
- **Keep, relocated** into a new thin **`graph/_refs/analytics-vocabulary.md`** (`kind: reference`):
  the surviving model-authored vocabulary — the canonical **outcome labels**, the **gate token**
  `experience-contract:<pass|fail>`, and the **trend series names** (`benchmark.perf`,
  `health.quality`) — plus the **`<sg-signal>` result-block format** a node emits its verdict/number
  in. The relevant nodes (`simulate-users`, `benchmark`, `health`, `review`) carry an on-demand
  reference to it so they emit the canonical strings in their *output*; no node appends events.
- The "Token usage is HOOK-appended — never emit token numbers" section's **prohibition survives**
  (a node still must never author token numbers), restated as: *the analyzer derives all token cost
  from the transcript; a node emits no token numbers in any form.* The do-NOT-emit list and the
  publisher's fabrication guard stay.
- Bump status to a fresh major reflecting the retirement (`v1.0.0 — analyzer-derived`), or, if the
  file is deleted outright, leave a one-line tombstone pointing at `analytics-vocabulary` +
  `06-analytics` so old references resolve.

---

## 3. `graph/_refs/bindings-contract.md`

- **§2 key set.** `event-log` now points at the analyzer's **output**, and its filename is **migrated
  to `.stack-graph/derived/analyzer-events.jsonl`** (S6 — a named migration step also touching the
  publisher's three resolution paths: the `:872` default, `--events`, `STACK_GRAPH_EVENTS_DIR`).
  Restate its note (it was "the carrier-tagged event stream the hooks + preamble append to"; now "the
  deterministic derived stream the analyzer writes and the publisher reads — one writer, full rewrite
  each run"). `pricing`/`SG_PRICING` unchanged.
- **§6 (token-instrumentation env).** Replace the hook-activation table. **Remove**
  `SG_TOKEN_EVENT_KIND` and the per-scope dispatch env (`SG_IU_ID`/`SG_SCOPE_ID`/`SG_CARRIER_ID`/
  `SG_CARRIER_KIND`/`SG_ARC`). **Add** `SG_TRANSCRIPT_ROOT` (the analyzer's input; default
  `~/.claude/projects`; an env var, **not a binding key** — no graph node resolves it). Keep
  `SG_EVENT_LOG` (now the analyzer's output path, pointing at `derived/analyzer-events.jsonl`) and
  `SG_PRICING`. Add a sentence: *the live-hook probe is replaced by an analyzer dry-run probe in
  `harness-init validate`.*
- Add the **scheduled-task** note: `harness-init scaffold` **emits the exact analyze→publish command
  plus a short install runbook** for the operator (it does **not** write a crontab itself —
  harness-local-writes-only, B4), or registers the job via the runtime's `mcp__scheduled-tasks__*`
  surface where the harness schedules that way (a build-time choice); default cadence twice daily.
  `harness-init validate` **confirms (read-only)** the task is registered. **No language about
  `harness-init` writing crontab lines.**

---

## 4. Net invariant after the amendment

> **One source, two honest layers, batch, idempotent, local.** The analyzer reads the raw transcripts
> and derives **layer 1** — tokens, friction, stalls, node-activity, attribution — as **pure functions
> of the transcript bytes** (no hook, no model judgment), and reads **layer 2** — the
> experience-contract verdict and trend numbers — from a node's own fenced `<sg-signal>` result block,
> **allowlist-gated by shape and honestly under-captured** (absent ⇒ not recorded, never invented; the
> allowlist gates the key/shape, not the truth of the value). It **fully rewrites** one derived event
> log each run (one writer; no append-only semantics), in canonical sorted order, so a re-run with no
> new activity is byte-identical. **Locality:** the analyzer runs only where the transcripts exist;
> **only `portal-projection.json` ever leaves the machine** — `analyzer-events.jsonl` and the whole
> `.stack-graph/derived/` tree are **local-only, gitignored, never synced**; the publisher's closed
> allowlists are the projection boundary. The matched deny-rule remains an upstream Claude Code gap,
> forward-declared and rendered the day the transcript surfaces it.
