---
title: Dev-sprint front — authoring spec (align-context / design / specify)
status: working draft — 2026-06-01
---

# Dev-sprint front — authoring spec

The three collaborative front stages of the dev-sprint, designed (Thread B) and governed. This is the
authoring source for the three node files. General concepts: `handbook/content/01-concepts` (carriers &
gates; the reference layer; experience), `07-decomposition` (functions-as-packs; lens / thread shapes);
the map is `docs/graph-map.md`. Mirror `graph/review/review.md` (a collaborative skill orchestrating the
lens family) and `graph/explore/explore.md` for node shape and voice. All three: `primitive: skill`,
`mode: collaborative`, `determinism: generative`.

## Governed decisions (locked — author to these)

- **Carrier touch = projected model.** The front stages **read** the carrier (the roadmap item) for
  context and **emit** node-enter/-exit events (the built-in instrumentation); they carry **no
  write-edge** to the carrier. `current_stage` + `transition_history` are **projected from the observed
  traversal**, not written by a stage or a curator. Gates (advancing `lifecycle_state` + recording a
  `gate_decision`) are PM/operator decisions, not a stage's job. Each node's body says: "you do not write
  the carrier — you read it for context; completing this stage is the signal the projection/curator picks
  up."
- **`design` reuses `review`'s `lens-dispatch`** (does NOT direct-invoke the lenses): the lenses already
  declare `composes-into @design`; `design` holds the `lens-dispatch` reference + the finding contract and
  dispatches with `target: doc`, **strategy-first then parallel**.
- **`product-lens` is built separately** (PM pack). `design` leaves the strategy-check seam open in prose
  — no edge to a non-existent node (F7).
- **`align-context` is per-task context only**; session orientation is harness instructions, not a node.
- **`specify` → canon**: `specify` authors the spec amendment and opens a **labelled PR via `pr-author`
  into the shared queue** the curator's `integrate` gates. `specify` is a primary canon author; many
  raisers, one queue, one integrate gate.
- **experience-contract at `design`**: `design` references `experience-contract-schema` (factory ref — the
  shape) + `experience-contract` (external — the harness's content) and **authors/refines the contract**
  (to the harness surface, via bindings) in its `experience` mode.
- **Touchpoints inlined** for now (extracting a `spec-touchpoints-table` reference is deferred — minor).
- **Process edges:** author `align-context precedes design` and `design precedes specify` now (endpoints
  exist); defer everything crossing the front boundary (`precedes plan`, `can-follow debrief`) per F7,
  describing them in prose.

## align-context

**Goals**
- Shared, correct intent + constraints before design. *Metric:* design/specify rework traced to
  mis-stated intent; share of intent statements surviving to `specify` unamended. *Earns-keep:*
  "intent was wrong" rework below the pre-front baseline.
- Context gathered once and reused (the front does not re-explore). *Metric:* re-exploration rate across
  the front. *Earns-keep:* re-exploration trends to zero.
- A real alignment gate, not a rubber stamp. *Metric:* scope-change events after align-context closes.
  *Earns-keep:* late scope surprises trend down.

**Modes (body branches):** `lightweight` (known small item; thin explore, one-turn intent confirm) ·
`standard` (default: read carrier + personas + value-prop; explore repo + learnings; interrogate intent)
· `deep` (novel/ambiguous: + explore framework-docs/web/best-practices; multiple operator rounds;
surface assumptions) · `spec` (spec-layout product: + read the relevant handbook sections + decisions for
settled intent, capture a starting touchpoint set for `specify`).

**Edges:** `composes-into dev-sprint @align-context`; `invokes explore`; `references handbook`
(`load: on-demand, external: true`). Reads the carrier + personas + value-prop via bindings (no edge —
harness surfaces). `precedes design` (author now). `can-follow debrief` deferred (F7) — prose: re-entered
when a debrief seeds the next sprint.

**Carrier:** reads the carrier (its `lifecycle_state`, prior `transition_history`) for context; does not
advance it — entry into the in-delivery window is a PM gate; align-context operates inside that window.

## design

The **shared PM + eng/design front** — the product lens and the code/design lenses converge here over the
same carrier + experience-contract.

**Goals**
- Load-bearing design questions resolved by intended outcome before specify/plan. *Metric:* design
  decisions recorded/session; design-rework after specify/plan from an unresolved question. *Earns-keep:*
  downstream design-rework below baseline.
- The solution checked against value-prop/target-user and code-correctness/feasibility *at item level*
  (the four risks at the item altitude). *Metric:* share of design sessions where the lenses + the
  product-lens surfaced ≥1 actioned finding; risks unexamined at design that bit at build. *Earns-keep:*
  design-stage findings displace later build/review findings.
- A design doc with an explicit **Spec touchpoints** table, ready for `specify`. *Metric:* share carrying
  a touchpoints table; touchpoints `specify` finds missing. *Earns-keep:* `specify` rarely reconstructs
  touchpoints.
- The **experience-contract** for the item is authored/refined here. *Metric:* share of experience-bearing
  items whose contract was authored at design vs discovered missing at verify. *Earns-keep:*
  `simulate-users` rarely runs against a missing/stale contract.

**Modes:** `lightweight` (resolve inline, light doc, always-on doc lenses only) · `standard` (default:
explore for gaps; dispatch the lens family over the doc strategy-first then parallel; author doc +
touchpoints) · `deep` (novel/contested: multiple operator rounds, adversarial lens on) · `experience`
(author/refine the experience-contract — UX invariants + failure modes + AX budgets + intended tool-path —
for an experience-bearing item; the thread-spanning branch).

**Edges:** `composes-into dev-sprint @design`; `invokes explore`; `references lens-dispatch`
(`on-demand`) + `findings-schema` / `severity-scale` / `confidence-anchors` (`import`) + `handbook`
(`external, on-demand`) + `experience-contract-schema` (`on-demand` — the shape it authors by) +
`experience-contract` (`external, on-demand` — the harness's contract it reads/refines). Does NOT invoke
the lenses (they compose into `@design`; design follows `lens-dispatch` with `target: doc`). The
**product-lens** composes into `@design` from its own side (built separately) — leave the seam in prose,
no edge. `can-follow align-context`; `precedes specify` (author now); `precedes plan` deferred (F7).

**Carrier:** reads the carrier + experience-contract; writes the design doc / touchpoints / contract to
harness surfaces (not the carrier); no carrier write-edge.

## specify

**Goals**
- The design becomes a canonical spec amendment with explicit touchpoints, so build implements against
  settled spec. *Metric:* share entering plan/build with a landed/queued amendment + touchpoints;
  build-stage "spec ambiguous/wrong" rework. *Earns-keep:* spec-ambiguity rework below baseline.
- Amendment collisions / canon drift caught before the amendment lands. *Metric:* collisions
  `drift-detector` surfaces vs found post-hoc; duplicate/colliding spec PRs. *Earns-keep:* post-hoc
  collisions trend to zero.
- The amendment reaches canon through one gated path. *Metric:* share landed via a `pr-author`-composed
  labelled PR vs out-of-band. *Earns-keep:* out-of-band spec edits trend to zero.

**Modes:** `spec-layout` (default when a spec layout exists: `drift-detector` over the touchpoints; author
the amendment; `pr-author` composes the PR body; open the **labelled PR into the shared canon queue** the
curator's `integrate` gates) · `null` (no spec layout: record touchpoints/decisions inline, advance the
work, no amendment PR) · `amend-existing` (revise an existing section; `drift-detector` focuses there).

**Edges:** `composes-into dev-sprint @specify`; `invokes drift-detector`; `invokes pr-author`;
`references handbook` (`external, on-demand`). Touchpoints inlined (no `spec-touchpoints-table` ref yet).
`can-follow design`; `precedes plan` deferred (F7).

**Carrier:** reads the design doc + carrier; emits a stage-complete signal (the projection advances
`current_stage`); does not write the carrier. Completing `specify` is what moves the item toward gate-2
(commit-to-build), a PM/operator decision.
