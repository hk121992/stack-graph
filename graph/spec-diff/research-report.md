---
title: Research report for spec-diff
type: research-report
status: complete
authored: 2026-06-01
last_updated: 2026-06-03
amended:
  - date: 2026-06-03
    note: "Backfill: external corpus search completed (gstack review + CE ce-code-review lifted); source-material/ created; External analogues searched table added; Challenge findings section added; all template sections populated."
  - date: 2026-06-04
    note: "Tier-1 amend batch 2 (cluster-A reconciliation): enacted CF-1 (changed status + precision-gate rule), CF-2 (verification-mode classification before scoring; EXTERNAL-STATE/CROSS-ARTEFACT -> out_of_scope, never missing), CF-4 (unverifiable status carrying the manual check in gap; fixes the missing-artefact-forced-to-missing bug), CF-5 (precision gate reworded to reference changed). Converted severity from low/med/high to P0-P3 per D58 + severity-scale.md v0.2.0; status enum settles to met|changed|missing|unverifiable|out_of_scope. CF-3/CF-6/CF-7 NOT enacted in this batch (CF-3 deferred; CF-6/CF-7 are LOW). Status -> v0.2.0."
sources_lifted: 2
external_analogue_found: true
external_corpora_searched:
  - "gstack live skills (/home/gstack/.claude/skills/gstack/)"
  - "CE plugin (/home/gstack/scratch/ce-plugin/plugins/compound-engineering/skills/)"
  - "be-civic harness (/home/gstack/projects/be-civic/)"
  - "Published best practice (web: Kiro spec-driven dev docs, arxiv spec-as-quality-gate 2603.25773, requirements traceability / RTM literature, spec-driven development guides)"
researcher_adequacy_note: |
  Two strong external analogues were found and lifted verbatim: gstack /review (Plan
  Completion Audit section, lines ~840–970) and CE ce-code-review (Stage 2b + Stage 6 §3).
  Both do exactly what spec-diff does — compare a built change against a plan's stated
  deliverables and return a structured per-item verdict. The key structural difference: both
  analogues embed the comparison inside a larger interactive review skill; spec-diff extracts
  it as a standalone stateless autonomous agent. Web searches confirmed the domain
  (spec-driven development, RTM, acceptance-criteria verification) has mature published practice
  around verification taxonomies (satisfied/partial/missing), confidence/precision gates, and
  plan-source tagging — all of which the analogues implement more completely than the current
  spec-diff node. Edges were confirmed as the caller-side pattern: reconcile/specify/review
  hold the invokes edges; spec-diff declares none. Primitive:agent / mode:autonomous is correct
  and confident — the node is stateless, returns a digest, and has no operator loop.
  Goals framed well as outcomes (escape rate, precision). Recommend translator proceed;
  the challenge findings section names concrete gaps for spec-diff's next amendment sprint.
---

# Research report for spec-diff

## Identity

**Candidate id:** spec-diff

**Candidate title:** Spec-diff

**Scope:** A stateless, read-only agent that compares what was built against the spec
touchpoints the upstream design and `specify` stage settled, and returns a structured diff of
agreements, discrepancies, and unaddressed touchpoints. Invoked by `reconcile` (primary home),
and also by `specify` and `review` in the graph-map. Leaf-ish: it reads and reports; it does
not write, loop, or decide. Excludes: full-codebase drift scanning (that is `drift-detector`),
carrier-state lifecycle management, and adjudication of what to do with discrepancies (that is
`reconcile`'s `adjudicate` mode).

## Goals

What this node should achieve (as outcomes, not activities):

| outcome | metric | earns-keep |
|---------|--------|------------|
| Spec-reality drift is caught at reconcile, before landing — a discrepancy the comparison surfaces is addressed deliberately (amend spec or fix build) rather than slipping to production. | Discrepancies the diff surfaces pre-land vs discrepancies found post-hoc in production or a future audit (escape rate); share of high-severity findings that become deliberate reconcile decisions. | Escape rate trends toward zero; if diffs never surface real discrepancies the loop later confirms, the agent is not earning its cost. |
| The diff is precise — real gaps between spec touchpoints and built change, not style or scope-irrelevant observations. | Precision (findings the operator acts on vs dismisses); false-positive rate measured over reconcile sessions. | Precision stays high; an agent that floods low-value findings is retuned or cut. |

## Primitive / Mode

**`primitive:`** `agent`

**`mode:`** `autonomous`

**Rationale:** Read-only comparison over a bounded set of files and touchpoints; returns a
digest, never mutates. No live-thread or operator-in-loop behaviour — the agent side of the
context axis. The caller (reconcile) dispatches it and reads the result; no back-and-forth.
Identical to `drift-detector` in shape.

**`determinism:`** `generative`

**Rationale:** Interpreting whether a built change satisfies a spec touchpoint requires
judgment — a touchpoint may be satisfied by a different (equally valid) implementation of the
same intent. The precision gate inside the agent body makes this explicit.

## Contract

**Input (spawn bundle):**
```yaml
touchpoints:
  - id: <slug-or-anchor>
    intended_change: <string>   # one sentence: what the spec says should be true after build
spec_refs: [<page-slug>, ...]   # canon pages the touchpoints live in
build_artefacts:                # at least one of:
  diff: <patch-or-summary>
  files: [<path>, ...]
task_summary: <string>          # 1-3 sentences: what the build was supposed to do
```

**Output (structured YAML diff) — amended 2026-06-04 (CF-1/CF-2/CF-4/CF-5 + D58):**

Per-touchpoint contract the node emits (matched exactly by the parallel `reconcile` amendment):

```
status:   met | changed | missing | unverifiable | out_of_scope
severity: P0 | P1 | P2 | P3            # per severity-scale.md (D58)
gap:      <text>                       # for `unverifiable`, carries the manual check
verification-mode classified before scoring: DIFF-VERIFIABLE | EXTERNAL-STATE | CROSS-ARTEFACT
EXTERNAL-STATE / CROSS-ARTEFACT  ->  out_of_scope (with note), never `missing`
precision gate: "how, not whether"  ->  `changed`
```

```yaml
summary:
  met: <int>
  changed: <int>
  missing: <int>
  unverifiable: <int>
  out_of_scope: <int>
  unintended_scope: <int>
all_met: <boolean>
findings:
  - touchpoint_id: <slug>
    status: met | changed | missing | unverifiable | out_of_scope
    verification_mode: DIFF-VERIFIABLE | EXTERNAL-STATE | CROSS-ARTEFACT
    evidence: <one sentence>
    gap: <one sentence>          # omit if met; for `unverifiable` carries the required manual check
    suggested_path: amend-spec | fix-build | accept | investigate
    severity: P0 | P1 | P2 | P3  # per severity-scale.md (D58); omit if met or out_of_scope
unintended_scope:
  - location: <file or section>
    observation: <one sentence>
    suggested_path: add-touchpoint | accept | investigate
agreements:
  - touchpoint_id: <slug>
    note: <optional>             # `changed` touchpoints are recorded here, not as findings
notes: <anything the dispatcher should know>
```

**Status-enum settlement.** The pre-amend taxonomy (satisfied / partial / missing / contradicted /
out_of_scope) collapses to the five-status contract above: `satisfied`→`met`; `partial` and
`contradicted` are absorbed (a different-but-valid realisation is `changed`; a genuine conflict or
shortfall is `missing` with a P0/P1 severity carrying the conflict in `gap`); `changed` is new
(CF-1); `unverifiable` is new (CF-4); `out_of_scope` now also absorbs EXTERNAL-STATE / CROSS-ARTEFACT
touchpoints (CF-2) rather than mis-scoring them as `missing`.

## External analogues searched

Record of the real-world search — whether or not anything was lifted.

| corpus searched | query / what you looked for | found? | lifted to source-material? |
|---|---|---|---|
| gstack live skills (`~/.claude/skills/gstack/`) | `review`, `document-release`, `ship`, `plan-eng-review`, `cso`, `retro` — any skill with a "built vs spec" or "plan completion" comparison step | **yes** | `gstack-review-SKILL.md` |
| CE plugin (`ce-plugin/plugins/compound-engineering/skills/`) | All SKILL.md files — searched for `spec`, `reconcil`, `touchpoint`, `acceptance`, `verify.*spec`, `built.*against`, `plan.*check` | **yes** | `ce-code-review-SKILL.md` |
| be-civic harness (`/home/gstack/projects/be-civic/`) | `reconcil`, `spec.*check`, `acceptance`, `spec.*diff` — any process that checks built work against a requirement | no | — |
| Published best practice (web) | Kiro spec-driven dev docs — spec verification / validation step after build | partial: Kiro describes spec creation and task execution; no dedicated verification step documented | — |
| Published best practice (web) | arxiv 2603.25773 "The Specification as Quality Gate" — AI-assisted spec compliance checking | yes (synthesised into challenge findings; PDF too large to lift verbatim without editing) | — |
| Published best practice (web) | Requirements traceability matrix (RTM) literature — structured satisfied/partial/missing taxonomy | yes (synthesised into challenge findings) | — |
| Published best practice (web) | EARS notation (Kiro), acceptance criteria BDD/Gherkin patterns — structured intent format | yes (synthesised into challenge findings) | — |

**Primary analogue:** `gstack-review-SKILL.md` — the Plan Completion Audit sub-step (lines
~840–970) is the closest on-machine counterpart: structured per-item verdicts, verification-mode
dispatch (DIFF-VERIFIABLE / CROSS-REPO / EXTERNAL-STATE), and precision/honesty rules.

**Secondary analogue:** `ce-code-review-SKILL.md` — Stage 2b + Stage 6 §3 implements the same
per-requirement traceability check, adds plan-source confidence tagging (explicit vs inferred),
and integrates into a multi-agent pipeline rather than running standalone.

## Source inventory

| file | status | notes |
|------|--------|-------|
| `source-material/gstack-review-SKILL.md` | keep (Plan Completion Audit sub-step); drop (all unrelated review phases) | The Plan Completion Audit (Step 3.5–3.7) directly implements spec-vs-built comparison. The other ~1 600 lines (specialists, diff computation, telemetry) are out of scope — edge-only territory at best. |
| `source-material/ce-code-review-SKILL.md` | keep (Stage 2b + Stage 6 §3); drop (all review phases, headless envelope, walk-through) | Stage 2b plan discovery and Stage 6 §3 Requirements Completeness are the analogue core. Confidence-source tagging (plan_source: explicit vs inferred) and the verdict-blocking rule for unaddressed explicit requirements are directly relevant. |

## Keep / Drop

**Kept (absorbed into body):**
- Verification-mode dispatch concept: DIFF-VERIFIABLE vs CROSS-REPO vs EXTERNAL-STATE (from
  gstack review). Currently spec-diff's body does not distinguish between touchpoints the diff
  can prove and touchpoints that require external-state confirmation. This is a gap.
- Precision/honesty rules from gstack review: "Be conservative with DONE — require clear
  evidence. A file being touched is not enough. Be generous with CHANGED — if the goal is met
  by different means, that counts as addressed."
- Plan-source confidence tagging from CE code review: the idea that caller-provided vs
  auto-inferred scope changes how strongly findings are reported. spec-diff receives its bundle
  from the caller (always explicit), so inferred-plan weakening does not directly apply — but
  the principle that source confidence affects severity is relevant.
- CHANGED status (gstack review): spec-diff currently has no "implementation satisfied intent
  by a different means" status. The analogues both have this and it is load-bearing for
  precision.
- Structured summary counts (spec-diff already has these, confirmed valid by analogues).

**Dropped (out of scope):**
- Specialist agent dispatch, bounded parallelism, telemetry, interactive routing question
  (CE code review) — those belong to the calling skill's orchestration layer, not to spec-diff.
- Plan file discovery logic (CE Stage 2b auto-discover) — spec-diff receives its touchpoints
  in the spawn bundle; it never discovers them.
- Version bump, CHANGELOG, PR body update (gstack document-release) — entirely different job.

**Edge only (separate node):**
- `reconcile` — adjudicates what to do with spec-diff's output. spec-diff surfaces; reconcile
  decides. The adjudication logic in gstack review's "flag unaddressed items as P1 if explicit
  plan" is `reconcile`'s job, not spec-diff's.
- `review` — invokes spec-diff; not absorbed.
- `specify` — invokes spec-diff; not absorbed.

## Overlaps and seams

- **`drift-detector`** — same structural shape (stateless, autonomous, returns YAML digest,
  invoked by a parent node). `drift-detector` scans the full canon for stale links and
  content; `spec-diff` compares a specific build against specific touchpoints. Non-overlapping
  jobs; same agent pattern.
- **`reconcile`** — the primary dispatcher. spec-diff's `suggested_path` field is explicitly a
  routing hint for reconcile, not a gate. The seam is: spec-diff returns the diff →
  reconcile reads it and adjudicates. `invokes` edge lives on `reconcile`'s side.
- **`review`** — can invoke spec-diff to verify a PR against its touchpoints before a landing
  decision. The `review` node holds the `invokes` edge.
- **`specify`** — can invoke spec-diff to check that a proposed implementation matches the
  touchpoints before committing to build. Edge deferred (F7) per original research.

## Fit

Single node. `spec-diff` owns one job: given a spawn bundle, compare touchpoints against built
artefacts, return a structured YAML diff. No further decomposition is warranted — the job is
already leaf-level (invokes nothing, writes nothing). The gstack review analogue handles
essentially the same job in one continuous sub-step; CE's analogue is also a single logical
stage. No split needed.

## Edges

| edge type | target id | rationale |
|-----------|-----------|-----------|
| composes-into | dev-sprint (@ reconcile stage) | spec-diff is a shared sub-node of the dev-sprint arc, primarily homed in the reconcile stage per the graph-map "Shared sub-nodes" table |
| can-follow | specify | may be invoked after specify to verify a proposed implementation outline matches settled touchpoints (deferred, payable from specify's side when that node is amended) |
| can-follow | review | may be invoked by review before a landing decision (deferred, payable from review's side) |

Note: `invokes` edges are declared by the *caller* (reconcile, specify, review), not by
spec-diff. spec-diff declares no outbound `invokes` or `loads` edges.

## Conformance

**`primitive:`↔`mode:` agreement:** Confirmed. `agent` + `autonomous` is the correct pairing
for a stateless, spawn-and-return node with no operator-in-loop behaviour.

**`goals:` as outcomes:** Confirmed. Both goals (escape rate, precision) read as measurable
outcomes with defined metrics and earns-keep thresholds.

**Edge targets resolvable:** `dev-sprint` exists in the record as the arc. `specify` and
`review` exist as node ids. No unresolved targets.

---

## Challenge findings

_This section benchmarks spec-diff against its real external analogues (gstack /review Plan
Completion Audit and CE ce-code-review Stage 2b/6§3). Each finding names a gap, the analogue
that surfaced it, and a concrete recommendation for the node's next amendment._

### CF-1 — Missing `CHANGED` verdict status (HIGH)

**Gap:** spec-diff's evaluation taxonomy (satisfied / partial / missing / contradicted /
out_of_scope) has no status for "the touchpoint was addressed, but by a different implementation
than the spec described." The gstack review audit has `CHANGED` ("implemented using a different
approach than the plan described, but the same goal is achieved") as a first-class verdict.
This matters for precision: without CHANGED, a legitimately-satisfied touchpoint whose
implementation deviates from the spec's description is forced into `partial` or `contradicted`,
producing false positives.

**Analogue:** `gstack-review-SKILL.md` Plan Completion Audit, `CHANGED` status, with the rule
"be generous with CHANGED — if the goal is met by different means, that counts as addressed."

**Recommendation:** Add `changed` as a sixth evaluation status. Definition: "The built change
implements the intended change by a different (equally valid) means; the goal is met." Add to
the precision gate: "Is the implementation a different but valid realisation of the same intent?
If so — emit `changed` under `agreements`, not a finding." Update the output YAML schema to
include `changed` in the `status` enum and note it in the `agreements` list.

---

### CF-2 — No verification-mode dispatch (MEDIUM)

**Gap:** spec-diff's body asks the agent to "read the spec_refs pages" and "read the
build_artefacts" but does not distinguish between touchpoints the diff can structurally prove
(a file appeared, a function changed) vs touchpoints that require confirming external state
(a config was set, a service was enabled) vs touchpoints that span repos. The gstack review
analogue implements a three-way verification-mode dispatch (DIFF-VERIFIABLE / CROSS-REPO /
EXTERNAL-STATE) that determines *how* each item is verified before classifying it.

Without this, spec-diff will silently classify external-state touchpoints as `missing` when
they may have been satisfied in an external system — or claim `satisfied` for things it cannot
actually verify from the diff alone.

**Analogue:** `gstack-review-SKILL.md` "Verification Mode" and "Verification dispatch" sections
(lines ~892–910).

**Recommendation:** Add a verification-mode step before `## Evaluate each touchpoint`. For
each touchpoint, classify the intended_change as:
- **DIFF-VERIFIABLE** — the change would appear in the build_artefacts diff.
- **EXTERNAL-STATE** — the change is in an external system not visible in the diff.
- **CROSS-ARTEFACT** — the change is in a different file or system not included in the spawn
  bundle's build_artefacts.

For EXTERNAL-STATE and CROSS-ARTEFACT touchpoints, emit `out_of_scope` with a note in `notes`
requesting the caller supply additional artefacts or confirm externally. Do not classify as
`missing`.

---

### CF-3 — Plan-source confidence tag not propagated to findings severity (LOW)

**Gap:** spec-diff's caller always provides the touchpoints explicitly in the spawn bundle
(there is no auto-discovery step). However, the caller's confidence in those touchpoints can
vary: touchpoints from a freshly-amended spec are high-confidence; touchpoints reconstructed
from a commit message or PR description are low-confidence. spec-diff currently treats all
touchpoints identically regardless of source confidence. CE ce-code-review's Stage 2b
tags each discovered plan as `plan_source: explicit` or `plan_source: inferred`, and uses
that tag to route unaddressed findings as P1 (explicit) vs P3 advisory (inferred).

**Analogue:** `ce-code-review-SKILL.md` Stage 2b plan discovery, confidence tagging, and
Stage 6 §3 routing rule.

**Recommendation:** Add an optional `confidence: high | low` field to each spawn-bundle
touchpoint (defaulting to `high`). When `confidence: low` on a touchpoint, severity for
`partial` and `missing` findings for that touchpoint is capped at `low`. Document that
callers who reconstruct touchpoints from commit history rather than a canonical spec amendment
should set `confidence: low`. This keeps spec-diff general while allowing callers to signal
reconstruction confidence without lying about the source.

---

### CF-4 — No `UNVERIFIABLE` escape hatch (MEDIUM)

**Gap:** The gstack review analogue has an `UNVERIFIABLE` verdict for items where neither the
diff nor reachable sibling-repo checks can prove or disprove the claim — and provides a rule
("cite the specific manual verification the user must perform"). spec-diff has no equivalent.
When a build_artefact is missing or a spec_ref cannot be resolved, the current node body says
"emit a note in `notes`" — but `notes` is a catch-all and does not surface to the structured
findings. A missing artefact should surface as an explicit per-touchpoint status, not drown
in `notes`.

**Analogue:** `gstack-review-SKILL.md` `UNVERIFIABLE` verdict and "Honesty rule" (lines
~921–928).

**Recommendation:** Add `unverifiable` as a seventh evaluation status. Use it when: (a) the
build_artefact for a touchpoint is missing or unreadable, or (b) the spec_ref page cannot be
resolved. Include the specific manual confirmation required in the `gap` field. This surfaces
the blockage clearly to `reconcile` rather than hiding it in `notes`.

---

### CF-5 — Precision gate is not anchored to the CHANGED distinction (MEDIUM)

**Gap:** spec-diff's precision gate asks "Is the gap real, or a different (equally valid)
implementation of the same intent?" and says "if equally valid — emit a note under
`agreements`, not a finding." This is correct in intent but ambiguous: it does not say what
status to use when the intent is met by different means. The gstack review analogue resolves
this with the explicit `CHANGED` verdict and the rule "if the goal is met by different means,
that counts as addressed." Without a named status, the precision gate instruction is
under-specified for translators and future operators — it will be inconsistently applied.

**Analogue:** `gstack-review-SKILL.md` `CHANGED` verdict and "be generous with CHANGED" rule.

**Recommendation:** Resolved by CF-1 (adding `changed` status). The precision gate should be
updated to reference the `changed` status explicitly: "Is the concern about *how* the intent
was implemented rather than *whether* it was? If the same goal is achieved by different means —
emit `changed` under `agreements`, not a finding."

---

### CF-6 — No cap on touchpoint count (LOW)

**Gap:** The gstack review analogue caps plan-item extraction at 50 with an explicit note when
the cap fires. spec-diff accepts an unbounded touchpoint list in the spawn bundle. For large
builds with many touchpoints, an uncapped agent produces a very long output and may exceed
context limits or degrade judgment quality on later touchpoints.

**Analogue:** `gstack-review-SKILL.md` "Cap: Extract at most 50 items" rule (line ~884).

**Recommendation:** Add a soft cap note to the node body: "If the spawn bundle carries more
than 30 touchpoints, note in `notes` that the evaluation may have reduced precision for
later touchpoints, and recommend the caller split the bundle across two invocations." 30 is
the right threshold for a single-pass agent with multi-file read; adjust with evidence from
real reconcile sessions.

---

### CF-7 — Unintended scope detection lacks a severity classification (LOW)

**Gap:** spec-diff detects "unintended scope" (built changes that appear to touch
spec-relevant territory not covered by the touchpoints) and routes them with a `suggested_path`
(add-touchpoint / accept / investigate). However, the `unintended_scope` list has no `severity`
field. The analogue skills (gstack review, CE code review) assign severity to every finding —
without severity, `reconcile` cannot triage unintended-scope items against genuine
discrepancies.

**Analogue:** `gstack-review-SKILL.md` severity calibration rules; `ce-code-review-SKILL.md`
P0–P3 severity scale.

**Recommendation:** Add `severity: low | medium | high` to the `unintended_scope` list items
in the output schema. Use `high` when the unintended scope appears to contradict a different
spec section; `medium` when it expands scope in an opinionated way; `low` when it is an
incidental cosmetic or logging change.

---

## Enacted amendments (2026-06-04 — Tier-1 batch 2)

Cluster-A reconciliation (`docs/research-backfill-reconciliation.md`) verdicts: CF-1, CF-2, CF-4,
CF-5 are **APPLY**; the D58 severity unification is enacted alongside. CF-3 deferred; CF-6, CF-7 are
LOW and not in this batch.

- **CF-1 (HIGH) — `changed` status + precision-gate rule. ENACTED.** Added `changed` to the
  per-touchpoint status enum: "the built change implements the intended change by a different
  (equally valid) means; the goal is met." A precision-gate rule routes "how, not whether" concerns
  to `changed`. Per the open-question resolution below, `changed` touchpoints are recorded under
  `agreements` (a note), not as `findings` — consistent with the standing precision-gate posture.
- **CF-2 (MEDIUM) — verification-mode classification before scoring. ENACTED.** A classification
  step now runs **before** evaluation: each touchpoint is tagged DIFF-VERIFIABLE / EXTERNAL-STATE /
  CROSS-ARTEFACT. EXTERNAL-STATE and CROSS-ARTEFACT touchpoints route to `out_of_scope` **with a
  note** requesting the caller supply artefacts or confirm externally — **never `missing`**. Strict
  bundle-only boundary (open-question #2): the agent does not fetch artefacts it was not given.
- **CF-4 (MEDIUM) — `unverifiable` status. ENACTED.** Added `unverifiable` for (a) a missing or
  unreadable `build_artefact`, or (b) an unresolvable `spec_ref`. The required manual check is
  carried in `gap`. This fixes the pre-amend bug where the body forced a missing artefact to
  `missing` and buried the blockage in `notes`.
- **CF-5 (MEDIUM) — precision gate anchored to `changed`. ENACTED.** Folded into CF-1: the precision
  gate now names `changed` explicitly ("Is the concern about *how* the intent was implemented rather
  than *whether* it was? … emit `changed` under `agreements`, not a finding").
- **D58 — severity P0–P3. ENACTED.** The `severity` field converts from `low | medium | high` to
  `P0 | P1 | P2 | P3`, referencing `graph/_refs/severity-scale.md` (broadened to the factory-wide
  findings-severity contract, v0.2.0). One-line rubric for conformance findings: **P0** = a
  delivery-path touchpoint entirely unmet or contradicted; **P1** = a real spec touchpoint broken /
  high-impact divergence; **P2** = a moderate divergence with a meaningful downside; **P3** =
  cosmetic / nit. `changed` and `out_of_scope` carry no severity.

## Open questions

- **CF-1 resolution:** Should `changed` status appear in `findings` (with a lower severity) or
  exclusively in `agreements`? The gstack analogue puts it in the completion table as a
  distinct verdict. CE code review does not have this status. Recommend: `agreements` list with
  a `note` — consistent with the current precision gate "emit a note under agreements."
  Operator should confirm before translator amends the node.

- **Verification-mode scope:** CF-2 suggests DIFF-VERIFIABLE / EXTERNAL-STATE / CROSS-ARTEFACT
  as the three modes. Whether spec-diff should attempt to fetch a missing build_artefact from
  the calling context (e.g., read a file it was not explicitly given) or strictly respect the
  spawn bundle boundary is a design decision for the operator. Strict bundle-only is safer for
  a general harness.

- **Touchpoint format stability:** The current spawn bundle uses `intended_change: <string>`
  (free-form). The RTM literature and EARS notation (as used in Kiro) suggest structured
  acceptance criteria (given/when/then or EARS format) improve both precision and
  traceability. Whether to move touchpoints toward structured format is an open design question
  — it would improve CF-2 (verification-mode dispatch is easier when the acceptance criterion
  is structured) but would require callers (specify, reconcile) to emit structured touchpoints.
</content>
