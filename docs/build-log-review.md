---
title: Build log — the `review` composed artefact (first-artefact learnings)
status: complete (core) — 2026-05-30
---

# Build log — `review` (first composed artefact)

`review` is the first artefact built through `sg-graph-maintainer`, chosen as the learning
vehicle because it exercises the most machinery: an orchestrator **skill** fanning out to N
isolated **lens agents**, the **block/resolver** injection model, and the **finding
contract**. This log records what the build taught us — tooling findings feed back into the
maintainer skill and the specs.

## Progress

| piece | kind | status |
|---|---|---|
| `lens-correctness` | agent node | ✅ authored + validated (full maintainer walk) |
| `lens-security` | agent node | ✅ authored + validated (parallel family derive) |
| `lens-tests` | agent node | ✅ authored + validated (parallel family derive) |
| `lens-maintainability` | agent node | ✅ authored + validated (parallel family derive) |
| `findings-schema` / `severity-scale` / `confidence-anchors` | blocks | ✅ authored at `graph/_blocks/` (D33) |
| `lens-dispatch` | block | ✅ authored at `graph/_blocks/` (D33) |
| `review` | orchestrator skill | ✅ authored + validated (full maintainer walk) |
| `graph/graph-record.json` | index | ✅ 5 nodes + 4 blocks, 34 edges, 0 unresolved |

**Core composed artefact complete.** `review` fans out to the four always-on lenses via the
injected `{{lens-dispatch}}` block; all four lenses share the finding-contract blocks; the
index materialises the whole thing including `uses-block` dependencies (e.g. `confidence-anchors`
resolves to 6 consumers as a graph query). Deferred (not dropped): the 6 conditional lenses
(performance/design/dx/runtime/adversarial/external) replicate the proven lens pattern; the
backbone process edges wire in when `build`/`reconcile` exist (F7).

## What worked

- **The maintainer pipeline holds.** researcher (opus) → translator (opus) → validator
  (sonnet) produced a conformant, genuinely useful node with no rework. The
  research-report → canonical separation (synthesise from the report, never copy
  source-material) produced a clean body.
- **Spec-correct block modelling validates clean.** The shared finding contract enters the
  lens body as `{{findings-schema}}`-style resolver placeholders, **not** `references`
  edges. Validator check (d) passed with no unresolved targets. This is the right pattern.
- **Leaf-agent edge minimalism.** The lens declares only `composes-into dev-sprint`
  (review/design/plan stages) and no back-edge to the dispatch — avoiding the D4 structural
  cycle. The one-way `dispatch invokes lens` relationship is correct.

## Findings (feed back into tooling / specs)

- **F1 — resolver/block home is unspecified (the real open decision).**
  `03-plugin-spec` describes *expanding* `{{...}}` resolvers at build but never says where
  the define-once block **source** lives in `graph/`, nor how a block is authored (the
  maintainer has `new/amend/validate/index` for *nodes* only — no block path). Blocks are
  not nodes (no `edges`/`goals`), so they need their own home + a light authoring path.
  Sub-question raised by the validator: a block dependency (lens → findings-schema) is
  currently **invisible in the graph record** — see F6.
- **F2 — `new` assumes in-repo source material.** `researcher.md`'s "likely locations" list
  is repo-relative (`skills/`, `agents/`), but the factory's first nodes source from
  **external reference projects** (gstack `~/.claude/skills/gstack/`, CE
  `~/scratch/ce-plugin/...`). Worked once given explicit paths in the scope hint; the
  maintainer should document the external-source pattern.
- **F3 — `references`-to-non-node validation (resolved by modelling).** Validator check (d)
  resolves every `references` target to a node file. Non-node refs (blocks, `decisions-store`)
  would fail. Resolution: model blocks as `{{placeholders}}` (not edges); model genuine
  non-node references with `external: true`. No validator change needed if authors follow this.
- **F4 — "workflow" vocab lingers.** `validator.md` / `node-template.md` still say
  `composes-into` targets a "workflow id" (pre-`arc`-rename, D28). Cosmetic; fix in the
  pending tooling arc-rename.
- **F5 — the lens family has no "sibling/family" authoring path (confirmed in practice).**
  `lens-security`, `lens-tests`, `lens-maintainability` share ~90% of `lens-correctness`'s
  body (same spawn bundle, same contract, same calibration discipline) — they differ only in
  the hunt-list, activation, and dimension boundary. We authored the three siblings as a
  **parallel family-derive** (three single-agent passes, each `report → canonical` mirroring
  the template) rather than three full researcher+translator walks — faster, cheaper, and a
  truer reflection that they are one parameterised family. **Recommendation:** give the
  maintainer a `family`/`derive <id> --from <template-id>` mode that formalises this (or model
  a family as one node with a `dimension` parameter). The full `new` walk stays the path for
  a genuinely novel node.
- **F7 — process edges can't be authored before both endpoints exist (confirmed).** `review`
  could not declare its backbone `precedes`/`can-follow` edges (build→review→reconcile, the
  review→build fix loop) because `build`/`reconcile` don't exist yet and `validate` resolves
  process-edge targets to node files. We deferred them (the fix-loop behaviour is described in
  `review`'s body prose) and they wire in via a later `amend`. **Generalises:** author backbone
  stages in arc order, or add a final "wire-up" amend pass once all stages exist. Worth a note
  in the maintainer's `new` mode.
- **F6 — blocks are invisible to the graph record / loop.** Because a block is injected as
  body text (not an edge), the graph record shows no `lens-correctness → findings-schema`
  dependency. Impact analysis ("what breaks if I change the finding contract?") and
  instrumentation cannot see it. Decision needed: keep blocks invisible build-text, or give
  them a lightweight graph presence (e.g. a `uses-block` reference the record tracks).

## Factory-loop resolution (tooling hardened)

The findings fed straight back into `sg-graph-maintainer` (the improve-the-factory loop):

- **F1 + D33** → `block` mode added (authors `graph/_blocks/<id>.md`); `index` scans
  `{{placeholder}}` tokens → `uses-block` edges; `validate` resolves placeholders to blocks.
  Specs `02`/`03`/`05` amended; `decisions.md` D33 recorded.
- **F5** → `family` mode + `agents/family-author.md` added — derive N siblings from a template
  in parallel, the path we used by hand for the three sibling lenses.
- **F4** → `composes-into` "workflow" vocab corrected to "arc" in `validator.md` + the node
  template.
- **F7** → a hard constraint added to `new`: defer process edges whose endpoint does not exist;
  author backbone stages in arc order; wire up by `amend`.
- **F2** (external source material) and **F6** (now subsumed by D33) remain documented; F2 is a
  doc-only nicety (pass external paths in the scope hint), not yet codified.

## Decisions taken during the build

_(recorded here, promoted to `decisions.md` once confirmed)_

- Lens family is **target-parameterised** (`target ∈ {diff, doc}` as a body mode), not split
  into doc/diff sibling nodes (D27 confirmed in practice).
- Lens agents are structural **leaves**: `composes-into` only; no back-edges; no
  invokes/loads/precedes.

## Model pivot — blocks → references (D33 rewritten)

The seam we diagnosed in `review.md` (`{{lens-dispatch}}` spliced mid-body) prompted the
question "why a block and not a skill?" — which opened a full investigation (the
skill-vs-reference-vs-injection study across CE, ECC, gstack, and the Claude Code docs). The
finding: **build-time injection is not a native primitive and has no runtime niche** —
`@-import` (load-time, guaranteed, single-source) covers must-be-present, and on-demand
references cover consult-at-a-step. CE and ECC are both pure-native; gstack's resolver layer is
a third-party invention justified only by authoring freshness.

**Outcome: D33 was rewritten** — the injected-`block` primitive is dropped. Shared content is a
native **reference** (`graph/_refs/<id>.md`, `kind: reference`) depended on via a `references`
edge with a **load dial** (`import` = `@-import`; `on-demand` = read-at-step); the build
single-sources it into consumers. Agent-bound content (a lens's finding contract) is passed by
the orchestrator in the **spawn prompt**. The reworked artefact:

- `graph/_blocks/` → `graph/_refs/` (4 references, `kind: reference`); no `{{placeholders}}`.
- `review` declares `references:` (lens-dispatch `on-demand`; finding-contract trio `import`);
  Phase 2 now reads as clean prose — the seam is gone.
- lenses receive the finding contract via the spawn prompt (no per-lens contract edges).
- specs `02`/`03`/`05`, `node-schema`, the maintainer (`block` mode → `reference` mode;
  `index`/`validate` over references), `graph-map`, and `06-analytics` (preamble = `@-import` +
  hook) all reconciled. Record regenerated: 5 nodes / 4 references / 21 edges, 0 unresolved.

This is the biggest lesson of the first artefact: building it surfaced a non-native primitive we'd
half-adopted, and the cross-project evidence corrected it to a fully-native model.

**Follow-up debt (records lag the canon):** the **research records** still carry superseded
framing — the per-node `research-report.md` files describe the old block/`{{placeholder}}`
model (D33), and `docs/graph-design.md` still describes **modes-as-nodes** (D34). The rework
touched the canon — node/reference files, the handbook specs (`01`/`02`/`03`/`05`/`07`),
`decisions.md` (D33 rewritten, D34 added, D22 annotated), `graph-map.md`, and the maintainer
tooling — but not these large internal research inputs. **Resolved 2026-05-30** — the five
`research-report.md` records and `docs/graph-design.md` were resynced to the references + 1:1
model (superseded framing replaced, substance preserved, the historical supersession noted).
</content>
</invoke>
