# Token instrumentation — design (issue #21)

**Status:** DESIGN — for review (autoplan: CEO + design + eng).
**Decision:** D68 (proposed).
**Issue:** [hk121992/stack-graph#21](https://github.com/hk121992/stack-graph/issues/21) — "Analytics token instrumentation is model-emitted, not hook-captured."
**Companion symptom:** [hk121992/bc-workspace#136](https://github.com/hk121992/bc-workspace/issues/136) (consuming-workspace — out of this repo's write boundary; handled as a re-vendor handoff).

## Problem (verified, not assumed)

`06-analytics` promises that instrumentation is *"deterministic — a timeline scanned from
real events; model judgment is reserved for interpreting that timeline, never for producing
it,"* with token measures **hook-captured** and a **transcript baseline** that *"already
exists."* None of that is true today:

- `stack-graph-plugin/hooks/` is a lone `.gitkeep`; no `SubagentStop`/`Stop`/`PostToolUse`
  handler exists in the factory, the plugin, or any `.claude` settings.
- `build` and `loop-runner` instruct the **model** to *emit* `tokens_per_iu` /
  `tokens_per_session` inline (`build.md:159`, `loop-runner.md:231`), calling them
  "hook-captured" while supplying no mechanism. The number is the model's guess.
- No transcript-baseline reader exists anywhere (`grep` for `cache_read` / `input_tokens` /
  usage summation across the factory returns nothing).
- `publish-projection.ts` (v0.2.0) **does** compute `session_costs[]` from `dispatch-complete`
  (`SESSION_COST_KEYS = ["tokens_per_session"]`, a single number), but `build-analytics.ts`'s
  `Projection` interface omits the field entirely, so it is **never rendered**.
- Observed in a consuming harness: per-IU values were round estimates (30k/35k/55k/…); one
  loop's orchestrator ran **~99.8M total tokens, ~96 % cache reads**, while summed per-IU
  estimates were ~260k. **Any metric that ignores caching misstates real cost by ~25×.**

The structural half (node activity, carrier stage) is genuinely deterministic. The
evidentiary half (cost, AX, conformance, earns-keep) is empty or fabricated. This design
wires the evidentiary half to **real, hook-captured, cache-inclusive** token data.

## Mechanism — confirmed against Claude Code docs + empirically

Verified in `code.claude.com/docs/en/{hooks,plugins-reference}.md` and against live transcripts
(per the workspace rule "verify Claude's actual behaviour, never assume"):

1. **The transcript is the deterministic source of truth.** Each assistant message in the
   session JSONL carries `message.usage` with all four components —
   `input_tokens`, `output_tokens`, `cache_creation_input_tokens`,
   **`cache_read_input_tokens`** — plus `message.model`. (Confirmed by inspecting live
   `~/.claude/projects/.../<session>.jsonl`.)
2. **Hook payloads do *not* carry usage** — but they carry the transcript path:
   - `Stop` → `{ session_id, transcript_path, cwd, hook_event_name, stop_hook_active, … }`.
   - `SubagentStop` → `{ session_id, transcript_path (main), agent_transcript_path
     (the subagent's *own* JSONL, in a nested `subagents/agent-<id>.jsonl`), agent_id,
     agent_type, … }`.
   So the mechanism is necessarily *hook fires → read the named transcript → sum usage →
   append the measured event.* Item 1 (hook) and item 2 (baseline reader) are therefore the
   **same core machinery**, exposed two ways.
3. **Per-subagent (per-IU) attribution is exact.** `agent_transcript_path` is the subagent's
   own file — summing it gives that subagent's true cost with no sidechain filtering. Dedup by
   `message.id` (parallel tool calls share an id).
4. **Plugin hooks wire via `hooks/hooks.json`** (or an inline `hooks` key in `plugin.json`),
   commands resolved against `${CLAUDE_PLUGIN_ROOT}` with `./`-relative paths. So a vendored
   plugin can ship enforced hooks that a consuming harness picks up on install.

## Spec touchpoints

| Spec doc | Section | Relationship |
|---|---|---|
| `handbook/content/06-analytics/README.md` | Two event sources; How a node emits events; Per-IU cost; Per-session cost; The rendered analytics surface; Stream namespacing | **Amend.** Make the transcript baseline real (a reader, not a claim); reclassify token aggregates as **hook-captured, not model-emitted**; add the cost/cache surface, the reconciliation invariant, and the four-component shape. |
| `handbook/content/02-graph-spec/README.md` | Event shape / node schema | **Amend (minor).** Register the hook-emitted event kinds (`unit-complete`, `dispatch-complete`) and the four-component token block as a recognised, allowlisted shape. |
| `handbook/content/03-plugin-spec/README.md` | Packaging; the `hooks/` slot; build/vendor pipeline | **Amend.** The `hooks/` slot is now populated and vendored; document the vendor stage + the `hooks.json` declaration. |
| `handbook/content/04-harness-spec/README.md` | Bindings contract (`event-log`); directory topology; instantiating a harness | **Amend.** The `event-log` binding must be **org-root-anchored** so worktree-isolated dispatched sessions append to the canonical log; document hook wiring + the host-pricing binding. |
| `handbook/content/07-decomposition/README.md` | IU-sizing dial / `tokens_per_iu` / over-budget share | **Amend (minor).** The dial now reads a real measure; `over_budget_share` becomes emittable. |
| `docs/decisions.md` | new D68 | **Append.** Log the decision: deterministic hook-captured token instrumentation; model stops producing token numbers. |
| `graph/_refs/instrumentation-preamble.md` | emit contract | **Amend → v0.4.0.** State explicitly that token aggregates are **appended by the hook**, not by the node body; the model emits only structural enter/exit facts it actually knows. |

## Architecture

### 1. The deterministic core — a transcript-usage summer

One module, `workspace/renderer/lib/transcript-usage.ts` (bun-TS, matching the rest of the
renderer). Pure function:

```
sumUsage(transcriptPath) ->
  { input_tokens, output_tokens, cache_creation_input_tokens, cache_read_input_tokens,
    total_tokens, by_model: { <model>: {…four…} } }
```

- Parses JSONL, takes assistant entries, **dedups by `message.id`**, sums the four
  components, records per-`model` subtotals (so cost can be priced per model).
- No model judgment, no estimation. This is the single implementation every consumer shares
  (hooks, baseline CLI, reconciliation) so all three agree by construction.

### 2. The two hooks (shipped in the plugin, enforced)

A thin shell wrapper per hook invokes the core via `bun run`. Both append **one whole JSON
line in a single `O_APPEND` write** (the spec's concurrency contract) to the **bound,
org-root-anchored** event log.

- **`SubagentStop` hook** — reads `agent_transcript_path`, sums it → appends a
  **`unit-complete`** event carrying `agent_id`, `agent_type`, the four-component
  `token_usage` block, and `tokens_per_iu = total_tokens`. This is the per-IU build cost,
  measured, for every subagent-dispatched IU (the `serial-subagent` / `parallel-subagent`
  build modes — the default for 3+ IUs).
- **`Stop` hook** — reads `transcript_path`, sums the whole session → appends a
  **session-usage** event (and, when the session was an arc-level dispatch, the
  carrier-keyed **`dispatch-complete`** with `tokens_per_session`). This is the transcript
  baseline (item 2) and the reconciliation anchor (item 5), captured for **any** session
  unchanged — satisfying the "already runs on any session" promise.

### 3. Binding hook-measured tokens to carrier / IU — the one genuinely hard part

The hook knows `agent_id` / `session_id`, not the IU or carrier. The structural
enter/exit events (model-emitted, carrying `carrier`/`carrier_kind`/`arc`/IU) live in the
same log. Binding is a **deterministic projection-time join** (no model judgment), with a
fast-path:

- **Fast-path (recommended default):** the dispatcher exports `SG_CARRIER_ID`,
  `SG_CARRIER_KIND`, `SG_ARC`, `SG_IU_ID` into the dispatched session/subagent environment;
  the hook reads them and stamps the token event directly. Clean for separate-session and
  serial-subagent dispatch (one context = one set of vars).
- **Join fallback:** when env context is absent, the publisher joins each token event to a
  carrier/IU by `(session_id, agent_id, time-window)` against the structural enter/exit
  stream. Deterministic set logic, owned by the publisher.

**Honest limitation:** an **inline** IU (built in the orchestrator's own context — the XS/S
exception, not the default) produces no `SubagentStop` and cannot be precisely attributed
per-IU without the model estimating (which this design bans). Inline IUs are therefore
attributed at the **session** level only; per-IU precision is available for every
fresh-context (subagent/session) IU — i.e. the common case the IU-sizing dial cares about.
This limitation is stated in the spec rather than hidden.

### 4. Event shapes (hook-emitted, four-component)

`unit-complete` (per IU, from `SubagentStop`):
```json
{ "ts":"…","session":"…","kind":"unit-complete","agent_id":"…","agent_type":"…",
  "carrier":"…","carrier_kind":"…","arc":"…","iu":"…",
  "tokens_per_iu": 412300,
  "token_usage": { "input": …, "output": …, "cache_creation": …, "cache_read": …,
                   "total": 412300 },
  "by_model": { "claude-opus-4-8": { … } }, "v": "0.4.0" }
```

`dispatch-complete` (per dispatched session, from `Stop`): same block, `kind:"dispatch-complete"`,
`tokens_per_session` instead of `tokens_per_iu`, carrier-keyed.

The publisher's `SESSION_COST_KEYS` allowlist extends from `["tokens_per_session"]` to the
four components + total; `SessionCostPoint` gains the breakdown. **Publisher and renderer
allowlists stay in lockstep** (the in-file comments already mandate this).

### 5. Render the cost view + cache breakdown (items 3, 4)

- Add `session_costs?: SessionCostPoint[]` (now with the four components) to the `Projection`
  interface in `build-analytics.ts` (line 45) — the publisher already produces it.
- Add a **Cost** surface block (after trends): per-session/per-carrier total, the
  **four-component breakdown**, a **cache-efficiency** figure (`cache_read / total`), and a
  **$ cost** computed from a per-model price table.
- **Pricing** (`workspace/renderer/pricing.json`): four rates per model
  (input / output / cache-write / cache-read per Mtok). Documented as **operator-maintained
  and verified against current Anthropic pricing** — not baked as eternal truth (the
  workspace rule: stale prices are a limitation to verify, not assume). A missing model →
  cost shown as `unknown`, never silently zero.
- Cache-read volume is the dominant cost driver; surfacing it is the headline fix.

### 6. Reconciliation invariant (item 5)

`06-analytics` declares `tokens_per_session` a **superset of** Σ`tokens_per_iu`. The publisher
computes, per dispatched session: Σ`tokens_per_iu` (from `unit-complete`) vs `tokens_per_session`
(from `dispatch-complete`) vs the **true transcript total** (from the `Stop` baseline) and emits
a `reconciliation` projection field flagging divergence beyond tolerance. Rendered as a small
"instrumentation health" block. This is what would have caught the 25× gap automatically.

### 7. Emit-or-descope the specced-but-unemitted metrics (item 6)

- **`over_budget_share`** (`measure-outcomes`, vs the context-budget dial) — **EMIT.** Now
  that `tokens_per_iu` is real, `measure-outcomes` derives the per-sprint distribution and
  over-budget share deterministically. Add the emitter + allowlist entry.
- **Crystallization "generative fraction"** (`explore`/crystallization) — **mark
  future / mechanism-gated, explicitly.** Measuring "from-scratch vs from-substrate" tokens
  needs semantic attribution = model judgment, which violates the production rule. It is an
  honest *later* (mechanism-gated): named as a seam in `06-analytics`, with the reason, not
  dressed up as staging. Revisit if a deterministic proxy emerges.

### 8. Schema reconcile + version gate (item 7)

- **Preamble → v0.4.0:** add the hook-emitted `unit-complete` / `dispatch-complete` shapes
  and the four-component block; state that **token aggregates are hook-appended, not
  model-emitted**.
- **Document the live event kinds** `note` and `review-fix` (present in real consuming logs,
  in no spec today): define them minimally in the preamble — `note` = free-text annotation,
  ignored by the projection; `review-fix` = loop re-entry event, routed to the
  factory-conformance stream. The publisher already ignores unknown kinds; this makes them
  intentional rather than silent.
- **Version-compat gate:** every event carries `v` (the preamble version); the publisher
  declares a compatible range and **degrades visibly** (provenance banner, not silent drop)
  when it reads an out-of-range stream. This is exactly the bc-workspace#136 failure — a
  stale vendored publisher silently dropping events — turned into a visible, gated state.
  Bump `GENERATOR_VERSION` to match the preamble.

### 9. Vendoring + harness wiring (item 1 plumbing)

- New factory source dir `hooks/` (e.g. `graph/_hooks/` or top-level `hooks/`) holding the
  hook scripts + `hooks.json`.
- New `vendor.ts` stage copies it into `stack-graph-plugin/hooks/` and declares the hooks
  (via `plugin.json` `hooks` → `./hooks/hooks.json`) so vendored installs wire them.
- `harness-init` binds the **org-root-anchored** `event-log` path and the host **pricing**
  table so hooks resolve the canonical log even from worktree-isolated sessions.
- Plugin version bump (post-merge `chore(vendor)`).

### 10. Stop the model emitting token numbers

Edit `build.md`, `loop-runner.md`, and the preamble so the node bodies **no longer instruct
the model to supply `tokens_per_iu` / `tokens_per_session`** — those now arrive from the
hook. The bodies keep emitting the structural enter/exit/gate facts they actually know. This
closes the "model fabricates the number" path at the source.

## Decomposition (IU-level, for the sprint plan)

Independent enough to fan out; dependency edges noted.

1. **`transcript-usage.ts` core + unit tests** (no deps). The deterministic summer; dedup;
   per-model subtotals. Foundation for 2, 4, 6.
2. **`Stop` + `SubagentStop` hook scripts + `hooks.json`** (dep: 1). Append the events;
   `O_APPEND` single-line; env fast-path.
3. **Publisher: extend `SESSION_COST_KEYS` + `SessionCostPoint` to four components;
   reconciliation field; version-compat gate + `v`** (dep: shapes from 2). Extend
   `publish-projection.test.ts` (hostile-fixture parity).
4. **Renderer: `Projection.session_costs` + Cost block + cache-efficiency + $; `pricing.json`**
   (dep: 3). New `build-analytics.test.ts` (none exists today).
5. **`vendor.ts` hooks stage + `plugin.json` hooks declaration + plugin bump** (dep: 2).
6. **`measure-outcomes` over_budget_share emitter + allowlist** (dep: 1, 3).
7. **Spec amendments** (06/02/03/04/07-analytics, preamble v0.4.0, `note`/`review-fix` docs,
   generative-fraction future-seam) + **node-body edits** removing model token emission
   (build, loop-runner). **D68** in decisions.
8. **`harness-init` binding** for org-root event-log + pricing (dep: 9 shape).

## Open forks (recommendation given; eng-review may overturn)

- **Hook script language — bun-TS (recommended) vs python3.** bun-TS shares the one
  `transcript-usage` implementation with the publisher/CLI (DRY; the three agree by
  construction); the harness already requires bun for the render. Tradeoff: bun must be on
  the harness shell PATH at hook time. python3 is zero-dep but forks a second token-summing
  implementation that must be kept in lockstep with the TS one. **Recommend bun-TS**;
  fall back to a vendored single-file python only if a target harness can't guarantee bun.
- **Carrier/IU binding — env fast-path + projection join (recommended) vs join-only.**
  Env-path is clean where the dispatcher controls the child environment; the join is the
  always-available fallback. **Recommend both** (fast-path with join fallback).
- **`note`/`review-fix` — define-and-recognise (recommended) vs reject-as-nonspec.** They're
  in real logs; defining them is honest and cheap. **Recommend define.**

## Acceptance (maps to issue #21)

- [ ] A hook (not the model) writes `tokens_per_iu`/`tokens_per_session` from real usage;
      values are non-round and match transcript totals within tolerance. *(2, 1)*
- [ ] A transcript-baseline reader exists and is documented; per-session total/cost derivable. *(1, 2)*
- [ ] The analytics surface renders a cost view (session costs + cache breakdown); no token
      figure originates from model judgment. *(4, 10)*
- [ ] Reconciliation surfaces per-IU / per-session / total and flags violations. *(6/§6)*
- [ ] Preamble/publisher versions reconciled + a compatibility gate exists; all live event
      kinds documented. *(3, 8)*
