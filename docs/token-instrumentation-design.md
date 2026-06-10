# Token instrumentation — design (issue #21)

**Status:** DESIGN rev2 — autoplan-reviewed (CEO + eng + DX, dual-voice), corrections folded in. Approved for full build.
**Decision:** D69 (proposed). *(D68 is taken — curator integrate mode.)*
**Issue:** [hk121992/stack-graph#21](https://github.com/hk121992/stack-graph/issues/21) — analytics token instrumentation is model-emitted, not hook-captured.
**Companion symptom:** [hk121992/bc-workspace#136](https://github.com/hk121992/bc-workspace/issues/136) (consuming-workspace; out of this repo's write boundary — re-vendor handoff).

## Problem (verified)

`06-analytics` promises deterministic, **hook-captured** token measures and a **transcript baseline** that "already exists." Neither exists: `stack-graph-plugin/hooks/` is a lone `.gitkeep`; `build`/`loop-runner` instruct the **model** to emit `tokens_per_iu`/`tokens_per_session` inline while calling them "hook-captured"; no transcript reader exists; `publish-projection.ts` computes `session_costs[]` that `build-analytics.ts`'s `Projection` interface omits, so it never renders. Observed: a loop ran ~99.8M tokens, ~96% cache reads, while summed per-IU estimates were ~260k — **any metric ignoring cache misstates cost ~25×.** The structural half (node activity, carrier stage) is deterministic; the evidentiary half is empty or fabricated.

## Mechanism — verified against Claude Code docs + live transcripts

1. **Transcript JSONL is the deterministic source.** Each assistant message carries `message.usage` with `input_tokens`, `output_tokens`, `cache_creation_input_tokens`, **`cache_read_input_tokens`**, `message.model`, and a TTL split `usage.cache_creation.{ephemeral_5m_input_tokens, ephemeral_1h_input_tokens}`.
2. **`PostToolUse` on a *synchronous* `Agent`/`Task` call carries native usage** — `tool_response.usage.{4 components}` + `tool_response.totalTokens` + `tool_response.agentId`. This is the **primary** capture for per-IU subagent builds (no transcript parse, and the parent owns the `agent_id→IU` binding because it issued the dispatch). Background (`run_in_background`) calls return `status:"async_launched"` with **no** usage.
3. **`Stop`/`SubagentStop` payloads do *not* carry usage** — only `transcript_path` / `agent_transcript_path`. They are the **baseline/fallback** path: read the named transcript and sum. `Stop` fires **per turn**, not at session end — so its events are **cumulative-marked** and the publisher keeps latest-per-scope (avoids double counting).
4. **Plugin hooks wire via `hooks/hooks.json`** with `${CLAUDE_PLUGIN_ROOT}`-relative commands; a vendored plugin ships them and a consuming harness picks them up on install.

**Capture hierarchy:** native `PostToolUse` (sync subagent IU) → `SubagentStop`+`agent_transcript_path` (background subagent) → `Stop`+`transcript_path` (main session / headless `claude -p`). Same deterministic summer underneath all three.

**Obsolescence watch (named seam):** if Claude Code later adds native usage to `Stop`/`SubagentStop` payloads, `transcript-usage.ts` collapses to a field read; events, reconciliation, and render survive unchanged.

## Spec touchpoints

| Spec doc | Section | Relationship |
|---|---|---|
| `06-analytics/README.md` | Two event sources; emit; per-IU/per-session cost; rendered surface; stream namespacing | **Amend.** Real transcript baseline + CLI; token measures hook-captured (PostToolUse primary, transcript baseline); cost/cache surface; reconciliation as coverage+inequality; the three distinct metrics. |
| `02-graph-spec/README.md` | Event shape / node schema | **Amend (minor).** Register hook-emitted `unit-usage`/`dispatch-usage`/`session-usage` kinds + 4-component block; `note`/`review-fix` recognised. |
| `03-plugin-spec/README.md` | `hooks/` slot; vendor pipeline | **Amend.** `hooks/` populated + vendored via a new `vendor.ts` stage; `plugin.json hooks → ./hooks/hooks.json`. |
| `04-harness-spec/README.md` | bindings (`event-log`); topology; instantiating; hook wiring | **Amend.** Absolute org-root `SG_EVENT_LOG`; `harness-init validate` live-hook probe; host pricing binding; wiring runbook. |
| `07-decomposition/README.md` | IU-sizing dial | **Amend (minor).** Dial reads real *context-pressure*; `over_budget_share` emittable with coverage denominator. |
| `docs/decisions.md` | **D69** | **Append.** |
| `graph/_refs/instrumentation-preamble.md` | emit contract → **v0.4.0** | **Amend.** Token aggregates are hook-appended; explicit **do-NOT-emit** list (`tokens_per_iu`/`tokens_per_session`/`token_usage`); body still owns structural events. |

## Architecture

### 1. Deterministic core — the transcript-usage summer

`workspace/renderer/lib/transcript-usage.ts` (TS, run via **node** — see fork). Pure:
```
sumUsage(transcriptPath, {scope?}) -> {
  input, output, cache_creation_5m, cache_creation_1h, cache_read, total,
  by_model: { <model>: {…} }, counted_messages, skipped_lines, warnings }
```
Rules (pinned, not prose — built against a **real committed sanitized transcript fixture**, not synthetic JSON):
- Count **assistant** entries only; **dedup by `message.id`**, tie-break **max-total per id** (handles streamed/partial/retry duplicates).
- Read the cache_creation **TTL split** (`ephemeral_5m`/`ephemeral_1h`); fall back to flat `cache_creation_input_tokens` at the 5m rate **and emit a warning** if the split is absent.
- Skip error/interrupted/compaction-synthetic entries with no `usage`; count `skipped_lines`. A truncated final line is normal (live session) → skip-with-count, never fatal.

### 2. Capture — hooks (shipped in the plugin, enforced, node)

- **`PostToolUse` (Agent tool) — primary, per-IU.** On a completed sync subagent, read `tool_response.usage` natively; bind to the IU via the dispatcher's `SG_IU_ID`/`SG_SCOPE_ID` (the parent set it). Append a **`unit-usage`** event. On `async_launched`, no-op (background path below).
- **`SubagentStop` — background subagent fallback.** Read `agent_transcript_path` via the summer; append `unit-usage`.
- **`Stop` — session baseline.** Read `transcript_path`; append a **`session-usage`** event marked `cumulative:true` (per-turn fire → publisher keeps latest-per-session). When the session is an arc-dispatch, also tag the carrier triple → **`dispatch-usage`**.
- **Scoped + loud.** Each hook requires its scope env (`SG_TOKEN_EVENT_KIND`, `SG_IU_ID`/`SG_SCOPE_ID`); **absent scope → no-op, never a mis-attributed emit.** A POSIX guard checks the runtime is resolvable **before** invoking node; if not, it appends a visible **`instrumentation-error`** event (and stderr) — **never a silent drop.** Append is a single `open(O_APPEND)`+one `write` helper, token events kept **< 4KB** (raw evidence and `by_model` excluded from the line — `by_model` is priced at publish from the model→tokens map; `flock` as belt-and-suspenders).

### 3. Binding tokens → carrier/IU — deterministic only (no fuzzy join)

The time-window join is **dropped** (it smuggled non-determinism the spec forbids). Binding is exact:
- **Sync subagent IU:** the parent `PostToolUse` knows both `tool_response.agentId` and the IU it dispatched.
- **Headless `claude -p` / background:** the child session's env carries `SG_IU_ID`/`SG_SCOPE_ID` (the dispatcher controls the child env); the child's own `Stop`/`SubagentStop` stamps it.
- **Absent scope env → attribute at session level only** (the inline-IU limitation), and `measure-outcomes` reports the **coverage denominator** ("over_budget_share over N of M IUs; K unmeasured") so the dial is never read as whole-population. This kills the survivorship-bias hole.

### 4. Event shapes — body vs hook (no double-emit; D57/D59 amendment)

The node **body keeps** emitting the structural `unit-complete`/`dispatch-complete` (carrier, iu, **acceptance evidence** — which only the body knows) **without token fields**. The **hook** emits a *separate* usage event the publisher joins by scope id:
```json
{ "ts":"…","kind":"unit-usage","scope_id":"<iu|dispatch id>","agent_id":"…",
  "carrier":"…","carrier_kind":"…","arc":"…","iu":"…","cumulative":false,
  "token_usage":{ "input":…, "output":…, "cache_creation_5m":…, "cache_creation_1h":…, "cache_read":…, "total":… },
  "v":"0.4.0" }
```
This is named in `06-analytics`/`02-graph-spec` as an explicit amendment to the D57/D59 "body emit" decision: **structural facts stay body-owned; cost is hook-owned.** The publisher **rejects** a `tokens_per_*` key arriving on a model-authored `exit.metrics` (closes fabrication reintroduction); the preamble's do-NOT-emit list backs it.

### 5. Cost — three distinct numbers (answers the alignment question)

Categories are **disjoint** (`input_tokens` = uncached remainder). Pinned method:
- **Volume** = `input+output+cache_creation+cache_read` (a scale figure, never shown as $).
- **Dollar cost** = `Σ_msg [ input·R + output·5R + cc_5m·1.25R + cc_1h·2R + cache_read·0.1R ]`, priced per `message.model`. The **TTL split is load-bearing** (1.25× vs 2× cache-write). Labeled **"estimated cost at current API rates (as of `verified_on`)"** — on a subscription the real bill is usage-limit-based, so $ is the clearly-derived secondary; raw components are primary.
- **Context pressure** (for `over_budget_share`) = max per-turn `(input+cache_read+cache_creation)`, **not** total.

`workspace/renderer/pricing.json` (operator-maintained, stamped):
```json
{ "verified_on":"2026-06-10", "source":"platform.claude.com/docs/en/pricing",
  "cache_multipliers":{ "write_5m":1.25, "write_1h":2.0, "read":0.1 },
  "models":{ "claude-opus-4-8":{"input_per_mtok":5.0,"output_per_mtok":25.0},
             "claude-sonnet-4-6":{"input_per_mtok":3.0,"output_per_mtok":15.0},
             "claude-haiku-4-5":{"input_per_mtok":1.0,"output_per_mtok":5.0} } }
```
Missing model → `unknown`, never silently `$0`. Surface renders "prices as of YYYY-MM-DD" + a soft staleness warning past N days. **Reconciliation anchor:** `claude -p --output-format json` returns `total_cost_usd` — checked against the computed $ where available.

### 6. Render (items 3, 4)

Add `session_costs?` (4-component) to the `Projection` interface; add a **Cost** block (per-session/carrier components + cache-efficiency `cache_read/total` + estimated $). **`realHasData` must include cost/reconciliation fields** so a cost-only projection isn't discarded for the sample view. New `build-analytics.test.ts` (none exists) asserting: `total=0`→"—" not NaN; missing model→"unknown" not "$0"; malformed `pricing.json`→degrade not crash; 4-component sum = total within tolerance; hostile-fixture sanitisation parity with the publisher.

### 7. Reconciliation — coverage + inequality (not strict superset)

The spec's strict `tokens_per_session ⊇ Σtokens_per_iu` is **not guaranteed** across scopes (child transcript vs parent `Stop`). The invariant becomes: `Σ(child usage) ≤ session/dispatch usage + tolerance`, with explicit **missing-child / missing-session** states surfaced, plus the computed-$ vs `total_cost_usd` check. Rendered as an "instrumentation health" block. This is the tripwire that would have caught the 25× gap.

### 8. Degraded states — each names its remedy

Split the renderer's single "no events" into: no-loop-run-yet · hooks-not-installed · hook-fired-but-failed (`instrumentation-error` present) · log-unwritable · transcript-unreadable · version-incompatible · pricing-missing. Each renders a one-step remedy. The **version banner prescribes**: shows plugin version, event `v`, publisher `generator_version`, compatible range, and the imperative ("re-vendor the plugin → rerun `harness-init validate` → relaunch → rebuild") — not just "provenance mismatch."

### 9. Version gate (honest scope)

Per-event `v` + a publisher compatible-range; `generator_version` kept separate from `event_schema_version`; legacy v-less `enter`/`exit` accepted with a visible degraded banner. **Honest framing:** the gate is **forward-protective** — an *old* vendored publisher (the actual #136 failure) predates the gate and can't self-check, so #136 is additionally mitigated by the renderer surfacing the publisher-vs-events version banner. Documented as such, not claimed to "prevent" #136 retroactively.

### 10. CLI — the transcript-baseline reader (item 2)

`sg-token-usage --transcript <path> [--json] [--by-model]` → `{usage.{5 components,total}, by_model, counted_messages, deduped_message_ids, skipped_lines, warnings}`. Exit codes: 0 ok · 1 bad-invocation · 2 missing/unreadable · 3 malformed-JSONL(strict) · 4 no-usage-records · 5 unsupported-schema. CLI default **strict**; hooks run **tolerant**. Documented in `06-analytics`.

### 11. Vendoring + harness wiring (item 1 plumbing)

Factory `hooks/` (scripts + `hooks.json`) → new `vendor.ts` stage → `stack-graph-plugin/hooks/` (inside `--check` parity); `plugin.json` declares `hooks → ./hooks/hooks.json`. `harness-init`: bind absolute org-root `SG_EVENT_LOG` + host `pricing`; **`validate` adds a live-hook probe** (emit a probe event, assert it lands in the org-root log) and a plugin-active check. Fix `publish-projection.ts repoRoot()` to resolve org-root correctly under git worktrees. Plugin version bump (post-merge `chore(vendor)`).

### 12. Stop the model emitting token numbers (item 10)

Strip token-number instructions from `build.md`/`loop-runner.md`; bodies keep structural events. Preamble v0.4.0 carries the explicit do-NOT-emit list. `note`/`review-fix`: defined **with WHEN-to-emit triggers** (`review-fix` on review-gate-fail re-entry; `note` operator-discretion, **recognised-but-not-projected** — matching the publisher's ignore-unknown behaviour, not a fictitious "stream routing").

### 13. Item 6 — emit-or-descope

- **`over_budget_share`** → **EMIT** (real, with coverage denominator, on context-pressure).
- **Generative fraction** → token-level counting needs semantic judgment (banned) → deferred as a named mechanism-gated seam, **but measure the cheap deterministic reuse proxies now**: reference/script-creation count and review-re-entry decline (Codex's point — these are the factory-thesis signal and are deterministic).

## Decomposition (sprint plan)

1. `transcript-usage.ts` core + real committed transcript fixture + unit tests. *(foundation)*
2. `sg-token-usage` CLI over the core (item 2/10). *(dep 1)*
3. Hook scripts (`PostToolUse`/`SubagentStop`/`Stop`) + `hooks.json`, node, scoped, loud, `<4KB` append helper. *(dep 1)*
4. Publisher: 4-component `SessionCostPoint`+allowlist; latest-per-session cumulative handling; reject model-authored token keys; reconciliation field; `v`/version-gate; `repoRoot()` worktree fix. *(dep 3 shapes)* + extend `publish-projection.test.ts`.
5. Renderer: `Projection.session_costs`; Cost block + cache-efficiency + $; `pricing.json`; `realHasData` includes cost; split degraded states + prescriptive banner. New `build-analytics.test.ts`. *(dep 4)*
6. `measure-outcomes` `over_budget_share` + coverage denominator + reuse-proxy metrics. *(dep 1,4)*
7. `vendor.ts` hooks stage + `plugin.json` hooks + plugin bump. *(dep 3)*
8. `harness-init` org-root `SG_EVENT_LOG` + pricing binding + live-hook-probe `validate`. *(dep 7)*
9. Spec amendments (06/02/03/04/07 + preamble v0.4.0 + `note`/`review-fix` + generative-fraction seam) + node-body edits (build, loop-runner) + **D69** in decisions.

## Acceptance (maps to #21 + review)

- [ ] A hook (not the model) writes per-IU/per-session usage from real data (`PostToolUse` native / transcript summer); values non-round, match transcript totals within tolerance; **bun/node-missing fails loud** (`instrumentation-error`), never silent.
- [ ] `sg-token-usage` CLI exists + documented; per-session total/cost derivable; the four error cases behave.
- [ ] Cost surface renders 4 components + cache-efficiency + estimated-$ (labeled, `verified_on`); no token figure from model judgment; publisher rejects model-authored token keys.
- [ ] Reconciliation surfaces coverage + Σchild≤session and computed-$ vs `total_cost_usd`, flags divergence + missing-usage states.
- [ ] Preamble/publisher versions reconciled; per-event-kind version gate + prescriptive degraded banner; all live event kinds (incl `note`/`review-fix`) documented.
- [ ] **End-to-end:** clean harness → vendor → `harness-init validate` (hook-aware) → one dispatched IU → a non-round `unit-usage` lands in the **org-root** log → Cost view shows components + cache-share + $-or-actionable-unknown. **Failure paths** (bun/node absent, plugin not enabled, worktree cwd, stale publisher, unreadable transcript, stale model-authored token key) each produce a visible, prescriptive state — never an empty surface.

## Review trail (autoplan, dual-voice)

CEO/eng/DX × (Claude + Codex). Both models: diagnosis correct, thesis sound, first draft not buildable as-written — all load-bearing findings folded in above. Key corrections: `PostToolUse`-native-primary mechanism; `Stop` is per-turn (cumulative); body-owns-structural / hook-owns-cost split (no double-emit, named D57/D59 amendment); drop the fuzzy join; loud-fail hooks; three distinct metrics; coverage+inequality reconciliation; real-transcript fixture; org-root abs path + worktree `repoRoot()` fix; `<4KB` append; publisher token-key rejection; prescriptive degraded states; CLI contract; live-hook-probe validate; D68→D69; node-over-bun; reuse-proxy metrics now. CEO scope challenge → user reaffirmed **full build**; pricing method pinned to Anthropic billing convention (this rev).
