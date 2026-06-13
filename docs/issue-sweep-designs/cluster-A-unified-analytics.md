# Cluster A — unified, transcript-derived analytics (#28, SUPERSEDES #21)

**Issues:** [#28](https://github.com/hk121992/stack-graph/issues/28) (friction & stall
telemetry) — re-scoped; **supersedes** [#21](https://github.com/hk121992/stack-graph/issues/21)
(hook-captured token cost). **Status:** DESIGN, for eng-review. **Replaces** the prior
`cluster-A-friction-telemetry.md` (the A1–A4 hook-stacking design) wholesale.

> **The settled decision (operator, not re-litigated here).** Replace **all** inline/hook-based
> analytics emission with **one deterministic, scheduled batch analyzer** (cron, ~1–2×/day) that
> reads the raw session transcripts and derives the entire analytics substrate. **No hooks, no
> model-emitted events, anywhere.** PR #25 (the #21 hook implementation) will **not** merge; its
> transcript-usage parsing **core is reused** by the analyzer. The friction layer (#28) is unified
> into the same analyzer rather than layered on #21's hook tree.

## Spec touchpoints

| Spec doc | Section | Relationship |
|---|---|---|
| `handbook/content/06-analytics/README.md` | "Two event sources", "How a node emits events", "Hook-captured token-usage events (D69)", "Event shape", "The rendered analytics surface", "Per-IU cost", "Per-session cost", "Stream namespacing", "Locality" | **Amend (major).** Replace the two-source (transcript baseline + graph hook/preamble) model with a **single deterministic source: the transcript analyzer**. Retire the three hook event kinds (`unit-usage`/`session-usage`/`dispatch-usage`) and the in-node preamble-emitted enter/exit as the *runtime* substrate; they become **analyzer-derived rows** instead. Add friction, stalls, node-activity, attribution as derived series. Restate the invariant **honestly as two layers** — a deterministic transcript-mechanical layer (a pure function of transcript bytes) **plus** a small, explicitly-separated, allowlist-gated model-authored verdict layer (the experience-contract verdict + trend numbers, written in a node's `<sg-signal>` output and read/under-captured, never invented). (Full text in `cluster-A-unified-analytics-amendment.md`.) |
| `graph/_refs/instrumentation-preamble.md` | whole file | **Retire as a runtime emit contract.** The preamble's job — telling each node body to append `node-enter`/`node-exit`/`metrics` — is **removed**: the analyzer derives node activity from the transcript, so node bodies emit nothing. The `load: import` edges from every backbone node are dropped. What survives: the **outcome-label vocabulary** and the **gate-token vocabulary** (`experience-contract:<pass\|fail>`, trend-series names) move to a thin **`analytics-vocabulary` reference** the analyzer reads, because those few signals are still model-authored *judgments* the analyzer cannot derive (see §7, Residual). (Amendment doc.) |
| `graph/_refs/bindings-contract.md` | §2 key set, §6 token-instrumentation env | **Amend.** Remove the hook-activation env (`SG_TOKEN_EVENT_KIND`, `SG_IU_ID`/`SG_SCOPE_ID`/`SG_CARRIER_*`/`SG_ARC` per-scope dispatch env). Add **`SG_TRANSCRIPT_ROOT`** as the analyzer's input env (default `~/.claude/projects`) — **an env var, not a new binding key** (operator preference; see §6 for the earns-a-binding test). Keep `event-log` (now the analyzer's *output*, not a hook append target) and **migrate its filename to `derived/analyzer-events.jsonl`** across the binding + the three publisher resolution paths (S6); `pricing`/`SG_PRICING` unchanged. `harness-init scaffold` **emits the scheduled-task install runbook** (it cannot write a crontab — harness-local-writes-only, B4), or registers via `mcp__scheduled-tasks__*`; `validate` confirms read-only. |

---

## 1. Architecture

```
                          HARNESS MACHINE (where transcripts live)
  ┌──────────────────────────────────────────────────────────────────────────────┐
  │  ~/.claude/projects/**/*.jsonl   (raw transcripts; SG_TRANSCRIPT_ROOT)         │
  │  ~/.claude/projects/**/subagents/*.jsonl  (dispatched-session transcripts)     │
  │            │                                                                   │
  │            │  read-only, batch, ~1–2×/day (cron / scheduled-task)              │
  │            ▼                                                                   │
  │   ┌─────────────────────────────────────────────┐                             │
  │   │  THE ANALYZER  (workspace/renderer/analyzer/)│                             │
  │   │  • reuses lib/transcript-usage.ts (token core)│                            │
  │   │  • derives tokens · friction · stalls ·       │                            │
  │   │    node-activity · attribution                │                            │
  │   │  • cursor/cache → incremental, idempotent     │                            │
  │   └─────────────────────────────────────────────┘                             │
  │            │  writes deterministic JSONL into .stack-graph/                    │
  │            ▼                                                                   │
  │   <org-root>/.stack-graph/derived/                                            │
  │     analyzer-events.jsonl     (the derived event stream — the new event-log)  │
  │     analyzer-cursor.json      (per-transcript offset+mtime+hash; the cache)   │
  │            │                                                                   │
  │            ▼                                                                   │
  │   publish-projection.ts  →  portal-projection.json  →  build-analytics.ts     │
  │   (UNCHANGED contract: reads events.jsonl; analyzer writes that file)         │
  └──────────────────────────────────────────────────────────────────────────────┘
```

**Where it runs.** On the **harness machine** — the only place the raw transcripts exist
(`~/.claude/projects/**`). It is a local batch job; nothing leaves the workspace (the Locality
invariant holds by construction — the analyzer reads local transcripts and writes a local log).

**Where it lives in the tree.** `workspace/renderer/analyzer/` (general, vendored). It sits next
to the publisher and the `lib/transcript-usage.ts` core it reuses; `build/vendor.ts` already
preserves `workspace/renderer/` into the plugin, so the analyzer vendors with the renderer with
**no new vendor wiring**. Proposed layout:

```
workspace/renderer/analyzer/
  analyze.ts            # entry: read SG_TRANSCRIPT_ROOT, walk, derive, full-rewrite, advance cursor
  derive-tokens.ts      # wraps lib/transcript-usage.ts → unit/session/dispatch usage rows
  derive-friction.ts    # permission denials, tool errors, rejected calls, permissionDecision*
  derive-stalls.ts      # cross-session timestamp-gap derivation
  derive-activity.ts    # Skill/slash/Task spans → node enter/exit/duration
  attribute.ts          # dispatch-prompt parsing + session-level fallback
  cursor.ts             # the per-transcript incremental cursor (idempotency)
  analyze.test.ts
```

It reuses `lib/transcript-usage.ts` (`sumUsage`, `usageFromObject`, `UsageComponents`) verbatim —
that core is the one thing preserved from #21 (§5).

**Why not a session-end hook.** Operator decision: a hook fires per-session, is skipped under load,
runs in arbitrary cwd, and re-introduces the model-discretionary failure mode #28 documented (15%
foreign-schema, fabricated timestamps, 1 gate event for a 14h stall). A **scheduled batch over the
durable transcripts** is deterministic, re-runnable, and observes the *whole* record including
stalls (which a per-session hook structurally cannot see — a gap *between* sessions has no session
to fire in). The transcript is the source of truth Claude Code already writes; the analyzer is a
pure read-derive-append over it.

**Config — `SG_TRANSCRIPT_ROOT` (env, not a binding).** The analyzer's one input is the transcript
root. Default `~/.claude/projects`; overridable via `SG_TRANSCRIPT_ROOT`. It is **harness-local
machine config**, not a graph surface a node resolves — so it is an **env var**, matching the
operator preference. The earns-a-binding test (§6): a binding key earns its place when a *graph
node* must resolve it; no node reads the transcript root — only the out-of-band analyzer does — so
it stays env. (If a future node ever needs it, promote then.)

**`.stack-graph/` outputs.** The analyzer writes a single derived event stream the publisher
already knows how to read:

- **`.stack-graph/derived/analyzer-events.jsonl`** — the derived event log. Same JSONL line shapes
  the publisher's `USAGE_KINDS` / enter-exit / conformance paths consume (§4 schemas), so the
  publisher is **near-unchanged**. The `event-log` binding now points at *this* file (it was the
  hook/preamble append target; now it is the analyzer's output). **One writer (the analyzer) that
  fully REWRITES the file each run** (§9 idempotency) — there is no concurrent-append problem and the
  old `<4KB` atomic-append discipline is **moot and dropped** (it existed for many concurrent
  appending writers; there are none). This file is **local-only — it never leaves the machine**
  (§9 locality); only `portal-projection.json` is ever synced.
- **`.stack-graph/derived/analyzer-cursor.json`** — the incremental cursor (per-transcript
  `{path, size, mtime, sha256_head, last_offset}`), so a re-run only processes new/changed
  transcripts and the output is **stable across re-runs** (§9 idempotency).

**The event-log filename — pinned (S6).** The publisher's default is **`events.jsonl`**
(`publish-projection.ts:872`), resolved via `STACK_GRAPH_EVENTS_DIR` / `--events` / the binding
(`:871-872`). The settled decision: **the analyzer writes
`.stack-graph/derived/analyzer-events.jsonl`, and the `event-log` binding plus all three publisher
resolution paths are migrated to that filename** — a **named migration step in A6c** (update the
default at `:872`, the binding note in `bindings-contract` §2, and the `harness-init` `SG_EVENT_LOG`
scaffold value to the `derived/analyzer-events.jsonl` path). This keeps the derived stream under
`derived/` (clearly the analyzer's output, gitignored) and is unambiguous: there is exactly one
filename after A6c.

**How `publish-projection.ts` consumes it.** Unchanged contract. It reads its events file (now
`.stack-graph/derived/analyzer-events.jsonl` via the migrated `event-log` binding / `--events` flag /
`STACK_GRAPH_EVENTS_DIR` default), applies the same closed allowlists (`USAGE_COMPONENT_KEYS`, `AX_NUMERIC_KEYS`, `TREND_SERIES`,
`ID_RE`, `ISO_UTC_RE`, `MODEL_RE`, session-anonymisation), and emits `portal-projection.json`.
**The analyzer's rows are produced to satisfy those allowlists** — the publisher's sanitisation
boundary is preserved as the second line of defence (the analyzer is deterministic, but the
publisher still validates, so a bug in either is caught). Friction/stall rows need a small additive
read path (§4.2/§4.3); tokens/node-activity/attribution feed the existing paths with **no publisher
change** beyond dropping the version-gate's reliance on a per-event hook `v` (the analyzer stamps
its own `v`).

**Scheduling (harness-local).** The analyzer runs as a **scheduled task** the operator installs.
The job is `analyze → publish` chained:
`0 6,18 * * * cd <org-root> && SG_TRANSCRIPT_ROOT=… bun run <plugin>/workspace/renderer/analyzer/analyze.ts && bun run <plugin>/workspace/renderer/publish-projection.ts`.

`harness-init scaffold` gains a step (5c, §6) that **emits the exact command + a short runbook** for
the operator to install the cron entry (the privileged step — `harness-init` cannot write a crontab,
it is harness-local-writes-only), **or** registers via the runtime's `mcp__scheduled-tasks__*` surface
where the harness schedules that way (a build-time choice). `harness-init validate` **confirms (read
only)** the task is registered. The schedule cadence is a harness dial (default twice daily). This is
the one piece of genuinely new harness wiring; everything else is config.

---

## 2. Why this is sound — the determinism contract (two honest layers)

The substrate is **two explicitly-separated layers**, and the invariant is stated honestly — it is
**not** "no model judgment produces a datum":

1. **The deterministic transcript-mechanical layer** (tokens, friction, stalls, node-activity,
   attribution — §3.1–§3.5). Every series here is a **pure function of the transcript bytes**: same
   transcripts in ⇒ byte-stable rows out. No model judgment is involved; the cursor makes re-runs
   idempotent (§9).
2. **A small, allowlist-gated, model-authored verdict layer** (§7) — the **experience-contract
   pass/fail verdict** and the **trend numbers** (`benchmark.perf`, `health.quality`). These are
   **irreducibly model judgments**: a pass/fail or a measured number the analyzer cannot derive from
   bytes. The node writes them **in its own output** — a fenced `<sg-signal>` block in its final
   result message — **not** appended to any event log and **not** from a side-channel. The analyzer
   **reads** that block from the transcript and **honestly under-captures** it: a value that is absent
   is **not recorded** (never invented). The allowlist gates the **key/shape** of the datum
   (`experience-contract:<pass|fail>`, a `TREND_SERIES` name, a finite number) — **not the truth of
   the value**: a model-authored number is exactly as trustworthy as the model that wrote it.

The publisher's sanitisation allowlists remain the locality boundary for both layers. The cron is
deterministic and the cursor makes re-runs idempotent (§9). The honest claim is therefore: **layer 1
is mechanical and unfakeable; layer 2 is a clearly-bounded model-authored channel the analyzer reads
verbatim, gates by shape, and under-captures rather than fabricates.**

---

## 3. Derived series — source · derivation · output

Verified transcript facts (confirmed by reading real logs under
`~/.claude/projects/-home-gstack-projects-stack-graph/`):
- assistant entries carry `message.usage` (`input_tokens`, `output_tokens`,
  `cache_read_input_tokens`, `cache_creation.{ephemeral_5m,ephemeral_1h}_input_tokens`).
- every entry carries `timestamp` (ISO-8601), `sessionId`, `cwd`, `gitBranch`, `slug`, `uuid`,
  `parentUuid`, `isSidechain`.
- `attributionSkill` names the active skill on entries (toggles per-message, not a clean span —
  must be **coalesced**, §3.4).
- `permissionMode` appears on entries (e.g. `"auto"`). `permissionDecision` /
  `permissionDecisionReason` appear where the classifier/hook left a structured decision (extract;
  degrade where absent).
- a tool denial is a `tool_result` with `is_error:true` and content `"… has been denied."`
  (hard settings rule — carries the **command**, not the rule name) **or** the user-rejection form
  `"The user doesn't want to proceed with this tool use…"`.
- subagent transcripts live at `<session>/subagents/agent-*.jsonl`; the **first user message** of a
  dispatched-session transcript is the **dispatch prompt** (the attribution source, §3.5).

### 3.1 Tokens / cache / cost  (was #21's hooks)

- **Source.** `message.usage` on `type:"assistant"` entries, per the existing core
  `lib/transcript-usage.ts` (`sumUsage` over a transcript path; dedup by `message.id`, max-total
  tie-break; TTL cache split with flat fallback).
- **Derivation.**
  - **Per-session** (`session-usage`): `sumUsage(<session>.jsonl)` → one row per top-level session
    transcript. `cumulative:true` semantics are gone — the batch sees the **final** transcript, so
    one settled row per session.
  - **Per-dispatch** (`dispatch-usage`): for a transcript whose first user message is a dispatch
    prompt naming a carrier (§3.5), `sumUsage` over the **whole** dispatched-session transcript
    (subagent file + its own session), carrier-keyed.
  - **Per-IU** (`unit-usage`): `sumUsage` over the **subagent transcript** of a build/IU dispatch
    (`<session>/subagents/agent-*.jsonl`), scoped to the IU id parsed from the dispatch prompt's
    `WHERE`/`GOAL` envelope (§3.5). The dominant model = `dominantModel(by_model)`.
- **Output schema** (unchanged from the publisher's contract, so the Cost block + reconciliation
  render verbatim):
  ```json
  { "ts":"<ISO>", "kind":"unit-usage|session-usage|dispatch-usage",
    "scope_id":"<iu|sess|carrier>", "session":"<id>",
    "carrier":"<id|null>", "carrier_kind":"<kind|null>", "arc":"<arc|null>",
    "model":"<model>", "cumulative":false,
    "token_usage":{ "input":N,"output":N,"cache_creation_5m":N,
                    "cache_creation_1h":N,"cache_read":N,"total":N },
    "v":"0.5.0" }
  ```
  Pricing is preserved exactly: `pricing.json` (rates + cache multipliers + `verified_on`), priced
  by `lib/pricing.ts` (`priceUsage`, `cacheEfficiency`) in `build-analytics.ts`. **No change** to
  pricing or the Cost block (§5).

### 3.2 Friction  (was #28's friction hook)

- **Source.** Across every session transcript:
  - **Permission denials** — `tool_result` with `is_error:true` + `"… has been denied."` (hard
    settings rule; the **command** is recoverable, the matched **rule name is not** — that field
    stays an upstream gap, §8).
  - **Rejected calls** — `tool_result` content `"The user doesn't want to proceed…"` (user
    rejection; distinct from a hard denial).
  - **Tool errors** — `tool_result` with `is_error:true` not matching the denial strings.
  - **Permission-decision structure** — `permissionDecision` / `permissionDecisionReason` where
    present (classifier/hook decisions leave structured info); **degrade gracefully** to counts when
    absent. `permissionMode` (`auto`/`default`/…) is recorded as the session's mode context.
- **Derivation.** Deterministic per-session counts + small bounded category arrays (never the raw
  command/reason strings — those may carry private content; only categorised counts cross into the
  log, mirroring the publisher's no-free-text rule).
- **Output schema** (one `friction-record` per session):
  ```json
  { "ts":"<ISO>", "kind":"friction-record", "session":"<id>",
    "permission_denials":N, "rejected_calls":N, "tool_errors":N,
    "permission_decisions":{ "allow":N, "deny":N, "ask":N },
    "permission_mode":"auto|default|plan|…",
    "v":"0.5.0" }
  ```
  Denial **commands** and rejection **reasons** are deliberately **not** carried (locality). A
  `denied_rules` array is **omitted** — the rule name is unrecoverable from the transcript (§8); the
  field is reserved for the forward-compat day Claude Code surfaces it.

### 3.3 Stalls  (cross-session timestamp gaps)

- **Source.** The ordered `timestamp` series across **all** sessions for a workspace (sorted by
  `timestamp`; session boundaries from `sessionId`).
- **Derivation.** A stall = a gap between consecutive *activity* timestamps exceeding a threshold
  dial (default 30 min, harness-tunable). The analyzer pairs the last-activity-before with the
  first-activity-after and records the gap. This is the **cross-session** view a per-session hook
  cannot produce — the 14h overnight gate stall #28 cited is exactly a between-sessions gap.
  - Where a stall straddles a gate (the entry before the gap is a node-enter on a gate-holding
    node), the stall is **tagged** with that node (a best-effort attribution — deterministic from
    the activity span, §3.4).
- **Output schema** (one `stall-record` per gap over threshold):
  ```json
  { "ts":"<ISO of gap start>", "kind":"stall-record",
    "gap_ms":N, "before_node":"<id|null>", "after_node":"<id|null>",
    "session_before":"<id>", "session_after":"<id>", "v":"0.5.0" }
  ```

### 3.4 Node activity  (skill/subagent spans)

- **Source.** Stack-graph nodes **are** skills, so a node enter is one of:
  - a `Skill` tool_use (input `{name:<skill>}`) — the cleanest signal;
  - a `<command-name>/…</command-name>` user entry (slash invocation);
  - the `attributionSkill` field — present but **toggles per-message** (browse→null→browse), so it
    must be **coalesced** into contiguous spans (a run of the same skill, allowing null gaps within
    a tolerance), **not** naively paired. Used as a fallback/cross-check, primary = Skill/slash.
  - subagent dispatch = a `Task`/`Agent` tool_use (input `{subagent_type, description, prompt}`).
- **Derivation.** enter ts = first activity attributed to the skill; exit ts = the skill's last
  activity before the next distinct skill/None-run boundary (the duration is `exit−enter`). The
  analyzer maps the skill/command name to a **graph node id** where it matches a known node
  (the graph record's id set); a non-graph skill (`browse`, `qa`) is recorded as activity but not
  projected against a node (the publisher's `ID_RE` + the dashboard's node lookup already drop
  unknown ids gracefully).
- **Output schema** (the publisher's existing enter/exit shape — so `nodes[]` last_used/traversals
  and the carrier stage projection work unchanged):
  ```json
  { "ts":"<ISO>", "kind":"enter|exit", "node":"<node-id>", "session":"<id>",
    "carrier":"<id|null>", "carrier_kind":"<kind|null>", "arc":"<arc|null>",
    "outcome":"<label|null>", "gates":[ "<gate>:<pass|fail>", … ], "v":"0.5.0" }
  ```
  `outcome` and `gates` are **only** populated when the model emitted the structured verdict the
  analyzer can read (§7 residual); otherwise omitted/`null` (honest under-capture, never invented).

### 3.5 Attribution  (the hard part)

The in-context hook *knew* the carrier; a batch analyzer must **derive** it. The key signal:

> **The producer is loop-runner — and it does not emit the field form today (the gap A3′ closes).**
> Attribution reads the dispatch prompt's `META:` line, but the field form + that `META:` line exist
> only in `graph/_refs/handoff-prompt-convention.md` (v0.2.0). loop-runner's actual dispatch step
> (`graph/loop-runner/loop-runner.md:181-202`) emits a **prose** spawn-bundle with **no field form**
> and does **not** import the convention (its `references` at :45-50 carry no
> `handoff-prompt-convention` edge). So **on real data the `META:` line is absent and A3 attribution
> degrades to session-level / null for every dispatched IU** — the design's robust path is dead until
> the producer writes it. **IU-A3′ (B1) closes this:** it amends loop-runner's dispatch bundle to
> write the field form **with** the `META: carrier=… kind=… arc=… iu=…` line, and adds
> `{ id: handoff-prompt-convention, load: import }` to loop-runner's `references`. Attribution below
> assumes A3′ has landed; without it, the analyzer correctly falls back (never a wrong carrier).

- **Dispatched sessions** — the **first user message** of a dispatched-session transcript is the
  **dispatch prompt**, which names the carrier/IU/arc. This **converges with cluster C's
  `handoff-prompt-convention`** (`graph/_refs/handoff-prompt-convention.md`, authored under
  `cluster-C-handoff-convention.md`): the envelope `GOAL / WHERE / DO / DONE-WHEN / POL / EPH`.
  The analyzer parses the envelope:
  - `WHERE: <repo>@<branch> — paths` and `GOAL:` carry the IU id / carrier id where the loop-runner
    spawn bundle embeds it (loop-runner Phase 1.2 passes the carrier file path + entry stage — the
    analyzer reads the carrier id from that path and the arc from the entry-stage context).
  - A **structured attribution header** is the robust form: the analyzer reads an
    `EPH(<date>): carrier=<id> kind=<work-item|standalone-iu> arc=<dev-sprint|incremental> iu=<id>`
    line if present (this is the one *additive* ask on the handoff convention — see Open question O1;
    it is policy-by-pointer-compatible and costs one line). Absent the structured line, the analyzer
    falls back to a **bounded regex** over the envelope for `carrier=`/`iu=`/`arc=` tokens.
- **Non-dispatched sessions** — attribute at **session level**: the session's `gitBranch`
  (e.g. `iu/<id>` from loop-runner's `iu/<id>` worktree branch convention) and `cwd` give a
  best-effort carrier/arc; where neither resolves, the session's rows are **carrier-null** (counted
  in the factory-conformance stream, never bleeding into a carrier projection — exactly the
  preamble's `carrier:null` rule).
- **Output.** Every derived row above carries the resolved `(carrier, carrier_kind, arc)` triple or
  nulls; the publisher's `resolveTriple` (closed `CARRIER_KINDS` / `ARCS` allowlists) is the final
  guard, so a mis-parse degrades to null, never a wrong attribution.

---

## 4. Publisher / renderer integration (file:line)

### 4.1 Tokens / node-activity / attribution — **no publisher change**
The token rows (§3.1) match `USAGE_KINDS` and `USAGE_COMPONENT_KEYS`
(`publish-projection.ts:147,152-154`); the enter/exit rows (§3.4) match the existing
enter/exit/`resolveTriple` path (`publish-projection.ts:192-200,667-740`). `cumulative` is now
always `false` (the batch sees settled transcripts) — the latest-per-scope dedup
(`publish-projection.ts:604-606`) still holds harmlessly. The only edit: the version gate
(`publish-projection.ts:106-110,562-568`) now reads the analyzer's `v` (`0.5.0`, still major-0 →
compatible) — **no logic change**.

### 4.2 Friction — additive read path
Add `FRICTION_KINDS = new Set(["friction-record","stall-record"])` (parallel to `USAGE_KINDS`,
`publish-projection.ts:147`) and a closed **`FRICTION_KEYS`** numeric allowlist (parallel to
`USAGE_COMPONENT_KEYS`, `publish-projection.ts:152`). New branch in `deriveProjection` (after the
usage branch, `publish-projection.ts:562-608`) accumulating per-session friction counts + stall
spans, ts/version/`ID_RE`/session-anon sanitised exactly as the usage path. Emit a new
`process_costs` field on `PortalProjection` (parallel to `session_costs`,
`publish-projection.ts:404`). Lockstep comment as `AX_NUMERIC_KEYS` already uses
(`publish-projection.ts:127-133`).

**Extend `realHasData` (S7).** `build-analytics.ts`'s `realHasData` gate
(`build-analytics.ts:120-124`) currently fires the SAMPLE view unless `nodes` / `session_costs` /
`reconciliation` carry data — so a **friction-only projection** (friction/stalls present, no token
data) would wrongly render the sample. Add `process_costs` to the `realHasData` disjunction so a
friction-only run renders the real degraded surface, not the sample.

### 4.3 Renderer — the "Process cost" block
Add `processCostSection(view)` in `build-analytics.ts`, sibling to `costSection`
(`build-analytics.ts:209`), called in `bodyHtml` after `costSection(view)`
(`build-analytics.ts:376`). Renders: denial/rejection/error counts, permission-decision breakdown,
total + longest stall, gate-tagged stalls, with a degraded state ("No process data — analyzer not
yet run"). `FRICTION_KEYS` defined in **both** files under the existing lockstep convention. The
existing Cost block (`build-analytics.ts:209-280`) and pricing (`lib/pricing.ts`) are **untouched**.

---

## 5. The #21 retirement plan

**Preserve:**
- `workspace/renderer/lib/transcript-usage.ts` — the deterministic token summer. This is the
  reusable core; the analyzer's `derive-tokens.ts` calls `sumUsage` / `usageFromObject` directly.
- `workspace/renderer/lib/pricing.ts` + `workspace/renderer/pricing.json` — pricing is unchanged.
- `workspace/renderer/sg-token-usage.ts` (the CLI over a transcript path) — keep as a useful manual
  tool and as a thin wrapper the analyzer/tests reuse.
- The publisher's token contract (`USAGE_KINDS`, `USAGE_COMPONENT_KEYS`, the reconciliation block,
  the fabrication guard) — the analyzer **feeds** it; the fabrication guard stays as defence.

**Remove:**
- `hooks/hooks.json` — the `PostToolUse|Task|Agent` / `SubagentStop` / `Stop` hook declarations.
- `hooks/sg-token-hook.sh`, `hooks/lib/emit-usage.mjs`, `hooks/sg-token-hook.test.ts` — the hook
  guard + node handler + its test. The transcript-reading logic in `emit-usage.mjs` is **already**
  delegated to `transcript-usage.ts` (it does no parsing of its own — `emit-usage.mjs:99,121`), so
  nothing is lost by deleting it; only the hook-plumbing (stdin payload, scope-env gate, per-turn
  cumulative handling) goes.
- The plugin's **hooks declaration** in `plugin.json` (the `hooks` block that vendors
  `hooks/hooks.json`) — and the vendor step that copies the `hooks/` tree. `build/vendor.ts` stops
  vendoring `hooks/`.
- The **token-instrumentation env** in `bindings-contract` §6 and `harness-init` step 5b
  (`SG_TOKEN_EVENT_KIND`, the per-scope `SG_IU_ID`/`SG_SCOPE_ID`/`SG_CARRIER_*`/`SG_ARC`) — replaced
  by the single `SG_TRANSCRIPT_ROOT` (§6). `harness-init validate`'s **live-hook probe** (step 5) is
  replaced by an **analyzer dry-run probe** (run the analyzer once over a tiny fixture transcript,
  assert a derived row lands in `analyzer-events.jsonl`).
- The **inline-emission instructions** in `instrumentation-preamble.md` and **every backbone node's**
  `references: instrumentation-preamble (load: import)` edge — node bodies no longer emit (§7 keeps
  only the small surviving vocabulary as a separate reference). The import is currently carried by the
  backbone nodes enumerated in A6b (§10); the sweep drops the edge from each and **regenerates
  `graph/graph-record.json` in the same IU** so vendor index-parity (`build/vendor.ts:628-655`,
  enforced at `:1030-1035`) holds.

**The existing token Cost block** is now fed by the **analyzer's** `*-usage` rows instead of the
hooks' — same schema, same publisher path, same render. The block, its reconciliation, and pricing
are byte-identical in behaviour; only the **producer** changed from hook to analyzer.

**`measure-outcomes` / `debrief` depend on the hook substrate — fix the timing break (S4).**
`measure-outcomes` reads `unit-usage` events (`graph/measure-outcomes/measure-outcomes.md:142-169`)
and assumes hook-flush timing (`:92-98`, the `timeline_incomplete` "before all hook events have
flushed" path). Under a 1–2×/day **batch**, the analyzer may not have run at debrief time, so the
just-finished sprint's rows **won't exist yet**. The retirement scope (A6b) therefore **amends
`measure-outcomes`**: drop the "**hook-captured**" / "**flushed**" language and the hook-flush timing
assumption, AND specify that **`debrief` triggers an on-demand analyzer run** (analyze the current
sprint's transcripts **before** reading the cost block) so the rows exist by the time it reads. The
existing **`timeline_incomplete` warning path still covers genuine gaps** (a node-enter with no exit),
so confidence-flagging is preserved — only the cause of the gap changes (an unsettled transcript, not
an unflushed hook).

---

## 6. Cron + transcript-root config + harness-init registration

- **`SG_TRANSCRIPT_ROOT`** (env). Default `~/.claude/projects`. `harness-init scaffold` writes it
  into `<org-root>/.claude/settings.json` `env` block alongside `SG_EVENT_LOG` (now the analyzer's
  *output* path) and `SG_PRICING` (unchanged). **Not a binding key** — no graph node resolves it
  (the earns-a-binding test: a key earns a binding only when a node must resolve it; the analyzer is
  out-of-band, so env is correct). Flagged for review as the one env-vs-binding call.
- **Scheduled-task registration (new `harness-init scaffold` step 5c) — `harness-init` does NOT write
  a crontab itself.** Writing a crontab line (or otherwise registering a system scheduler) is a
  **privileged write outside the harness root** and violates `harness-init`'s harness-local-writes-only
  constraint (`tooling/harness-init/harness-init.md:191-194` / `graph/harness-init/harness-init.md`).
  So `scaffold` does **one of two things, chosen at build time:**
  1. **(default) Emit the exact scheduled-task command + a short runbook** for the operator to install
     — the analyze→publish job (`bun run …/analyze.ts && bun run …/publish-projection.ts` from the org
     root with `SG_TRANSCRIPT_ROOT` in scope, default cadence `0 6,18 * * *`), printed for the operator
     to run as the privileged step. This matches the **established be-civic provisioning-runbook
     pattern** (`harness-init` scaffolds; the operator runs the sudo/cron step).
  2. **OR**, where the runtime exposes a scheduling surface, register the job via
     `mcp__scheduled-tasks__*` (the harness's own scheduler) — pick this only if that is how the
     harness schedules. **Flag the choice as a build-time decision** (runbook-emit vs MCP-register).

  `harness-init validate` performs a **read-only** confirmation that the task is registered (it does
  not write the schedule) **and** runs the analyzer **dry-run probe** (analyze once over a tiny fixture
  transcript, assert a derived row lands in `analyzer-events.jsonl`). **No language anywhere about
  `harness-init` writing crontab lines directly.**
- **Determinism of the schedule.** The job is idempotent (§9), so a missed/duplicated run is
  harmless — re-running over the same transcripts yields the same rows.

---

## 7. The layer-2 model-authored channel — the `<sg-signal>` block

Two signals are **model judgments**, not transcript-mechanical facts: the **experience-contract
verdict** (`experience-contract:<pass|fail>`) and the **trend numbers** (`benchmark.perf`,
`health.quality`). The analyzer cannot *derive* a pass/fail judgment or a measured number from
transcript bytes — these are layer 2 of the two-layer model (§2). **Be honest:** this is a
model-authored channel, not a derivation. The value (a number, a pass/fail) is whatever the node
wrote; the allowlist gates only its **key/shape**, never the truth of the value.

**The mechanism — a fenced result block, read, never invented.** The model states these as
**structured output** in its own final result message:

```
<sg-signal>{"gates":["experience-contract:pass"],"metrics":{"benchmark.perf":2100}}</sg-signal>
```

This is a tiny, parseable, model-authored *output* the node produces as part of its result — **not**
a side-channel, **not** an append to any event log.

### 7.1 The parse contract (exact)

- **Which message.** The analyzer reads the `<sg-signal>` block from the **FINAL output/result
  message** of the **verdict-emitting node's own transcript**. For a **dispatched** node (a node run
  inside a subagent session — e.g. `simulate-users` invoked under `verify`), the block is read from
  the **SUBAGENT transcript's final message** (`<session>/subagents/agent-*.jsonl`), **not** the
  parent session's. (A node that runs in the main session emits it in that session's final assistant
  message.)
- **The fenced format.** Exactly one `<sg-signal>…</sg-signal>` fence wrapping a single JSON object
  with optional `gates: string[]` and `metrics: { <series>: number }`. The analyzer regex-extracts
  the fence, `JSON.parse`s the body, and discards a malformed or multiply-fenced block.
- **Validation.** `gates[]` entries must match the experience-contract allowlist
  (`experience-contract:<pass|fail>`); `metrics` keys must be in the publisher's `TREND_SERIES`
  allowlist and values must be **finite numbers**. Anything else is dropped silently.
- **Fallback / under-capture.** Absent or malformed ⇒ the gate/metric is **simply not recorded** —
  the same honest posture as friction. There is **no conformance guarantee** that a verdict-bearing
  node actually emitted a block; the analyzer under-captures rather than fabricating. *(Future work: a
  conformance probe could check that verdict-bearing nodes emit an `<sg-signal>` — flagged, not built
  here.)*

### 7.2 The node-body emit changes are an explicit IU (the `<sg-signal>` author + vocabulary ref)

This block does **not** appear today — the four verdict-bearing nodes currently emit via the retired
preamble's node-exit `gates`/`metrics` path (e.g. `graph/simulate-users/simulate-users.md:249-267`,
the `ax` block + `experience-contract:<pass|fail>` gate on the exit event). **That path is retired.**
A dedicated IU (A-nodes, B2.iii) **authors the `<sg-signal>` emit instruction into the ~4
verdict-bearing nodes** — `simulate-users`, `benchmark`, `health`, `review` — replacing the exit-event
emit with a "write your verdict/number as a fenced `<sg-signal>` block in your final result message"
instruction, and **creates the thin `analytics-vocabulary` reference** (the surviving outcome-label /
gate-token / `<sg-signal>`-format / series-name vocabulary) those nodes carry `load: on-demand`. After
this IU, those nodes know the canonical strings to emit in their *output*; **no node appends events.**

**Where the verdict is absent** (a node that didn't emit the block), the gate/metric is simply
**not recorded** — honest under-capture. Layer 1 stays mechanical; layer 2 is this bounded,
shape-gated, model-authored channel the analyzer reads verbatim.

---

## 8. Forward-compat — the matched deny-rule

A hard settings-rule denial's `tool_result` carries the **command** but **not the matched
rule-name** — that field is **unrecoverable** from the transcript today. It stays an **upstream
Claude Code gap**: the `friction-record` schema reserves a `denied_rules` slot (§3.2) the analyzer
leaves empty, and the publisher/renderer render it **if it ever appears** (a `denied_rules` array,
allowlisted like the rest). No fabrication, no inference — the field is forward-declared and lights
up the day the transcript surfaces it.

---

## 9. Risks / edge cases

- **Transcript availability / locality.** The analyzer runs **only** on the harness machine where
  `~/.claude/projects/**` exists; nothing is shipped. **Only `portal-projection.json` ever leaves the
  machine** (the sanitised, behind-CF-Access snapshot); **`analyzer-events.jsonl` and the entire
  `.stack-graph/derived/` tree are local-only and never synced** (gitignored). The Locality invariant
  (06-analytics) holds by construction. If `SG_TRANSCRIPT_ROOT` is empty/missing, the analyzer writes
  **no rows** and the analytics surface renders its honest input-gated/degraded state (the existing
  `build-analytics.ts` degraded paths, `build-analytics.ts:216-228,359-363`).
- **Idempotency — one settled model (the analyzer REWRITES the file each run).** Re-running over the
  same transcripts is **byte-stable**, guaranteed by a single rule: **the analyzer re-derives and
  fully REWRITES `analyzer-events.jsonl` each run** — one settled row per `(session, scope)`, emitted
  in **canonical sorted order `(ts, session, kind)`**. So a re-run with **no new activity** yields a
  **byte-identical file**. The cursor (`analyzer-cursor.json`) is a **performance skip-cache only** —
  it lets the analyzer not re-read unchanged transcripts — but **correctness does not depend on it**
  (a `--no-cursor` full rebuild produces the identical file). An **in-progress (growing) session**
  gets a **provisional row** that is **REPLACED** (not duplicated) on the next run once the transcript
  settles. There is **no append-only / atomic-append semantics** — there is exactly one writer doing a
  full rewrite, so that framing is dropped everywhere.
- **Large-history performance + cursor/cache (a skip-cache, not a correctness mechanism).**
  `~/.claude/projects/**` grows unbounded. The cursor (`analyzer-cursor.json`) records each
  transcript's `{size, mtime, sha256_head, last_offset}`; an unchanged transcript (same size+mtime) is
  **skipped** entirely; a grown transcript is read **from `last_offset`** and its row(s) re-derived.
  So a twice-daily run touches only the day's deltas — but **the output file is fully rewritten every
  run** regardless (idempotency above), so the cursor is a **pure performance optimisation**; a
  `--no-cursor` full re-read produces the **byte-identical** file.
- **Subagent transcripts.** Live at `<session>/subagents/agent-*.jsonl` — the analyzer walks these
  **separately** (they hold the dispatched-session usage that feeds `unit-usage`/`dispatch-usage`,
  §3.1) and joins them to the parent session by the directory parent + the dispatch prompt's
  attribution. `isSidechain`/`parentUuid` disambiguate a subagent's lineage.
- **Session anonymisation.** The publisher already anonymises session ids (`session-usage` scope →
  `sess-<n>`, `publish-projection.ts:531-535,584-586`); the analyzer carries the **raw** session id
  in the derived log (local, gitignored) and the publisher anonymises at projection — **preserve
  this split**, do not anonymise in the analyzer (the publisher is the locality boundary).
- **Determinism / locality-leak guards.** The analyzer emits **only** allowlist-shaped values
  (ids `ID_RE`-clean, ts strict-ISO, models `MODEL_RE`-clean, no free-text command/reason/outcome
  strings). The publisher's guards (`ID_RE`, `ISO_UTC_RE`, `MODEL_RE`, `resolveTriple` closed
  allowlists, the fabrication guard) stay as the enforced boundary — the analyzer produces to them,
  the publisher enforces them.
- **`attributionSkill` is not a clean span.** It toggles per-message (verified), so node-activity
  coalescing (§3.4) must tolerate null gaps and prefer the `Skill`/slash signal; a naive pair would
  over-count enters. Test fixture: a browse run with 32 toggles must coalesce to one span.
- **Dispatch-prompt parse failure.** A malformed/old envelope falls back to session-level
  attribution (gitBranch/cwd), then to carrier-null — never a wrong carrier (the publisher's
  `resolveTriple` is the final guard).

---

## 10. IU decomposition  (replaces the old A1–A4; 10 single-agent IUs, one commit each)

Single-agent-IU sizing (D57): each is one fresh-context build with a **narrowed** acceptance check.
The spine (A1) carries the core; A2/A3/A3′/A4 are independent derivations on it; A-nodes is the
layer-2 emit channel; A5 integrates the publisher/renderer; A6a/b/c retire the hook+preamble
substrate, sweep the import edges, and land the config + spec. **Graph-record facts (verified):
`graph/graph-record.json` is at `node_count:46, reference_count:26, edge_count:224`** — A6b
regenerates it after the edge sweep.

- **A1 — analyzer core + cursor, reusing `transcript-usage.ts`.**
  Build `analyzer/analyze.ts` + `cursor.ts` + `derive-tokens.ts`: walk `SG_TRANSCRIPT_ROOT`, reuse
  `sumUsage`/`usageFromObject`, emit `unit/session/dispatch-usage` rows to
  `.stack-graph/derived/analyzer-events.jsonl`, **full-rewrite each run**, advance the cursor.
  **Acceptance:** over a fixture tree the analyzer emits the same token rows the #21 hooks would have,
  and a second run (and a `--no-cursor` run) produces a byte-identical output file.

- **A2 — friction + permission-decision extraction.**
  `derive-friction.ts`: per-session `friction-record` rows (denials, rejected calls, tool errors,
  `permissionDecision`/`Reason`/`Mode`), categorised counts only, no free-text.
  **Acceptance:** a fixture session with a hard denial, a user rejection, a tool error, and a
  `permissionDecision` produces correct counts; absent fields degrade to 0, none model-filled.

- **A3 — node-activity + attribution (consumer).**
  `derive-activity.ts` (Skill/slash/Task spans → enter/exit/duration, coalescing `attributionSkill`)
  + `attribute.ts` (parse the dispatch prompt's `META:` line → carrier triple; session-level + null
  fallback).
  **Acceptance:** a dispatched-session fixture **carrying a `META:` line** attributes the correct
  `(carrier,kind,arc,iu)`; a non-dispatched / `META:`-absent session falls back to session-level / null;
  the browse-toggle fixture coalesces to one span.

- **A3′ — loop-runner emits the field form + `META:` line (the attribution PRODUCER, B1).**
  Amend loop-runner's dispatch bundle (`graph/loop-runner/loop-runner.md:181-202`) to write the
  handoff field form **with** the `META: carrier=… kind=… arc=… iu=…` line, and add
  `{ id: handoff-prompt-convention, load: import }` to its `references` (`:45-50`).
  **Acceptance:** a loop-runner dispatch prompt now contains a well-formed `META:` line over the
  allowlisted `kind`/`arc` vocabulary, and A3's `attribute.ts` resolves the carrier from it on a real
  dispatched-session fixture (was previously null on prose bundles).

- **A4 — stall derivation.**
  `derive-stalls.ts`: cross-session timestamp-gap `stall-record` rows over the threshold dial,
  gate-tagged where the pre-gap node is gate-holding.
  **Acceptance:** a fixture with a 14h cross-session gap on a gate-holding node yields one
  `stall-record` with the gap and the node tag; sub-threshold gaps yield none.

- **A-nodes — `<sg-signal>` emit into the verdict-bearing nodes + `analytics-vocabulary` ref (B2.iii).**
  Author the `<sg-signal>` result-block emit instruction into `simulate-users`, `benchmark`, `health`,
  `review` (replacing the retired exit-event `gates`/`metrics` emit, e.g.
  `graph/simulate-users/simulate-users.md:249-267`); create the thin `graph/_refs/analytics-vocabulary.md`
  reference (outcome labels + `experience-contract:<pass|fail>` gate token + `TREND_SERIES` names +
  the `<sg-signal>` format) carried `load: on-demand` by those four nodes.
  **Acceptance:** each of the four nodes instructs a fenced `<sg-signal>` emit in its final result and
  carries the `analytics-vocabulary` ref; the analyzer's §7 parser extracts a valid block from a fixture
  final message and drops a malformed one (absent ⇒ not recorded).

- **A5 — publisher + renderer integration (Process-cost block) + `realHasData` + hostile fixtures.**
  `publish-projection.ts`: `FRICTION_KINDS` + `FRICTION_KEYS` + the `process_costs` read path
  (token/activity paths unchanged). `build-analytics.ts`: `processCostSection` + lockstep
  `FRICTION_KEYS` + **extend `realHasData` (`:120-124`) to include `process_costs`** (S7).
  **Acceptance:** analyzer→publish→build over the fixture renders both a Cost block and a Process-cost
  block; a **friction-only** projection renders the real (degraded) surface, not the sample; the
  **hostile-fixture sanitisation explicitly covers the NEW `friction-record`/`stall-record` kinds** —
  a free-text command smuggled in an unexpected field, a non-`ID_RE` `before_node`/`after_node` tag,
  and a free-text `permission_mode` are each dropped (this is NEW A5 code not yet behind the existing
  usage-path allowlists).

- **A6a — hook retirement.**
  Delete the `hooks/` tree, the `plugin.json` hooks declaration (`build/vendor.ts:546-548`), and the
  vendor `writeHooks`/`hooksFiles`/Stage-6 + checkHooks stages (`build/vendor.ts:878-913…`).
  **Acceptance:** the `hooks/` tree is gone, `plugin.json` carries no `hooks` block, and `build/vendor.ts`
  no longer copies or checks a hooks tree (vendor runs clean).

- **A6b — preamble-retirement sweep + graph-record regen + `measure-outcomes` amend (S4).**
  Drop the `{ id: instrumentation-preamble, load: import }` edge from **every backbone node that
  carries it** (the enumerated set: align-context, architecture-review, benchmark, build, canary,
  debrief, debug, deploy, design, design-implement, design-review, design-shotgun, health,
  investigate-probe, land, loop-runner, optimise, plan, qa, reconcile, review, simulate-users,
  specify-slice, specify, triage, verify, measure-outcomes); author nothing new here beyond the ref
  already created in A-nodes; **regenerate `graph/graph-record.json` in the SAME IU** so vendor
  index-parity (`build/vendor.ts:628-655`, enforced `:1030-1035`) holds; amend `measure-outcomes`
  (drop "hook-captured"/"flushed" language + the flush-timing assumption; specify `debrief` triggers an
  on-demand analyzer run before reading the cost block).
  **Acceptance:** no backbone node imports `instrumentation-preamble`; `graph-record.json` is
  regenerated and `bun run build/vendor.ts` passes index-parity; `measure-outcomes` no longer assumes
  hook flush and triggers an on-demand analyze before reading.

- **A6c — config + harness-init runbook + event-log migration + spec amendments.**
  `bindings-contract` §2/§6 (`SG_TRANSCRIPT_ROOT` env, drop the hook-activation env, migrate the
  `event-log` filename to `derived/analyzer-events.jsonl` — S6); `harness-init` scaffold **emits the
  scheduled-task command + runbook** (NOT a crontab write — B4) or registers via
  `mcp__scheduled-tasks__*`, validate confirms (read-only) + runs the analyzer dry-run probe; amend
  `06-analytics` (the two-layer honest invariant + the four derived series + Process-cost axis) and
  `instrumentation-preamble` (retire as runtime contract / tombstone) per the amendment doc.
  **Acceptance:** `harness-init scaffold` emits the install runbook (writes no crontab); `validate`
  confirms registration read-only + passes the dry-run probe; the three publisher event-path defaults
  resolve `derived/analyzer-events.jsonl`; `06-analytics` states the two-layer (mechanical +
  shape-gated model-authored) invariant and the single transcript-derived source.

---

## Spec amendment proposal

The concrete edits to `06-analytics` and `instrumentation-preamble` are in the sibling file
**`cluster-A-unified-analytics-amendment.md`** (kept separate so the reviewer sees the design and
the amendment side-by-side, per the spec-touchpoints discipline).
