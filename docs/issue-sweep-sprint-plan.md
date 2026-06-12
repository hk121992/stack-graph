# Issue-sweep sprint plan — #23 / #26 / #27 / #28 / #29

**Status:** decisions resolved (triage session 2026-06-12); implementation not started.
**Branch:** stack on `graph/token-instrumentation` (so #28 builds on #21's hook tree). Rebase onto
`main` once PR #25 lands.
**Decision number:** next free — **D70** (D68 = curator integrate, D69 = token instrumentation).
The implementation session logs D70 (or splits per-cluster D70/D71/… at its discretion) in
`docs/decisions.md`.

This doc is the authoritative hand-off. It carries every resolved decision so a cold session can
build without re-litigating. It is deliberately decision-dense; per-cluster *design* docs + spec
amendments are the implementation session's first task (DESIGN → SPEC AMENDMENT → REVIEW → build).

---

## Disposition of all open issues

| # | Title (short) | Disposition | Note |
|---|---|---|---|
| #21 | Token instrumentation hook-captured | **In-flight** | Built (D69 IU1–9), PR #25 open. Merge separately. This wave stacks on its branch. |
| #23 | Vendor `harness-update` skill | **Build (this wave)** | Sibling to `harness-init`. |
| #24 | Integration merges must flow through `land` | **ON HOLD** | Deferred until the Be Civic setup is right; revisit + possibly upstream then. Do **not** build this wave. |
| #26 | Index generator no harness supplies | **Build (this wave)** | Ship a general generator (Option 1). |
| #27 | link-validator `related[]` not actionable | **Build (this wave)** | A + B + C, per resolved decisions below. |
| #28 | Friction & stall telemetry | **Build (this wave)** | Factory captures + projects; ops-review stays product-local. |
| #29 | Handoff/chip-prompt convention reference | **Build (this wave)** | Reference node + scaffold pointer. |

No issues closed. #24 is the only deferral.

---

## Resolved decisions (do not re-open)

1. **Sequencing.** All five build in one wave, stacked on `graph/token-instrumentation`. #28 needs
   #21's hook tree (`hooks/hooks.json`, `sg-token-hook.sh`, `lib/emit-usage.mjs`); the rest don't,
   but ride the same branch.
2. **#27-B (pre-existing broken `related[]`).** `integrate` escalates standing breaks **directly
   into a `raise`** — *not* gated on `introduced_by`, and *not* routed through a separate `sweep`
   run. integrate detects standing `related_slug` / `unindexable` breaks in the merged preview and
   opens a gated raise for them.
3. **#28 factory/product split.** Factory scope = **capture (hooks) + project (workspace analytics
   "Process cost" block)**. **No new judgment node** (no `measure-process`). The ops-review
   *process* stays product-local in Be Civic. No factory ops-review issue filed.
4. **#26 mechanism.** Option 1 — **ship one general, canon-root-parameterized index generator** in
   the plugin (generalize the existing `tooling/sg-handbook-curator/scripts/refresh-index.ts`), so
   any harness's curator runs the same validated generator. No new bindings-contract key. Generator
   **normalizes `related[]` on write** (couples to #27-A).
5. **#24 — ON HOLD** (see disposition). Captured for the future: the incident is **agent-driven**
   (agents act under the operator's GitHub identity, so committer identity ≠ operator-manual). The
   eventual fix is layered — ancestry backstop (factory code) + a **PreToolUse hook** that denies +
   teaches at the moment an agent runs `git merge`/`push` to an integration branch + an on-disk
   `branch-policy` doc (the durable home #29's `POL:` pointers would reference) + branch-protection
   document/validate. Build it after Be Civic shakes out, and consider upstreaming.

---

## IU decomposition

Single-agent-IU sizing (D57). One commit per IU. Acceptance is the issue's acceptance, narrowed.

### Cluster H — handbook tooling (#26 + #27)

These are coupled: the generator (H1) normalizes `related[]` on write, and the link-validator
(H2) normalizes identically before checking. Build H1→H2→H3.

- **IU-H1 — general index generator (#26 + #27-A normalize-on-write).**
  Generalize `tooling/sg-handbook-curator/scripts/refresh-index.ts` into a general generator
  parameterized by canon root, vendored into the plugin alongside the workspace renderer (the
  renderer already walks the same `content/<NN>-<section>/` tree — `workspace/renderer/lib/content.ts`).
  Wire `sg-handbook-curator refresh-index` (and the `raise`/`integrate` post-batch refresh) to
  invoke it via overlay. Generator **normalizes** each `related[]` entry on write: strip leading
  `NN-` on the final segment, `X/README`→`X`, bare `README`→root. Preserve the validated
  projection exactly (per-section README→slug, leaf→`section/page`, exclude `12-archive` + depth>1,
  keys `slug,title,type,read-when,related`, sorted by slug, `json.dumps(indent=2, ensure_ascii=True)`
  ASCII-escaping — load-bearing).
  *Acceptance:* one validated generator regenerates `index.json` byte-for-byte against the current
  canonical index from any canon root; projected `related[]` is canonical (no mixed forms).

- **IU-H2 — link-validator `related[]` actionable (#27-A + #27-C).**
  In `tooling/sg-handbook-curator/agents/link-validator.md`: (A) state that `related[]` entries are
  canonicalized identically to file-path slugs (`slug_rule` final-segment `NN-` strip +
  `X/README`→`X` + bare `README`→root) **before** both `related_slug` membership and
  `related_asymmetric` pairing. (C) annotate each `related_asymmetric` finding with the target's
  **inbound-degree** and a **`net_new_in_batch`** flag; the triage view defaults to net-new +
  low-inbound (1:1 pairs), collapsing the tolerated hub/section-index baseline. Keep advisory —
  **never auto-reciprocate**.
  *Acceptance:* a canon with mixed `related[]` forms (clean / `NN-`prefixed / `X/README`) produces
  zero false `related_slug` breaks; `related_asymmetric` findings carry inbound-degree + net-new
  flags; the tolerated baseline (high-inbound hubs, child→section) is collapsed in the default view.

- **IU-H3 — integrate raises standing breaks (#27-B).**
  In the curator `integrate` mode: detect standing `related_slug` / `unindexable` breaks in the
  merged preview (independent of `introduced_by` attribution) and **escalate them directly into a
  `raise`** (no separate `sweep` run). Net-new-in-batch breaks still block the batch as today.
  *Acceptance:* a dangling `related[]` target on a page no PR touches results in a gated raise PR,
  not a perpetual triage-view line. (Be Civic's 46 dangling targets would each be raisable.)

### Cluster F — harness lifecycle (#23)

- **IU-F1 — `harness-update` skill (author + vendor).**
  New graph node `graph/harness-update/harness-update.md` (skill primitive), sibling to
  `harness-init`, vendored via `build/vendor.ts`. General, no product literals. Modes/flow:
  (1) **Detect** — compare installed version (`installed_plugins.json`) vs published (bound
  marketplace source / GitHub `.claude-plugin/plugin.json`); exit "up to date at vX.Y.Z" if equal.
  (2) **Update** — run the scope-aware `marketplace update → uninstall → install` sequence (the
  native `plugin update` is broken — see issue), confirm new `version` + `gitCommitSha` landed.
  (3) **Contract-drift check** — if `bindings-contract` `status:` version moved, invoke
  `harness-init bind` + `validate`; else say so and skip.
  (4) **Hand off** — print changelog delta since installed version + the **restart-required**
  reminder.
  *Acceptance:* one idempotent, scope-aware invocation takes a harness from version N to latest
  without the manual dance; re-binds only on contract-version change; always surfaces restart +
  the version/commit landed. Note the upstream `claude plugin update` "not found" bug in the body
  (skill works around it).

### Cluster A — friction & stall telemetry (#28) — stacks on #21

- **IU-A1 — session-end friction hook.**
  Add a `SessionEnd`/`Stop` hook (alongside #21's `hooks/`) that writes **one JSONL friction row
  per session**: permission denials + matched rule, classifier denials + reason category,
  `tool_result` error count, rejected tool calls, wakeups armed/fired. Hook-captured, never model
  prose. Same fail-loud / scope-gated / `<4KB` append discipline as the #21 hooks.
  *Acceptance:* a session with denials/rejections/wakeups produces a deterministic friction row;
  none of it originates from model judgment.

- **IU-A2 — schema-validated event append + gate-wait first-class.**
  A tiny CLI/script the skills call (or a `PostToolUse` path) to emit node enter/exit + gate events
  with **schema validation on append**: reject unknown shape, validate `ts`. Model-authored
  freeform rows rejected. Add **`gate-open` / `gate-closed`** events carrying the blocking
  condition, so overnight human-gate stalls fall out of a query (the 14h stall in the evidence was
  invisible). Document the foreign-schema / fabricated-timestamp failure mode this closes.
  *Acceptance:* an append with an unknown shape or malformed `ts` is rejected; a gate wait emits
  paired `gate-open`/`gate-closed` with the condition; stall duration is derivable from the log.

- **IU-A3 — workspace analytics "Process cost" block.**
  `workspace/renderer/publish-projection.ts` computes a process-cost series from the friction +
  gate events; `workspace/renderer/build-analytics.ts` renders a **"Process cost" block** (sibling
  to #21's Cost block): denial counts (by rule/category), stall time, dangling/unpaired spans,
  rejected-call count. Keep the publisher↔build-analytics allowlists in lockstep (the in-file
  comments mandate it). **No judgment node** — deterministic projection only.
  *Acceptance:* the analytics surface renders a process-cost view from real events; ops-review
  reads it; nothing is model-emitted.

- **IU-A4 — preamble + spec amendment (#28).**
  Document the new event kinds (`friction-record`, `gate-open`, `gate-closed`) in
  `graph/_refs/instrumentation-preamble.md` (bump version), reconcile against the live kinds, and
  amend `06-analytics` (the process/friction layer + the deterministic-not-model-emitted invariant).
  *Acceptance:* every live event kind is documented; preamble version bumped; `06-analytics`
  describes the process layer.

### Cluster C — handoff convention (#29)

- **IU-C1 — `handoff-prompt-convention` reference + scaffold pointer.**
  New `graph/_refs/handoff-prompt-convention.md` reference node: the delta-only field form
  (`GOAL / WHERE / DO / DONE-WHEN / POL / EPH(<date>)`) + rules (delta only, ≤150 words, paths over
  prose, **policy by pointer never by copy**, `POL:` refs resolve cold — on-disk only never project
  memory, `EPH(<date>)` for expiring facts). `harness-init scaffold` writes the **one-line pointer**
  into the harness root CLAUDE.md (single always-on cost). Note that the same convention covers
  loop-runner dispatch prompts + return envelopes (light cross-ref — it's the single home for
  cold-handoff doctrine). Vendor it.
  *Acceptance:* the reference exists + vendors; `harness-init scaffold` emits the pointer line; a
  real chip compresses to the field form with policy by pointer.

### Cluster Z — vendor + close-out

- **IU-Z1 — re-vendor + records + decisions.**
  Run `build/vendor.ts` (bump plugin version; vendor the new/changed skills `harness-update` +
  `harness-init`, the index generator, the new hook, the workspace renderer process block, the new
  reference). Pass G1 (idempotency `--check`) + G2 (load-verify) gates. Update
  `graph/graph-record.json` (new node + ref counts). Log **D70** (+ any split) in `docs/decisions.md`.
  *Acceptance:* `vendor.ts --check` clean; graph-record parity holds; decisions logged; plugin
  version bumped with the changelog delta.

---

## Spec touchpoints (implementation session fills the amendment table per cluster)

- #26/#27 → `05-maintenance-skill` (the generator + link-validator contract), `bindings-contract`
  (document `handbook-index` as path + the generator is plugin-shipped, no new key).
- #28 → `06-analytics` (process/friction layer), `instrumentation-preamble`.
- #23 → `03-plugin-spec` (install/update lifecycle), `04-harness-spec` (harness-update alongside
  harness-init).
- #29 → new reference; `04-harness-spec` (scaffold writes the pointer).

Attach both the per-cluster design doc **and** its spec-amendment proposal when invoking
`/plan-eng-review` / `/autoplan` (spec-first discipline).

---

## Dependencies & order

```
#21 (PR #25) ──merge──► rebase wave onto main
        │
        └─ A1 ─► A2 ─► A3 ─► A4        (cluster A stacks on #21's hooks)
H1 ─► H2 ─► H3                          (handbook; H1 normalize-on-write feeds H2)
F1                                      (independent)
C1                                      (independent; shares "policy by pointer" idea with held #24)
        ↓
        Z1  (re-vendor + records + decisions — last)
```

Independent clusters (H, F, C) can be dispatched in parallel by `loop-runner`; cluster A is internally
ordered. Z1 is last (it vendors everything).

## Notes for the implementation session

- This is factory-self-development (08-devops) — the work lands by per-IU commits on the wave
  branch; `loop-runner` may dispatch the independent IUs in parallel.
- Run the per-cluster DESIGN + SPEC AMENDMENT + `/autoplan` review **before** building each cluster
  (the decisions here are settled; the detailed design + review are not).
- The `.bak` files in `graph/_refs/` and `tooling/sg-handbook-curator/` are pre-existing stray —
  out of scope, leave or clean separately.
- Companion out-of-boundary handoff: re-vendor into bc-workspace after the plugin version bump
  (same pattern as bc-workspace#136 for #21).
