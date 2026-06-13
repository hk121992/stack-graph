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

> ## ⚠️ AMENDMENT (2026-06-12) — Cluster A re-scoped; #21 retired
> The original **Cluster A (#28)** below — a hook-stacking design with IUs **A1–A4** that stacks on
> #21's hook tree — has been **superseded** by a unified, deterministic **transcript-derived batch
> analyzer** (operator decision). The new design is
> [`docs/issue-sweep-designs/cluster-A-unified-analytics.md`](issue-sweep-designs/cluster-A-unified-analytics.md)
> (+ its spec amendment), with IUs **A1–A6**. Consequences that override the text below:
> - **#21 is retired, not stacked-on.** PR #25 will **not** merge; #21's transcript-usage *core* is
>   reused by the analyzer, the hook tree is deleted. So "rebase onto main after #25 lands" no longer
>   applies — the wave's final PR-vs-`main` carries #21's preserved core + the analyzer (hooks add-then-
>   removed in history; net tree clean), and #25 is closed.
> - **No new hooks anywhere.** The session-end friction hook (A1), the schema-validated append + the
>   `gate-open`/`gate-closed` inline events (A2) are **gone** — friction/stalls are *derived from
>   transcripts in batch*, not emitted. `instrumentation-preamble` is retired as a runtime emit
>   contract; backbone nodes stop emitting events.
> - **Clusters H, F, C are unaffected** by this amendment and built as specified.
>
> The Cluster A IU section below is **replaced** by the A1–A6 list in the unified-analytics design;
> the inline `### Cluster A` heading carries a SUPERSEDED pointer. Other clusters' text stands.

---

## Disposition of all open issues

| # | Title (short) | Disposition | Note |
|---|---|---|---|
| #21 | Token instrumentation hook-captured | **RETIRED** (see amendment) | PR #25 will **not** merge; the hook tree is deleted by Cluster A's A6. #21's `transcript-usage.ts` core is preserved + reused by the unified analyzer. |
| #23 | Vendor `harness-update` skill | **Build (this wave)** | Sibling to `harness-init`. |
| #24 | Integration merges must flow through `land` | **ON HOLD** | Deferred until the Be Civic setup is right; revisit + possibly upstream then. Do **not** build this wave. |
| #26 | Index generator no harness supplies | **Build (this wave)** | Ship a general generator (Option 1). |
| #27 | link-validator `related[]` not actionable | **Build (this wave)** | A + B + C, per resolved decisions below. |
| #28 | Friction & stall telemetry | **Build (this wave — re-scoped)** | Unified transcript-derived batch analyzer (supersedes the hook design + #21); see amendment + `cluster-A-unified-analytics.md`. Ops-review stays product-local. |
| #29 | Handoff/chip-prompt convention reference | **Build (this wave)** | Reference node + scaffold pointer. |

No issues closed. #24 is the only deferral.

---

## Resolved decisions (do not re-open)

1. **Sequencing.** All five build in one wave on the `issue-sweep-wave` branch (off
   `graph/token-instrumentation`). ~~#28 needs #21's hook tree~~ **(SUPERSEDED — see amendment:** #28
   is re-scoped to a transcript-batch analyzer that **retires** #21's hook tree rather than stacking on
   it; the analyzer reuses #21's preserved `transcript-usage.ts` core.) H/F/C are independent and built.
2. **#27-B (pre-existing broken `related[]`).** `integrate` escalates standing breaks **directly
   into a `raise`** — *not* gated on `introduced_by`, and *not* routed through a separate `sweep`
   run. integrate detects standing `related_slug` / `unindexable` breaks in the merged preview and
   opens a gated raise for them.
3. **#28 factory/product split.** Factory scope = **capture + project (workspace analytics "Process
   cost" block)**. **No new judgment node** (no `measure-process`). The ops-review *process* stays
   product-local in Be Civic. No factory ops-review issue filed. **(AMENDED — see amendment:** "capture"
   is now a deterministic transcript-batch analyzer, **not hooks**; the split and the no-judgment-node
   ruling stand.)
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

### Cluster A — ⛔ SUPERSEDED → unified transcript-derived analytics (#28, supersedes #21)

> **The hook-stacking A1–A4 below are RETIRED.** Build the unified analyzer instead:
> **[`docs/issue-sweep-designs/cluster-A-unified-analytics.md`](issue-sweep-designs/cluster-A-unified-analytics.md)**
> (+ [`cluster-A-unified-analytics-amendment.md`](issue-sweep-designs/cluster-A-unified-analytics-amendment.md)).
> One deterministic, scheduled (~1–2×/day) batch analyzer reads the session transcripts and derives
> the **entire** substrate — tokens/cost (reusing #21's preserved `transcript-usage.ts` core),
> friction, stalls, node-activity, attribution. **No hooks, no inline emission.** #21's hook tree is
> deleted; PR #25 will not merge.

**New IU decomposition (A1–A6 — replaces A1–A4):**

- **IU-A1 — analyzer core + cursor**, reusing `workspace/renderer/lib/transcript-usage.ts`. Walk
  `SG_TRANSCRIPT_ROOT`, emit `unit/session/dispatch-usage` rows to
  `.stack-graph/derived/analyzer-events.jsonl`, advance the cursor.
  *Acceptance:* emits the same token rows #21's hooks would; a second run is byte-identical (idempotent).
- **IU-A2 — friction + permission-decision extraction.** Per-session `friction-record` rows (denials,
  rejected calls, tool errors, `permissionDecision`/`Reason`/`Mode`), categorised counts only, no free-text.
  *Acceptance:* a fixture with a hard denial / user rejection / tool error / `permissionDecision` yields
  correct counts; absent fields degrade to 0, none model-filled.
- **IU-A3 — node-activity + attribution from dispatch prompts.** Skill/slash/Task spans → enter/exit/
  duration (coalescing `attributionSkill`); dispatch-prompt envelope parse → carrier triple (the
  **C-convergence**: attribution reads cluster C's handoff envelope); session-level + null fallback.
  *Acceptance:* a dispatched-session fixture attributes the correct `(carrier,kind,arc)`; non-dispatched
  falls back to session-level/null; the browse-toggle fixture coalesces to one span.
- **IU-A4 — stall derivation.** Cross-session timestamp-gap `stall-record` rows over the threshold dial,
  gate-tagged where the pre-gap node is gate-holding (the 14h stall falls out).
  *Acceptance:* a 14h cross-session gap on a gate-holding node yields one `stall-record` with the gap +
  node tag; sub-threshold gaps yield none.
- **IU-A5 — publisher + renderer integration ("Process cost" block).** `publish-projection.ts`:
  `FRICTION_KINDS` + `FRICTION_KEYS` + the `process_costs` read path (token/activity paths unchanged).
  `build-analytics.ts`: `processCostSection` + lockstep `FRICTION_KEYS`. Cost block + reconciliation now
  render from analyzer rows. **No judgment node** — deterministic projection only.
  *Acceptance:* analyzer→publish→build renders both a Cost block and a Process-cost block; hostile-fixture
  sanitisation drops bad rows exactly as the usage path does.
- **IU-A6 — config + harness-init registration + spec amendment + #21 hook retirement.**
  `SG_TRANSCRIPT_ROOT` env + `harness-init scaffold` step 5c (scheduled-task registration) + validate
  analyzer dry-run probe. Delete `hooks/` tree + `plugin.json` hooks decl + the vendor hook step; retire
  `instrumentation-preamble` as a runtime contract (extract surviving vocabulary into `analytics-vocabulary`,
  drop the `load: import` edges from backbone nodes). Amend `06-analytics` + `instrumentation-preamble`.
  *Acceptance:* `harness-init validate` registers the task + passes the dry-run probe; the hooks tree is
  gone and vendor no longer copies it; the spec describes the single transcript-derived source; no backbone
  node imports the preamble.

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
  `harness-init`, the index generator, the workspace renderer process block + the unified analyzer,
  the new references). **Vendor stops copying the `hooks/` tree** (A6 retires it; remove the
  `plugin.json` hooks decl). Pass G1 (idempotency `--check`) + G2 (load-verify) gates. Update
  `graph/graph-record.json` (new node + ref counts, incl. `handoff-prompt-convention`,
  `analytics-vocabulary`, the dropped `instrumentation-preamble` import edges). Log **D70** (+ any
  split) in `docs/decisions.md`.
  *Acceptance:* `vendor.ts --check` clean; graph-record parity holds; decisions logged; plugin
  version bumped with the changelog delta.

---

## Spec touchpoints (implementation session fills the amendment table per cluster)

- #26/#27 → `05-maintenance-skill` (the generator + link-validator contract), `bindings-contract`
  (document `handbook-index` as path + the generator is plugin-shipped, no new key).
- #28 → `06-analytics` (single transcript-derived source; process/friction/stall/node-activity layers),
  `instrumentation-preamble` (**retired** as a runtime emit contract), `bindings-contract`
  (`SG_TRANSCRIPT_ROOT` env + scheduled-task; remove the hook-activation env). See the unified-analytics
  amendment doc.
- #23 → `03-plugin-spec` (install/update lifecycle), `04-harness-spec` (harness-update alongside
  harness-init).
- #29 → new reference; `04-harness-spec` (scaffold writes the pointer).

Attach both the per-cluster design doc **and** its spec-amendment proposal when invoking
`/plan-eng-review` / `/autoplan` (spec-first discipline).

---

## Dependencies & order

```
H1 ─► H2 ─► H3                          (handbook; H1 normalize-on-write feeds H2)   [BUILT]
F1                                      (independent)                                [BUILT]
C1                                      (independent; the handoff envelope feeds A3's attribution) [BUILT]
A1 ─► A2 · A3 · A4 ─► A5 ─► A6          (unified analyzer; A2/A3/A4 independent on A1's spine;
                                         A6 retires #21 + amends spec. NOT stacked on hooks — retires them.)
        ↓
        Z1  (re-vendor [no hooks] + records + decisions — last)
```
Note: #21/PR #25 is **retired, not merged** — the wave's final PR-vs-`main` carries #21's preserved
core + the analyzer (hooks add-then-removed in history; net tree clean), closing #25.

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
