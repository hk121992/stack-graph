---
title: Research report for product-lens
type: research-report
status: complete
authored: 2026-06-01
last_updated: 2026-06-04
amended:
  - date: 2026-06-03
    note: "External search backfill — lifted gstack/plan-ceo-review, CE/ce-strategy, CE/ce-product-pulse; added External analogues searched table, Challenge findings section; updated frontmatter fields external_analogue_found/external_corpora_searched/sources_lifted."
  - date: 2026-06-04
    note: "Reconciliation amend (cluster-C product-lens CF-1..CF-4) — applied: CF-1 evidence-strength pushback subsection in Phase 2; CF-2 SMART bar on outcome_link in Phase 1; CF-3 stop-and-resolve finding on absent/empty strategy-canvas in Phase 1; CF-4 prose-only downstream note that the recorded frame feeds debrief's confirm/kill (NO edge, D44 held). CF-5 left for a later cleanup pass. No severity-scale ref / P0-P3 added — out of scope per the brief (product-lens is a strategy lens, not a D58 severity emitter)."
sources_lifted: 3
external_analogue_found: true
external_corpora_searched:
  - "gstack live skills (/home/gstack/.claude/skills/gstack/)"
  - "CE plugin (/home/gstack/scratch/ce-plugin/plugins/compound-engineering/skills/)"
  - "be-civic harness (/home/gstack/projects/be-civic/)"
  - "Published best practice — SVPG four-risks (svpg.com/four-big-risks/, svpg.com/product-risk-taxonomies/)"
  - "Published best practice — Teresa Torres Opportunity Solution Tree (producttalk.org)"
  - "Published best practice — product-management-frameworks / sprint-planning review 2025"
researcher_adequacy_note: |
  External search performed 2026-06-03. Three real corpora searched on disk: (1) gstack live
  skills — plan-ceo-review is the strongest analogue (CEO/founder-mode plan review asking
  "right problem?"; lifted verbatim); (2) CE plugin — ce-strategy (STRATEGY.md anchor,
  canvas-author role) and ce-product-pulse (post-ship value measurement, SMART metric bar)
  both lifted verbatim; (3) be-civic harness — skills are Belgian admin process skills with
  no product-lens analogue; bmd references to value_proposition are be-civic's OWN product
  canvas, not a review skill. Published best practice searched: SVPG four-risks (403 on
  direct fetch; roadmap.one mirror fetched successfully); Teresa Torres OST; sprint-planning
  PM story-review 2025. Findings confirm external_analogue_found:true — plan-ceo-review is
  the closest real counterpart, doing the same "right problem / wrong outcome / strategy mis-
  fit" job but at the whole-plan level rather than composing into a stage. ce-strategy is the
  canvas-author the lens reads. ce-product-pulse closes the lifecycle loop. The SVPG canon
  (value/usability/feasibility/viability; PM owns value+viability; discovery kills risks before
  delivery) is the domain methodology product-lens operationalises. Challenge findings (§ below)
  identify five gaps where the node is weaker than its analogues: missing evidence-strength
  pushback discipline, no SMART bar for outcome_link checking, no explicit handling of
  no-STRATEGY.md / empty-canvas, no adversarial-interview mode for weak answers, and no
  explicit link to post-ship signal (pulse). Recommendation: proceed to translator; node
  is otherwise sound; challenge findings are amendment candidates, not blockers.
---

# Research report for product-lens

## Identity

**Candidate id:** product-lens
**Candidate title:** Product lens

**Scope:** The **PM-pack member of the dev-sprint's shared front** (D43) — the product / CEO /
strategy lens, delivered **main-thread as a skill** (D36). It brings the question the code and design
lenses do not ask into the shared `design` / `plan` front: **is this the right problem, and does the
solution serve the value proposition, the target user, and the objective it claims to serve?** It
examines the **four risks at the item altitude** (value + viability above all — usability/feasibility
are the design/eng lenses' lanes), reading the value proposition / target user / strategy from the
harness's **strategy canvas** surface and the served objective from the work-item's `outcome_link`,
and folds its findings into the **same design/plan doc** the code/design lenses feed. It is the
strategy analogue of the review-lens family (D27): it composes into the front from its own side, runs
the product check, surfaces findings to one shared contract, and **decides no go/no-go** (that is the
PM/operator gate) and **writes no carrier** (D44 — lifecycle/gate are operator calls, `current_stage`
is projected).

**Excludes:** the **discovery loop** (the canvas itself, the hypothesis lifecycle, venture-level
strategy → `strategy-curator`, Arc A — the lens *reads* the canvas, never maintains it); the **code**
dimensions (correctness/security/tests/maintainability → the lens-agent family); **usability/visual
design** (→ `plan-design-lens` / `design-review`, D36); **feasibility** (→ the eng side of the front);
the **go/no-go gate** (→ PM/operator — the lens informs it, does not own it); and the **carrier**
(read-for-context only). The four-risks / OKR *structure* is not restated in the body — it lives in
the `four-risks` / `okr-schema` references.

## Goals

What this node should achieve (as outcomes, not activities):

| outcome | metric | earns-keep |
|---------|--------|------------|
| The right-problem question is settled at the front — a solution that serves no real value proposition / target user / objective is caught at design or plan, not after it ships. | share of front sessions where the lens surfaced ≥1 actioned right-problem / wrong-solution finding; items that shipped and were later found to serve no objective or value-prop fit, traced to a reviewed front. | ship-then-discover-it-was-wrong events traced to a reviewed front trend below the pre-lens baseline over N sprints; a lens that never surfaces a real right-problem finding is cut or merged into design. |
| Every item's solution is checked against the value proposition, the target user, and the served objective (value + viability at item altitude), so a strategic mis-fit surfaces at the front, not at build/launch/debrief. | share of front sessions where the lens recorded the served objective + value-prop fit + the four-risks evidence-state at item altitude; value/viability risks left unexamined at the front that bit later. | front-stage product findings measurably displace later launch/debrief surprises; a pass that records nothing real is a cut/tune signal. |
| The lens's findings are trustworthy signal, not strategy theatre — each names the value-prop / objective / risk it bears on and routes to the same design/plan doc the code/design lenses feed. | share of product-lens findings actioned (folded in or deliberately deferred) vs dismissed; findings raised with no traceable value-prop / objective / risk anchor. | the actioned fraction stays high and every finding carries a strategy anchor; a rising dismissal / anchorless-finding rate is the cut/tune signal. |

## Primitive / Mode

**`primitive:`** `skill`  ·  **`mode:`** `collaborative`  ·  **`determinism:`** `generative`

**Rationale.** D36 + D43 settle the shape directly: the product/strategy check is **delivered
main-thread as a skill**, not as a member of the autonomous lens-agent family. The right-problem
judgement needs the **live design conversation, the operator, and the strategic substrate in
context** — the collaborative side of the context axis (D24), not the isolated, prompt-describable,
fanned-out-to shape the code lenses (`lens-security` et al., `primitive: agent`) take. It mirrors its
PM-pack sibling `strategy-curator` (also `skill` / `collaborative` / `generative`) and the front node
it joins, `design` (also a collaborative skill). The check is **judgment, not algorithm** — reasoning
about whether a solution serves a value proposition and an objective, grading evidence strength
against a maturity bar — so `generative`; two passes over the same doc may surface different
right-problem findings. The `skill` ↔ `collaborative` pairing satisfies the schema agreement
constraint.

This is confirmed by the external analogues: plan-ceo-review is also a skill / collaborative /
generative — it runs main-thread, uses AskUserQuestion to hold the operator in the loop on every
scope judgement, and its "Premise Challenge" (Step 0A) operationalises exactly the same "is this the
right problem?" check product-lens runs at item altitude. ce-strategy is similarly collaborative
(interview-driven, blocking questions, operator-in-loop).

**The one deliberate shape divergence from the code-lens family.** The code lenses are *agents* a
stage's `lens-dispatch` fans out to in isolation; product-lens is a *skill* that **composes into** the
front and runs main-thread. It is therefore a hybrid: it borrows the lens family's **`composes-into
@stage` declaration** (it joins the front from its own side, the stage does not invoke it) and the
**shared finding contract** (its findings rank/route alongside the code lenses'), but it is **not**
spawned in an isolated context and does **not** emit a machine-only finding tier with no operator turn
— it reasons with the operator like `design`. This is exactly D36's call (real product/strategy review
needs the live thread), carried forward intentionally.

## Contract

**Input:** invoked as part of a front stage (`design` or `plan`) — the operator (or the stage) hands
it the **work-item** (the problem it states + the `outcome_link` objective it claims) and the
**design/plan doc** under examination. Overlay-supplied, read at the step of need: the **strategy
canvas** home (the harness's VPC + BMC + strategy surface — bound, never hardcoded), the **handbook**
reference (overlay-resolved to the product's canon). Imports the **four-risks** lens (always present)
and the **okr-schema** (to check the served objective is a real outcome). The **finding contract**
(schema / severity scale / confidence anchors) is the front stage's — product-lens emits to the same
contract so its findings rank/route alongside the code/design lenses' (it does not re-author the
contract).

**Output:**
- **Product-strategy findings** over the design/plan doc — ranked/routed to the shared finding
  contract, each anchored to a **doc location** and a **strategy anchor** (value-prop element /
  objective / four-risks state), surfaced and **actioned in-session** (folded into the doc).
- The **recorded strategy frame** in the doc: the value proposition + target user the item serves,
  the objective it moves, and the **four-risks evidence-state at item altitude** (per risk: evidence,
  strength rung, maturity bar, cleared/open/stop) — the record's deliberate-decision evidence
  (product-dashboard-design §2.2). This recorded frame is what `debrief`'s post-ship confirm/kill
  reads downstream to test whether the item delivered the objective it claimed (CF-4 — prose note, no
  edge: the link runs through the carrier record the PM/operator gate owns, D44).
- **No carrier write and no gate decision** — `lifecycle_state` + `gate_decisions` are the PM/operator
  gate (which reads the findings); `current_stage` is projected from the traversal.

## External analogues searched

Record of the real-world search — whether or not anything was lifted. This is the rigor that lets the
report **challenge** the node against how the job is really done, not merely describe the node.

| corpus searched | query / what you looked for | found? | lifted to source-material? |
|---|---|---|---|
| gstack live skills (`/home/gstack/.claude/skills/gstack/`) | skills matching: CEO/founder-mode plan review, right-problem check, strategy review, product-strategy check in sprint/design context; scanned all SKILL.md files for keywords: ceo, product, strategy, pm, right.problem, value.prop | yes — `plan-ceo-review` | `gstack-plan-ceo-review-SKILL.md` |
| CE plugin (`/home/gstack/scratch/ce-plugin/plugins/compound-engineering/skills/`) | skills matching: strategy, product pulse, product check, value proposition review; specifically ce-strategy, ce-product-pulse, ce-brainstorm, ce-work | yes — `ce-strategy` + `ce-product-pulse` | `ce-strategy-SKILL.md`, `ce-product-pulse-SKILL.md` |
| be-civic harness (`/home/gstack/projects/be-civic/`) | SKILL.md files for product-lens, right-problem, value-prop, four-risk, PM-review, strategy-check patterns; bmd agents and README for product-review patterns | no — be-civic skills are Belgian admin process skills (civic/legal); bmd references to value_proposition are the product's own canvas data, not a review skill | — |
| Published best practice — SVPG (svpg.com/four-big-risks/, svpg.com/product-risk-taxonomies/) | four-risks framework; PM responsibility for value+viability; item-level vs discovery-level application; evidence strength grading; delivery gate patterns | yes — canonical domain methodology; 403 on direct fetch, roadmap.one mirror fetched successfully | not lifted verbatim (published, no machine path) |
| Published best practice — Teresa Torres Opportunity Solution Tree (producttalk.org) | OST approach to linking items to outcomes; assumption testing before build; PM gate patterns | yes — confirms outcome-link discipline; "test riskiest assumptions before building" pattern; no item-altitude risk-check skill found | not lifted verbatim |
| Published best practice — sprint-planning PM story review 2025 (websearch) | "right problem" value-proposition check at story/item level; front-door product PM gate practices | no dedicated practice found — SVPG and OST are the closest published precedents; sprint review literature focuses on ceremony, not pre-build product-strategy check | — |

**Primary analogue:** `gstack-plan-ceo-review-SKILL.md` — the strongest real-world counterpart. It runs
the same "is this the right problem / does this serve a real user/business outcome?" check as
product-lens, in the same collaborative/main-thread/generative shape. The gap between them — plan-ceo-
review operates on a full plan before build, product-lens composes into a stage and targets item-
altitude value+viability — is precisely the structural position product-lens claims.

**No direct counterpart found** for the specific pattern of a product-strategy lens that **composes
into a shared front stage**, runs alongside code/design lenses, and emits findings to a shared
finding contract at item altitude. The job exists in practice as a PM behavior (the PM in a product
trio who asks "is this the right thing?" during sprint planning or story refinement), but no skill or
agent in the searched corpora encodes it as a structured, invocable, finding-emitting node. That
makes product-lens genuinely novel in shape, while being well-grounded in the domain methodology.

## Source inventory

| source | status | notes |
|------|--------|-------|
| `source-material/gstack-plan-ceo-review-SKILL.md` | keep (analogue) | The primary external analogue. Step 0A (Premise Challenge: "Is this the right problem?", "What is the actual user/business outcome?", "What would happen if we did nothing?") is the closest real counterpart to product-lens's Phase 1–2. The 18 CEO cognitive patterns (inversion reflex, proxy skepticism, focus as subtraction, etc.) are the heuristic substrate product-lens's evidence-grading should draw from. The four modes (SCOPE EXPANSION / SELECTIVE EXPANSION / HOLD SCOPE / SCOPE REDUCTION) show what a multi-mode product-strategy check looks like — product-lens deliberately has no modes (it reads the maturity bar from the binding), but the analogue shows that mode-selection is a real design question. The Prime Directives (zero silent failures, every error has a name, observability is scope) are the engineering analogue to product-lens's earns-keep discipline. Drop: engineering-specific sections (error/rescue map, test diagram, frontend scope detection, diagrams-are-mandatory), scope expansion ceremony, and plan-writing mechanics — those are not product-lens's job. |
| `source-material/ce-strategy-SKILL.md` | keep (canvas-author analogue) | ce-strategy is what product-lens reads (the STRATEGY.md / canvas equivalent). Its core principles (anchor not plan; rigor in questions not headings; short is a feature; durable across runs) and its Rumelt grounding (diagnosis + guiding policy + coherent action) define the quality bar for what the canvas product-lens reads should contain — and therefore define what product-lens can actually check. The pushback rules ("interest is not demand", "the status quo is your real competitor", "narrow beats wide early") are the item-altitude questions product-lens should ask when checking value risk. The interview section structure (target problem / approach / who it's for / metrics / tracks) maps directly to the dimensions product-lens reads from the canvas: value proposition, target user, served objective. Drop: the write-STRATEGY.md workflow, the downstream handoff, and the interview mechanics — product-lens reads, not writes. |
| `source-material/ce-product-pulse-SKILL.md` | keep (post-ship outcome-measurement analogue) | ce-product-pulse measures whether shipped items actually delivered value — the outcome side of the loop product-lens's earns-keep metrics depend on. Its SMART metric bar (specific, measurable, actionable, relevant, timely applied to every event/signal the user proposes) is the standard product-lens should apply to outcome_link checking. Its "read it like a founder" posture and the strategy-seeded-when-available approach (reads STRATEGY.md first, carries forward key metrics as seeds) show how the canvas grounds the check. Its "pulse_pending_metrics" concept (metrics awaiting instrumentation, rendered as no-data) is the post-ship analogue of product-lens's "open" risk state. Drop: the technical data-source wiring, the pulse report format, the scheduling mechanics — those are pulse's domain, not product-lens's. |
| `docs/pm-graph-map.md` | keep (edge-defining) | The `product-lens` row in "New nodes" + the "Edges at a glance" composes-into line — the exact edge set: composes-into dev-sprint @design/@plan; references four-risks (import) + the strategy-canvas (via binding). Every edge below traces here. The "structural leaf like the other lenses" framing. |
| `docs/product-management-design.md` | keep | D43's two-faces; "A product lens — the CEO/founder/strategy review … Delivered main-thread as a skill (D36)"; the four risks at BOTH the strategic and the item altitude (the table); "the front blends a PM product-lens + eng/design; reads VPC / personas / strategy". The authoritative source for *what the lens is*. Drop the discovery-loop / outcome-layer / curator content (separate nodes). |
| `docs/dev-sprint-front-design.md` + `graph/design/design.md` | keep (seam-defining) | The front it composes into: `design` reuses `review`'s `lens-dispatch` with `target: doc`, and **leaves the product-strategy seam in prose with NO edge (F7)** — "The product-lens composes into `@design` from its own side (built separately) — leave the seam in prose, no edge." product-lens is the node that fills that seam by composing in from its own side. Also the no-carrier-write / no-gate discipline the front nodes hold. |
| `docs/product-dashboard-design.md` | keep | The work-item / outcome the lens reviews against: `outcome_link` (the objective it serves → vision), `risk_state` (the four-risks evidence-state the lens records, strength × maturity bar), the record's "process legibility — the deliberate-decision evidence" the lens's recorded frame feeds. |
| `docs/decisions.md` (D43, D36, D49, D44) | keep (decision basis) | D43 (PM-pack; the product lens as delivery-coupling-front machinery); D36 (design-quality-as-skill — the skill-not-lens-agent shape, applied here); D49 (the product-dashboard the lens reviews against); D44 (the carrier it must not write). |

## Keep / Drop

**Kept (absorbed into body):**
- The **right-problem check** — is this the right problem, does the solution serve the value
  proposition / target user / the claimed objective — as the lens's reason for existing (D43's
  "right problem? serves the value proposition and the target user? serves which objective?").
- **The four risks at the item altitude**, leading with **value + viability** (the dimensions the
  code/design lenses cannot own); usability/feasibility named but left to their lane. The
  **two-axes evidence model** (strength rung × maturity bar; a said-yes is not a did-yes; a low bar
  never silently upgrades weak evidence to *cleared*) — from `four-risks` v0.2.0, applied at item
  scope.
- **Composes-into-the-front from its own side**, the lens-family pattern — the stage does not invoke
  it; it fills the prose seam `design` left open. The **shared finding contract** (it emits to the
  stage's contract so findings rank/route with the code/design lenses) and **doc-location +
  strategy-anchor** finding shape.
- **Reads the substrate, maintains nothing** — the canvas (value prop / target user / business model)
  via the external `strategy-canvas` binding; the served objective via the work-item + `okr-schema`;
  settled strategy via `handbook`. Overlay-supplied, no product literals (mirrors strategy-curator).
- **Records the strategy frame into the doc** (served objective + value-prop fit + four-risks state) —
  the record's deliberate-decision evidence.
- The **sibling-boundary discipline** (don't double-own code / design / feasibility / venture-strategy
  / the gate; keep only the product framing on a straddle; corroboration at merge is intended) and the
  **structural-leaf** posture — mirrors the lens family.
- **Decides no gate, writes no carrier** — the open value/viability risk is an *input* to the
  PM/operator gate, not a veto; `current_stage` is projected (D44, design.md).
- **Evidence-strength pushback discipline (CF-1, applied 2026-06-04)** — a Phase-2 subsection naming
  ≥3 evidence-challenge patterns in the plan-ceo-review / ce-strategy anti-sycophancy style: a weak or
  *said*-yes answer offered for a value/viability risk is challenged, not rubber-stamped, before the
  risk is recorded as anything but *open*. Operationalises the existing "a said-yes is not a did-yes"
  line (which named the gap but gave the lens no procedure to push back). Grounded in `four-risks` (the
  strength rungs) — it adds the *how-to-push-back*, not a new evidence model.
- **SMART bar on `outcome_link` (CF-2, applied 2026-06-04)** — Phase 1 checks the *quality* of the
  served objective, not only its *type*: a non-specific / non-measurable objective is itself a
  value-risk finding because the value risk it anchors is unfalsifiable. Uses the already-imported
  `okr-schema` (key-results = `{metric, target, current}`, "outcomes not output") as the bar. Hardens
  the existing "names a feature dressed as an objective → already a finding" check from type-only to
  type-and-quality.
- **Stop-and-resolve on an absent/empty strategy canvas (CF-3, applied 2026-06-04)** — Phase 1
  surfaces a stop-and-resolve finding when the `strategy-canvas` binding is absent, empty, or
  unresolved, *before* running any value-risk check. `strategy-canvas` is `external: true`; 02-graph-spec
  has validation/build skip external refs but specifies no **runtime** fallback, so a check against an
  absent canvas would silently produce findings that look grounded but rest on nothing. Mirrors the
  no-STRATEGY.md handling in the ce-product-pulse / ce-strategy analogues.
- **Downstream note: the recorded frame feeds `debrief` (CF-4, applied 2026-06-04, PROSE ONLY)** — the
  Output/Contract names `debrief`'s post-ship confirm/kill as the consumer of the recorded strategy
  frame (four-risks evidence-state + served objective), making the earns-keep measurement loop legible.
  **No graph edge** — D44 holds (the lens writes no carrier); the connection runs through the carrier
  record the PM/operator gate owns, exactly as the "post-ship outcome measurement (no edge, lifecycle
  seam)" row in § Overlaps already states.

**Dropped (out of scope / separate node):**
- **Maintaining the canvas / the hypothesis lifecycle / venture-level strategy** → `strategy-curator`
  (Arc A). The lens reads the canvas; a strategic-level risk it spots routes back as a finding, it
  does not edit the canvas.
- **The code / design / feasibility dimensions** → the lens-agent family + the design skill + the eng
  side of the front.
- **The go/no-go gate, lifecycle advancement, gate-decision records** → PM/operator.
- **The product-dashboard content / the outcome layer's own maintenance** → `product-dashboard-curator`
  / the discovery loop. The lens *reads* `outcome_link`; it does not maintain the dashboard.
- **personas** as a first-class read — the canvas + the work-item carry the target-user frame the lens
  needs at item altitude; personas are the PM-owned surface the discovery loop + experience thread own
  (no edge from the lens; left ambient, like design's persona read).

**Reference / not absorbed:**
- The **finding contract** (findings-schema / severity-scale / confidence-anchors) — held by the front
  *stage*, not by product-lens; the lens emits to it but declares **no edge** to it (the stage owns
  those imports, exactly as it does for the code lenses). The lens does not re-author the contract.
- The **four-risks** and **okr-schema** structure → the references, consulted/imported, not restated.

## Overlaps and seams

- **Arc seam (lens → front):** product-lens **composes into** the `dev-sprint` at `design` and `plan`
  from its own side — the two front stages where the solution meets product strategy. `design` left
  the strategy-check seam in prose with no edge; this node fills it. Per the lens-family pattern, a
  lens composes into the arc **via its consuming stage**; the stage does not edge back.
- **No back-edge to `design` / `plan` (the load-bearing leaf rule):** the front stage runs the lens by
  composing-in; product-lens declares **no** `precedes` / `can-follow` / reverse edge — a back-edge
  would be an illegal structural cycle (D4), identical to why `lens-security` holds no edge to
  `lens-dispatch`. It has no process position of its own; it joins a stage.
- **Front-peer seam (product-lens ↔ code/design lenses):** they run over the same doc and emit to the
  same contract; the front's merge step corroborates overlaps. Product-lens keeps **only** the product
  framing on a straddle (a value finding turning on a feasibility fact names the fact, leaves it to
  eng). No edge between front peers — they are parallel members of the shared front.
- **→ discovery loop (`strategy-curator`):** product-lens **reads** the canvas strategy-curator
  maintains (the external `strategy-canvas` binding). A strategic-level risk it surfaces routes back to
  the discovery loop **as a finding** (and, post-ship, via `debrief` confirm/kill) — **no direct edge**
  to strategy-curator (they are PM-pack siblings, not a pipeline; mirrors the curator-sibling no-edge
  rule).
- **→ the PM/operator gate (no edge):** the lens's findings are an input to the go/no-go gate that
  advances `lifecycle_state`; the gate is an operator decision, not a node, and not a `composes-into`
  edge. The lens informs it; it does not own it.
- **Surfaces (binding / external reference, read-only):** the **strategy canvas** and the **handbook**
  are overlay-bound/overlay-resolved and `external: true` (factory ships only the pointer; the harness
  supplies the target; validation/build skip them). The **work-item** is read for context via the
  harness surface (no write-edge — D44).
- **→ post-ship outcome measurement (no edge, lifecycle seam):** the earns-keep metrics for product-
  lens (ship-then-discover-it-was-wrong events trend down; front-stage findings displace debrief
  surprises) require post-ship signal — the `debrief` node and a pulse-equivalent (ce-product-pulse
  pattern) are the downstream consumers of the record product-lens writes. No direct edge; the
  connection is through the carrier record the PM/operator gate owns.

## Fit

**Single node — confirmed.** Apply the decomposition discriminator (D23): it owns its own branching
(the item-altitude four-risks check + the read-frame-then-surface-findings flow), states distinct
measurable goals (right-problem settled at the front; value/viability checked at item altitude;
trustworthy anchored findings), and is reused by ≥2 consumers (it composes into both `design` and
`plan`). It is a **structural leaf**: composes-into + references only, no invokes, no back-edge — the
same minimal-edge shape as the lens family, differing only in primitive (skill, per D36) and in being
main-thread.

**Modes deliberately not split.** Unlike `design` / `strategy-curator`, product-lens carries **no mode
branches** — it runs one check (the right-problem / four-risks-at-item-altitude pass) that adapts by
*reading the maturity bar from the binding*, not by a mode token. The `design` vs `plan` distinction is
handled by **composing into two stages**, not by a body mode (the check is the same; only the doc it
reads differs — the front stage sets that). This matches the scope_hint ("be a structural leaf … no
modes implied") and keeps the lens lean.

Note from analogue comparison: plan-ceo-review has four explicit modes (EXPANSION / SELECTIVE
EXPANSION / HOLD SCOPE / REDUCTION). The analogue confirms that mode-selection is a real design
question for product-strategy review. Product-lens's no-mode choice is correct for the item-altitude
use case (the maturity bar does the mode-equivalent work) but the operator should be aware that a
full-plan product review (like plan-ceo-review) would benefit from mode selection — product-lens is
scoped below that level.

## Edges

| edge type | target id | rationale |
|-----------|-----------|-----------|
| composes-into | `dev-sprint` (stage: design) | The shared front's design stage — where the solution is first checked against product strategy. Declared from the lens's own side (design does not invoke it; it fills design's prose seam). Mirrors `lens-security` composes-into @design. |
| composes-into | `dev-sprint` (stage: plan) | The front's plan stage — the second front stage the product check rides (D43: "invoked by design/plan"; pm-graph-map: composes-into @design,@plan). `plan` does not exist as a node yet, but `composes-into` targets the **arc**, not a node file — the maintainer does not resolve it to a file (02-graph-spec), so this is authorable now (same as the code lenses already declare @plan). |
| references | four-risks (`load: import`) | The discovery lens applied at the **item altitude** (value/usability/feasibility/viability + the two-axis evidence model). Short, must always be present so every pass applies it — `import` (matches the pm-graph-map load-dial table; same as strategy-curator). Resolvable now (`graph/_refs/four-risks.md`). |
| references | okr-schema (`load: import`) | To check the **served objective** (`outcome_link`) is a real *outcome*, not a feature, and that the solution plausibly moves it. Short structure, needed on every pass that checks the value risk → `import`. **ADDED beyond the scope_hint's stated refs** (which listed it "optionally") — see Open questions for the justification. Resolvable now (`graph/_refs/okr-schema.md`). |
| references | strategy-canvas (`load: on-demand`, `external: true`) | The harness's canvas surface (VPC + BMC + strategy) — the source of truth for the value proposition / target user / business model the lens checks the solution against. Larger, conditional, read at the step of need → on-demand; harness-supplied → external (the factory ships only the pointer; the overlay binds the product's canvas home). This is the "references the strategy-canvas via a binding (harness surface — external, on-demand)" edge the scope_hint specifies. |
| references | handbook (`load: on-demand`, `external: true`) | The product's curated canon — settled product strategy + prior product decisions, navigated at the step of need so the lens does not re-litigate a settled call. The same external `handbook` reference `design` / `strategy-curator` / `explore` carry. Harness-supplied; validation/build skip it. |

**Deliberately NO other edges:**
- **No `invokes`.** The lens runs no sub-agent — it reasons in the main thread (D36). (Contrast the
  curators, which invoke `explore` / `pr-author`; product-lens produces findings into a doc, it does
  not graduate a PR or fan out research.)
- **No back-edge to `design` / `plan`** (structural cycle, D4) and **no `precedes` / `can-follow`** —
  it is a fanned-into leaf joining a stage, with no process position of its own (mirrors the lens
  family).
- **No `references` edge to the finding contract** (findings-schema / severity-scale /
  confidence-anchors) — the front *stage* holds those imports and the lens emits to the stage's
  contract; the lens declares none (mirrors how the code lenses receive the contract spawn-passed,
  adapted to product-lens reading it from the stage it composes into).
- **No edge to `strategy-curator` / `product-dashboard-curator`** — PM-pack siblings, not a pipeline;
  a strategic-level risk routes back as a *finding* (and via `debrief`), not a direct invoke.
- **No `composes-into` from a curator analogue** — product-lens is not a curator; it neither maintains
  a surface nor graduates a PR.

## Conformance

**`primitive:`↔`mode:` agreement:** `skill` ↔ `collaborative` — agrees (D36/D43 deliver it
main-thread; the right-problem judgement needs the live thread). Matches the PM-pack sibling
`strategy-curator` and the front node `design`. Confirmed by analogue: plan-ceo-review is also
`skill` / `collaborative` / `generative` for the same reason.

**`goals:` as outcomes:** all three read as outcomes (the right-problem question is settled at the
front; value/viability checked at item altitude before later surprises; trustworthy anchored
findings), each with a metric and an earns-keep threshold. None are activities — "runs a CEO review"
was framed as the outcome "the right problem is settled at the front, not after it ships," with the
earns-keep tied to displacing later launch/debrief surprises (the four-risks-at-the-front goal in
design.md's second goal is the parallel).

**Edge targets resolvable:**
- `dev-sprint` — the **arc**; `composes-into` targets an arc, which the maintainer does **not** resolve
  to a file (02-graph-spec). Both `@design` and `@plan` are authorable now (the code lenses already
  declare `@plan` though `plan` has no node yet — same posture, F7-clean because the target is the arc).
- `four-risks` — present (`graph/_refs/four-risks.md`). ✓
- `okr-schema` — present (`graph/_refs/okr-schema.md`). ✓
- `strategy-canvas` — `external: true`, **correctly absent** from the factory (harness-supplied canvas
  surface; BC: `bc-workspace/bmd`); validation/build skip it.
- `handbook` — `external: true`, correctly absent (harness canon); the shared external locator
  `design` / `strategy-curator` / `explore` already carry.

**No invented targets.** Every non-arc edge resolves to an on-disk reference or is a declared
`external: true` harness surface. No edge to a non-existent node (the `plan`-stage seam rides the arc,
not a node; the product-strategy seam `design` left in prose is filled by composing in, not by an edge
back).

## Challenge findings

These findings challenge the node against its real-world analogues (plan-ceo-review, ce-strategy, ce-
product-pulse) and the domain methodology (SVPG four-risks, Torres OST). Each cites the analogue and
names the gap. These are amendment candidates — not blockers for the current node version, which
carries the (v0.1.0) qualifier — but the operator should review them before the lens runs at scale.

**CF-1 (high severity): No evidence-strength pushback discipline. — RESOLVED 2026-06-04.**
Closed by the reconciliation amend: Phase 2 now carries an **Evidence-strength pushback** subsection
naming ≥3 challenge patterns in the plan-ceo-review / ce-strategy anti-sycophancy style. A weak/*said*-yes
answer for a value/viability risk is now challenged before the risk is recorded as anything but *open*.
Original finding retained below for provenance.

The node body says "name the current evidence and its strength rung (weak / moderate / strong — a
said-yes is not a did-yes)" but gives no pushback rules for when the operator offers a weak answer.
plan-ceo-review's analogue (office-hours Phase 2A) has explicit anti-sycophancy rules and five named
pushback patterns (vague market → force specificity; social proof → demand test; platform vision →
wedge challenge; growth stats → vision test; undefined terms → precision demand). ce-strategy has
"apply the pushback rules from references/interview.md — two rounds maximum; do not rubber-stamp
existing weak content." The SVPG canon distinguishes *said*-yes (interview interest) from *did*-yes
(behavior/payment) as the evidence gap that most commonly fools PMs. Product-lens names the
distinction ("a said-yes is not a did-yes") but does not tell the lens HOW to push back when the
operator presents only said-evidence for a value risk. A lens that accepts weak evidence gracefully
fails its own earns-keep metric ("findings are trustworthy signal, not strategy theatre").
*Recommendation: add a "Pushback discipline" subsection to Phase 2 naming at least three
evidence-challenge patterns analogous to plan-ceo-review's Anti-Sycophancy Rules.*

**CF-2 (high severity): No SMART bar for outcome_link checking. — RESOLVED 2026-06-04.**
Closed by the reconciliation amend: Phase 1 step 3 now applies a SMART/quality bar to `outcome_link` —
a non-specific or non-measurable objective is itself a value-risk finding (the value risk it anchors is
unfalsifiable), checked against the already-imported `okr-schema`. The check moved from type-only to
type-and-quality. Original finding retained below for provenance.

The node checks that the outcome_link names "a real outcome, not a feature" (via okr-schema), but
does not apply a SMART test to the outcome. ce-product-pulse applies the SMART bar (specific,
measurable, actionable, relevant, timely) to every metric/event/signal the operator proposes and
"push back on anything vague, vanity, or unactionable." Torres's OST requires that outcomes be
business outcomes (not solution outputs). An outcome_link that says "improve user experience" or
"increase engagement" passes the current node's "is it an outcome not a feature?" test but fails the
SMART bar — and a vague outcome_link makes the entire value-risk check unfalsifiable. The okr-schema
import provides the structure, but the body does not tell the lens to challenge the quality of the
outcome itself, only its type.
*Recommendation: add an explicit outcome-quality check to Phase 1 step 3 ("if the outcome is not
specific and measurable, that is already a finding — vague objectives make the value risk
unfalsifiable") and reference the SMART bar from the okr-schema / four-risks references.*

**CF-3 (medium severity): No handling of an absent or thin strategy canvas. — RESOLVED 2026-06-04.**
Closed by the reconciliation amend: Phase 1 now surfaces a **stop-and-resolve** finding when the
`strategy-canvas` binding is absent, empty, or unresolved, *before* running any value-risk check — a
product-strategy check against an absent canvas is not a product-strategy check. Original finding
retained below for provenance.

Phase 1 step 2 reads the strategy canvas on-demand. The node does not specify what to do when the
canvas is absent, thin, or unmaintained — a common real-world state for an early-stage harness.
ce-product-pulse handles this explicitly: "If STRATEGY.md does not exist, note that explicitly in
chat: no strategy doc on file, running setup from scratch, and mention that ce-strategy can seed
pulse later if run first." ce-strategy handles it similarly (Phase 0 routes by file state; missing →
first run). plan-ceo-review handles it: "No design doc found — offer the prerequisite skill." In
stack-graph terms, if `strategy-canvas` (external) resolves to an empty binding or an absent file,
the lens currently has no fallback — it would silently check the solution against nothing, producing
findings that look grounded but are not.
*Recommendation: add a Phase 1 step 2a: "if the strategy canvas cannot be read (absent, empty, or
binding unresolved), surface that as a stop-and-resolve finding before running any value-risk check
— a product-strategy check against an absent canvas is not a product-strategy check."*

**CF-4 (medium severity): No link to post-ship outcome measurement (the closing loop). — RESOLVED 2026-06-04 (prose only, no edge).**
Closed by the reconciliation amend: the Output/Contract section now names `debrief`'s post-ship
confirm/kill as the downstream consumer of the recorded strategy frame (four-risks evidence-state +
served objective), making the earns-keep measurement loop legible. **No graph edge was added** — D44
holds (the lens writes no carrier); the link runs through the carrier record the PM/operator gate owns.
Original finding retained below for provenance.

The earns-keep metrics for product-lens (ship-then-discover-it-was-wrong events trend down; front-
stage findings displace debrief surprises) require post-ship signal to be measured. The node
correctly does not emit a pulse / analytics call (that is post-ship, not pre-build), but it does not
name the downstream node that provides that signal, nor does it name what the lens's recorded
strategy frame feeds into post-ship. ce-product-pulse closes this loop explicitly: it reads
STRATEGY.md (the canvas product-lens reads) and measures whether shipped items delivered on the
objectives they claimed. The node's earns-keep is therefore unfalsifiable without a named post-ship
signal source. In the graph, `debrief` is the intended downstream consumer of the carrier record
product-lens populates — but neither the body nor the edges name this dependency.
*Recommendation: add a note in the Contract (Output) section that the recorded strategy frame
(four-risks evidence-state + served objective) feeds the `debrief` node's post-ship confirm/kill
check — making the measurement loop explicit without adding a graph edge.*

**CF-5 (low severity): The four-risks at item altitude are not distinguished from the four-risks at
discovery altitude.**
The node correctly scopes to item altitude and cites the `four-risks` reference. But the body does
not explicitly name the key item-altitude adaptation: at item altitude, the risks are ALREADY scoped
past the venture-level question (does this business model work?) to the specific-item question (does
THIS implementation of THIS solution, for THIS item, work for the business?). SVPG's taxonomy names
this: the discovery loop kills the venture-level risk; delivery's job is to kill the item-level risk
(does this specific design decision serve the value proposition we've already validated?). Without
naming this distinction explicitly, a lens operator could apply the discovery-altitude risk check
(which would be too broad and redundant with strategy-curator's work) instead of the item-altitude
check. plan-ceo-review's 0C Dream State Mapping (current → this plan → 12-month ideal) is the
closest analogue — it keeps the check scoped to the specific plan, not the venture.
*Recommendation: add a one-sentence clarification to "The check you run — the four risks at the item
altitude" section distinguishing item-altitude risk (does this specific item's design serve the
already-validated value proposition?) from discovery-altitude risk (is the value proposition
itself valid?) — the latter is strategy-curator's job, not product-lens's.*

## Open questions

- **`okr-schema` as an ADDED import (the one judgment call).** The scope_hint listed `okr-schema`
  "optionally (to check 'serves the OKR')" and named only `four-risks` + the strategy-canvas as the
  required refs. Resolved to **include it, `load: import`**: the lens's core check is "does the
  solution serve the **objective** it claims" (D43 — "serves which objective?"; the work-item's
  `outcome_link` points at an objective), and checking that the named objective is a real *outcome*
  (not a feature) needs the OKR structure. It is short and needed on every value-risk pass, so `import`
  not on-demand. Flagged rather than silently added — the operator/validate should confirm it belongs
  (the alternative is to leave the objective check to prose + the work-item's own link, dropping the
  edge; the recommendation is to keep it, since an authored objective link the lens must verify is a
  first-class, analyzable dependency, D38).
- **Finding contract: emitted-to, not edged (RESOLVED, mirror the lens family).** product-lens emits to
  the front stage's finding contract so its findings rank/route with the code/design lenses', but it
  declares **no edge** to findings-schema / severity-scale / confidence-anchors — the stage holds those
  imports. This mirrors the code lenses (the contract is spawn-passed to them; here it is the contract
  of the stage product-lens composes into). The body says "emit to the same finding contract the
  front's lens dispatch uses"; no `references` edge to the contract is authored.
- **The skill-composing-into-a-front shape (RESOLVED by D36, noted for the spec).** product-lens is the
  first **skill** that `composes-into` a stage the way the **agent** lens family does — a deliberate
  hybrid (D36: product/strategy review is main-thread). The composes-into-from-its-own-side +
  shared-contract pattern is borrowed from the lens family; the main-thread/operator-in-loop execution
  is borrowed from `design`. Worth a spec note (07-decomposition) that "a lens may be a skill when the
  dimension needs the live thread" — but not a blocker for authoring; the edges and body are
  unambiguous.
- **personas — left ambient (no edge).** The lens checks the **target user** at item altitude, which it
  reads from the canvas + the work-item; the PM-owned `personas` surface is the discovery loop's +
  experience thread's. Resolved to **no personas edge** (matches `design`, which reads personas via
  bindings with no edge) — the canvas carries the target-user frame the lens needs; a deeper persona
  read is the discovery loop's job. The operator may later add a personas binding via overlay if a
  harness wants it.
- **CF-1 through CF-4 applied (2026-06-04 reconciliation amend); CF-5 remains a cleanup candidate.**
  CF-1 (pushback discipline), CF-2 (SMART outcome bar), CF-3 (absent-canvas stop-and-resolve), and CF-4
  (post-ship loop named in prose, no edge) are now folded into the canonical per the cluster-C
  reconciliation verdicts. CF-5 (item vs discovery altitude distinction) is low-severity and is left for
  a later cleanup pass. **Explicitly out of scope for this amend:** no `severity-scale` ref and no P0–P3
  were added — product-lens is a strategy lens, not a D58 findings-severity emitter; its findings model
  (cleared/open/stop + the shared front contract) stays as-is.
