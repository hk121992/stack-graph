---
title: Incremental-improvement workflow — design (the standalone-IU light loop)
status: design draft — 2026-06-03
---

# Incremental-improvement workflow — design

A second, **lighter** loop alongside the heavyweight dev-sprint. The sprint is right for
**wholesale** change — a new capability, a carrier that earns a full front
(`align-context → design → specify → plan`) and a place on the product-dashboard. The
incremental loop is for **small, traceable improvement**: a single bounded change, specified
and delivered directly as a **standalone implementation unit (IU)**, with no parent
work-item and no front. It is modelled on Matt Pocock's tracer-bullet / vertical-slice
discipline: a standalone IU is a **complete vertical slice with proper testing**, and `build`
delivers it one-test-at-a-time, not all-tests-then-all-code.

The factory keeps the Workspace as the home of work; this loop does **not** move work into
GitHub issues. It borrows Pocock's *unit shape* (the vertical slice, HITL/AFK, tracer
bullets) and his *delivery discipline* (TDD inner loop), and expresses both in stack-graph's
own carrier/arc/node vocabulary.

## Spec touchpoints

| Spec doc | Section | Relationship |
|---|---|---|
| `02-graph-spec` | The carrier; Carrier instances; Cyclic semantics | **Amends** — adds a *standalone-IU* carrier-instance variant (a carrier-lite) alongside the work-item carrier; the loop's corrective edges are bounded `can-follow` cycles per the cyclic-edge discipline |
| `02-graph-spec` | Edges; `composes-into` | **Extends** — a second arc, `incremental`, derived from new `composes-into {id: incremental, stage}` edges; nodes are shared across both arcs by carrying two `composes-into` entries |
| `01-concepts` | The loop; Carriers & gates; maturity × tier dial | **Conforms-to** — the light loop *is* a loop instance; its single gate instances the gate model run at minimum rigour; the wholesale-vs-incremental split is a routing decision over the same loop machinery |
| `07-decomposition` | Granularity; Let goals draw the boundary; Node/edge/inline | **Conforms-to** — the standalone IU is sized by the existing granularity rule (one slice, one goal, files = scope); new stages are nodes only where they own control flow, else reuse |
| `04-harness-spec` | Bindings contract; instantiating a harness | **Extends** — adds an `improvements-root` binding (+ `improvements-manifest`) for standalone-IU instance storage and a `triage-source` binding; vendored contract, harness supplies values |
| `06-analytics` | Instrumentation; carrier-state projection | **Conforms-to** — every stage emits the same node-enter/-exit events; a standalone IU's `current_stage` projects exactly as a work-item's does, from a carrier-tagged event log |
| `08-devops` | Branch & label model; the two loops | **Conforms-to** — an incremental change lands on the same `<kind>/<slug>` branch/label model; factory-vs-harness loop routing is unchanged |
| `_refs/IU-schema` | Fields; Invariants; "The IU is not the carrier" | **Amends** — adds a `standalone: true` variant that *is* a (lite) carrier: it gains a minimal lifecycle + one gate + an `improves` target + the vertical-slice/testing contract as invariants |
| `_refs/work-item-schema` | The three kinds of state | **Conforms-to** — the standalone IU reuses the three-writers / three-kinds discipline at reduced scope (authored + projected; terminal snapshot optional) |
| *(decisions)* | D44, D45, F7 | Applies the projected-stage model (D44) and the maturity × tier dial (D45); the new arc's process edges are authored as a self-contained wiring set (no new F7 debt) |

## 1. Problem & motivation

### Why a second loop

The dev-sprint is the right machine for **wholesale** change, and it is deliberately heavy:
it produces a **work-item carrier** through a full front (`align-context → design → specify
→ plan`), registers it on the product-dashboard work-ledger, runs three operator gates
(commit-to-build, commit-to-land, live-confirmed), and closes with a `debrief` that reads
outcomes back against an `outcome_link`. That weight is *earned* when the change is a new
capability whose shape is uncertain, whose value must be argued, and whose progress the
strategic surface must show.

That same weight is **dead cost** on a small, well-understood improvement: fix a node's
thin acceptance criteria; tighten one lens's confidence anchors; add a missing test to a
reference's contract; correct a drift the handbook curator flagged. These do not need a
design phase, a specify phase, a plan phase, a work-item carrier, or a dashboard row. They
need: *say precisely what the slice is → build it as a tested vertical slice → review it →
land it.* Forcing them through the sprint front is the pre-AI habit of treating every change
as a project. (This is the **factory's own** most common change shape: stack-graph improves
*itself* by amending graph nodes and references — see the worked example in §3.)

### The wholesale-vs-incremental decision rule

The unit of the sprint is the **work-item** (a carrier with children). The unit of the
incremental loop is the **standalone IU** (one carrier-lite, no children). Route by this rule:

> **Use the sprint** when the change needs a *design decision* before it can be specified, or
> decomposes into *more than one* buildable slice, or must appear on the product-dashboard as
> tracked product progress (it advances an objective / is operator-visible work).
>
> **Use the incremental loop** when the change is a *single vertical slice* whose shape is
> already understood — no design fork to resolve, no decomposition, deliverable and verifiable
> on its own — and it improves an *existing* node, reference, or behaviour rather than
> introducing a tracked capability.

Crisp tie-breakers:

- **"Does it need `design`?"** If the change has an unresolved architectural fork, it is
  wholesale — the fork is exactly what `design` exists to settle. If the approach is obvious,
  it is incremental.
- **"Does it decompose?"** More than one slice ⇒ wholesale (a plan that sequences children).
  Exactly one slice ⇒ incremental.
- **"Would a stakeholder track it?"** If progress belongs on the strategic surface, it is a
  work-item. If it is internal craft/maintenance, it is incremental.

Escalation is a first-class outcome: a standalone IU that turns out to need a design decision
or to split into multiple slices is **promoted** to a work-item (see §4, the promote edge, and
§7 Fork E). The light loop never silently grows into a sprint.

## 2. The standalone-IU schema extension

Today `IU-schema` is unambiguous: *"The IU is not the carrier… they do not hold
`lifecycle_state` or `gate_decisions`."* That invariant holds **for child IUs** — the
decomposition artefacts a `plan` produces under a parent. The extension introduces a second,
explicitly-flagged variant that **is** a carrier (a *carrier-lite*), without disturbing the
child contract.

### The discriminator

A single boolean front-matter flag: **`standalone: true`**. It is the variant discriminator
and the schema's branch point.

- `standalone` absent / `false` → **child IU** — exactly today's contract. Lives in a parent
  carrier's `children[]`; holds no lifecycle, no gate. Untouched.
- `standalone: true` → **standalone IU** — a carrier-lite. Gains the fields below and the
  vertical-slice/testing invariants. Has no parent; *is* the work-item for its own change.

### Fields a standalone IU adds over a child IU

A standalone IU keeps all six child-IU fields (`id`, `goal`, `files`, `dependencies`,
`acceptance`, `size`) and adds:

| field | required | meaning |
|---|---|---|
| `standalone` | yes | `true`. The variant discriminator. |
| `improves` | yes | **The target this slice improves** — a typed pointer to the existing thing the change touches: `{ kind: node \| reference \| handbook-reference \| behaviour, id: <slug-or-path> }`. Because the factory improves *itself*, this is most often a graph node or a `_refs/` reference. Replaces the work-item's `outcome_link` (a standalone IU serves an existing thing, not an OKR). |
| `lifecycle_state` | yes (projected/authored split) | **Minimal lifecycle** — `proposed → in-delivery → landed → (parked \| dropped)`. Far shorter than the work-item's seven-state lifecycle: no `discovery`/`defined`/`committed` (no front to clear) and no `shipped`/`live` split unless the harness deploys (a `landed` item that deploys records `live` via the same land gate). |
| `slice_type` | yes | **`AFK \| HITL`** (Pocock). `AFK` = the loop can build → review → land it unattended; `HITL` = it carries a human decision/review point the agent must stop at. The loop **prefers AFK**; a HITL slice names *what* the human decision is. |
| `gate_decisions[]` | yes (empty until landed) | **One gate only** — the append-only log, same shape as the work-item's (`{seq, hash, gate, decision, owner, timestamp, evidence_refs, confidence}`), but the loop fires a **single** `commit-to-land` gate (see §4). No commit-to-build (there is no plan to commit to) and no separate live-confirmed unless the harness deploys. |
| `verification` | yes | **The vertical-slice proof** — how the completed slice is shown to be a complete path, not a layer fragment. Names the tests added (the tracer bullets) and the end-to-end behaviour they exercise. This is the structured home for "demoable/verifiable on its own." |

### The vertical-slice + testing contract, as schema invariants

The acceptance contract is **stronger** than a child IU's, because a standalone IU has no
plan/review to catch a horizontal slice upstream. These are validate-able invariants:

- **Vertical-slice invariant.** A standalone IU's `goal` + `acceptance` must describe a
  **complete path** that is *demoable or verifiable on its own*. A slice whose acceptance
  only asserts the shape of one layer (a schema exists, a signature is present) with no
  end-to-end observable behaviour is a **horizontal slice** and is rejected at `specify-slice`
  / validate. (Pocock: "a completed slice is demoable or verifiable on its own.")
- **Testing invariant (acceptance = tests pass + independently verifiable).** `acceptance`
  must include **at least one observable test condition**, and `verification` must name the
  tests that prove the path end-to-end. "Done" = those tests pass **and** the slice is
  verifiable in isolation. Effort is never the done signal. (Mirrors `build`'s existing
  acceptance-driven done signal, raised to a schema requirement for standalone IUs.)
- **Tracer-bullet ordering is a build invariant, not a schema field.** The schema requires
  *that* tests exist and prove the path; *how* they are written (one test → one impl → repeat)
  is the `build` inner-loop discipline (§4). The schema does not enumerate the cycles.
- **Single-slice invariant.** A standalone IU has **no `children[]`** and `dependencies` may
  reference only *other standalone IUs* (a small chain), never child-IU ids. If the work
  decomposes into multiple slices that must be sequenced and planned together, it is a
  work-item, not a standalone IU (promote — §7 Fork E).
- **Three-writers discipline preserved (reduced scope).** Reusing `work-item-schema`'s rule:
  the **gate** writes `lifecycle_state` + `gate_decisions`; the **author** (the operator via
  `specify-slice`) writes content (`goal`, `files`, `acceptance`, `improves`, `slice_type`,
  `verification`); `current_stage` is **projected** from the event log, never written. There
  is no separate curator (no dashboard content to maintain) and the **terminal snapshot is
  optional** — a standalone IU's history is short and its event log usually still present at
  close; the harness may opt into freezing for parity.

### Example standalone IU

A real factory-self-improvement: tighten a lens's confidence anchors and add the missing test.

```yaml
id: lens-correctness-confidence-anchors
standalone: true
improves:
  kind: node
  id: lens-correctness
goal: lens-correctness emits calibrated confidence values — a "high" finding means the same evidence bar every run, so review's confidence-gate stops dropping real defects.
files:
  - graph/lens-correctness/lens-correctness.md
  - graph/_refs/confidence-anchors.md
dependencies: []
slice_type: AFK
size: S
acceptance:
  - The confidence-anchors reference defines an evidence bar for each of {high, medium, low} with a concrete example finding at each level.
  - lens-correctness's body cites the anchor reference at the point it assigns confidence (no free-hand confidence).
  - A fixture finding-set run through the dispatch confidence-gate keeps the two seeded real defects and drops the seeded noise — the regression that motivated this slice.
verification:
  end_to_end: A seeded finding-set with two true defects + three noise items is reduced by the confidence-gate; the two defects survive, the noise is dropped — proving the anchor change flows through dispatch, not just the doc.
  tests:
    - graph/_refs/__fixtures__/confidence-gate.fixture.md  (the seeded finding-set + expected reduction)
lifecycle_state: proposed
gate_decisions: []
```

This is one complete path (reference → node citation → dispatch behaviour → a test that
proves the behaviour), demoable on its own, AFK, no design fork, no decomposition — a textbook
standalone IU.

## 3. How a standalone IU is stored (carrier-instance variant)

A standalone IU is a **carrier instance** (`02-graph-spec` "Carrier instances"), not a node.
It is stored exactly as the work-item instance is — a **markdown file with YAML frontmatter
+ body**, indexed by a **manifest** — but in its **own surface**, separate from the
work-ledger, because it is deliberately *not* on the product-dashboard (§6):

```
<improvements-root>/                 # new binding (§ harness-spec extension)
  manifest.json                      # committed derived index: [{id, file, improves, slice_type, lifecycle_state}]
  <id>.md                            # one standalone IU per file (frontmatter = the schema above; body = the slice narrative)
```

Two new bindings (vendored contract, harness supplies values):

| key | points at | notes |
|---|---|---|
| `improvements-root` | the standalone-IU surface dir | sibling of `surface-root`; holds `<id>.md` + manifest |
| `improvements-manifest` | the standalone-IU manifest | committed derived index |
| `triage-source` | where improvements are raised from | e.g. the handbook-curator drift queue, a `learn` store, an operator note (optional; §7 Fork D) |

Projected/runtime state (the event log) stays under the existing `event-log` binding's
`.stack-graph/` (gitignored) — a standalone IU's `current_stage` projects from the same
carrier-tagged event stream as a work-item's, with **no change to the analytics
instrumentation** (06-analytics conforms-to).

## 4. The loop design

The incremental loop is a **new arc, `incremental`** — a short, mostly-linear traversal with
one corrective loop. It is expressed exactly like `dev-sprint`: nodes carry `composes-into`
edges naming the arc and stage, and the arc is the derived union of those edges. **Shared
nodes carry two `composes-into` entries** (one per arc) — they are the same primitive,
reused, not duplicated.

### The stages

```
triage  →  specify-slice  →  build  →  review  →  land
   │            │                ▲        │
   │            │   (tracer-     └── fix ─┘   (review can-follow build — the only loop)
   │            │    bullet inner loop in build: RED→GREEN→repeat)
   └─ promote ──┴──→ (escalate to the dev-sprint front: a work-item carrier)
```

- **`triage`** *(new node — skill, collaborative)*. The entry. An improvement is identified
  (operator note, a handbook-curator drift finding, a `learn`/recall hit). `triage` applies
  the §1 decision rule: is this one vertical slice, or wholesale? If wholesale → **promote**
  (hand to the dev-sprint front; no standalone IU created). If incremental → it scaffolds the
  standalone-IU instance file (frontmatter stub) at `improvements-root`, sets
  `lifecycle_state: proposed`, and records the `improves` target. Light by design; on an
  obvious AFK slice the operator may pass straight through. *Goal:* every improvement is
  routed to the right loop and a standalone IU is never used for work that should be a
  work-item.

- **`specify-slice`** *(new node — skill, collaborative)*. The **only** front stage — it
  replaces `align-context + design + specify + plan` for a single slice. It writes the
  standalone-IU's content fields (`goal`, `files`, `acceptance`, `slice_type`, `verification`)
  and enforces the **vertical-slice + testing invariants** (§2) before build: is this a
  complete path? does acceptance include observable tests? is it demoable on its own? It tags
  `AFK`/`HITL`. It does **not** run the lens panel over a plan doc (there is no plan); the
  rigor moves to `review` at the end. *Goal:* a standalone IU enters build as a well-specified
  vertical slice, so build never has to invent the slice boundary or the test contract.
  *Optional lens:* for an `L`-ish or contested slice, `specify-slice` may run a single
  coherence lens over the IU spec (reusing `lens-dispatch` with `target: plan`) — a tuning
  dial, off by default for `AFK`/`S` slices to keep the loop cheap.

- **`build`** *(reused — the existing backbone node)*. Runs the slice in **`inline` mode**
  (one IU, main thread — exactly the mode the existing `build` node already defines for "a
  single XS/S unit with narrow files scope and no inter-IU dependencies"). The standalone IU
  *is* its single IU. Build reads `improves`, `files`, `acceptance`, `verification`. The
  **tracer-bullet inner loop is build's discipline** (see below). Reused as-is for `inline`;
  the only addition is that build must honour `slice_type: HITL` by pausing at the named human
  point (a small body amendment — §8).

- **`review`** *(reused — the existing review node)*. The lens panel vets the slice before it
  lands. Same `lens-dispatch`, same finding contract, same fix-loop. The `tests` lens is
  load-bearing here: it checks the vertical-slice/test invariants held in the *delivered*
  code. Confirmed defects loop back to `build` (the one corrective `can-follow`). For a small
  `AFK` slice the operator runs `review` in `autofix` or `headless` mode to keep it cheap.

- **`land`** *(reused — the existing land node)*. Holds the **single gate** and ships. For a
  standalone IU there is no upstream `reconcile`/`commit-to-land` from a sprint, so `land`
  fires its own `commit-to-land` gate directly (the node already supports "reachable directly
  when the gate decision is… recorded" and surfaces the gate if none is recorded). It invokes
  `ship` (tests → coverage → PR) then `deploy` per its modes; on a non-deploying harness it
  runs `staging-only`/PR-and-merge and the item reaches `landed`. *No `debrief`* — there is
  no `outcome_link` to read back; the loop closes at land.

### What's new vs reused

| Element | New / reused | Why |
|---|---|---|
| `triage` | **new** node (skill) | owns the route decision (incremental vs promote) + scaffolds the instance; no existing node does this |
| `specify-slice` | **new** node (skill) | the collapsed front; enforces the vertical-slice/test invariants; no existing single node does the four front stages' job for one slice |
| `build` | **reused** | `inline` mode already fits a single slice; small HITL-pause amendment only |
| `review` | **reused** | the lens panel is arc-agnostic; same finding contract |
| `land` / `ship` / `deploy` | **reused** | already standalone-capable and gate-holding; fires its own commit-to-land |
| arc `incremental` | **new** (derived) | the union of new `composes-into {id: incremental}` edges on `triage`, `specify-slice`, `build`, `review`, `land` |

### The tracer-bullet inner loop (inside `build`)

This is the heart of "Pocock's way," and it lives **inside `build`'s autonomous span**, not
as separate nodes (it is iteration, not control-flow branching — `07-decomposition`: keep
inline what owns no independent branching). The standalone-IU loop *requires* `build` to run
the vertical TDD cycle rather than the horizontal "all tests then all code" anti-pattern:

```
For the standalone slice:
  TRACER BULLET:  write ONE test for the first behaviour → RED (fails)
                  → minimal code to pass → GREEN  (the path is proven end-to-end)
  INCREMENTAL:    for each remaining behaviour in `acceptance`:
                    RED:   write the next test → fails
                    GREEN: minimal code → passes
                  (one test at a time; only enough code to pass; no speculative features)
  REFACTOR:       once all acceptance tests are GREEN, refactor under green
  DONE:           every `acceptance` condition is an observable passing test
                  AND `verification.end_to_end` is demonstrable → emit unit-complete
```

This is a **build-mode discipline for the `incremental` arc**, expressed in build's body (a
small amendment — §8), not a new schema field and not new nodes. It maps directly onto build's
existing acceptance-driven done signal; the addition is the *ordering* rule (vertical, not
horizontal) and the *minimal-code* rule. For a non-code improvement (e.g. a reference doc
slice), the analogue is "one verifiable claim → one edit → confirm," with the `verification`
fixture playing the test's role.

### HITL / AFK tagging

`slice_type` is set at `specify-slice` and **prefers AFK** (Pocock). It governs the loop's
autonomy:

- **AFK** — `triage → specify-slice → build → review → land` runs unattended end-to-end
  (review in `autofix`/`headless`, land's gate auto-recorded at the configured maturity if the
  tier permits). The operator sees the result, not each step.
- **HITL** — the slice carries a named human point (an architectural micro-decision, a visual
  review). `specify-slice` records *where* (which stage, what decision). `build` pauses at that
  point (the HITL amendment); `review` runs `interactive`. If the HITL point turns out to be a
  genuine design fork, that is the **promote** signal — escalate to the sprint (§7 Fork E).

### Cyclic-edge discipline (the one loop)

The arc has exactly one corrective loop — `review → build` (fix) — declared as `can-follow`
on `build`'s side, carrying the three required elements (`02-graph-spec`): **exit criterion**
(the actionable finding set is resolved), **max-attempt / escalation** (after N fix passes on
the same finding, surface to the operator — likely a promote signal), and a **labelled
re-entry** (`fix-loop` event). Happy-path edges (`triage → specify-slice → build → review →
land`) are `precedes`. The `promote` edge from `triage`/`specify-slice` to the dev-sprint
front is a one-way escalation, not a cycle.

## 5. How it differs from the sprint — side by side

| | Dev-sprint (wholesale) | Incremental loop |
|---|---|---|
| **Unit of work** | work-item carrier (with `children[]`) | standalone IU (carrier-lite, no children) |
| **Front** | `align-context → design → specify → plan` (4 stages) | `triage → specify-slice` (collapsed to ~1.5 stages) |
| **Design phase** | yes — resolves architectural forks | **skipped** — a slice with an unresolved fork is *promoted*, not built |
| **Decomposition / plan** | yes — plan decomposes into N child IUs, lens-vetted | **skipped** — exactly one slice; no plan doc |
| **Lifecycle** | 7 states (`idea→…→live`) | 4 states (`proposed→in-delivery→landed→parked/dropped`) |
| **Gates** | 3 (commit-to-build, commit-to-land, live-confirmed) | **1** (commit-to-land; live folded in if the harness deploys) |
| **Dashboard / ledger** | registered as tracked product work | **not** on the work-ledger (own `improvements-root` surface) — §6 |
| **Close** | `debrief` reads outcomes vs `outcome_link` | **no debrief** — closes at land; no outcome read-back |
| **Carrier writes** | curator maintains content; gates write lifecycle; projection derives stage | author (specify-slice) writes content; single gate writes lifecycle; projection derives stage; no curator |
| **Testing rigor** | plan sets acceptance; build delivers; review vets | **same or stronger** — vertical-slice + test invariants enforced at specify-slice and review |
| **Review** | full lens panel | **kept** — same lens panel (cheaper modes for AFK) |
| **Landing** | `reconcile → land` with gate | `land` with its own gate — **kept** |

**What the incremental loop keeps (non-negotiable):** the **testing rigor** (raised to schema
invariants), the **review** lens panel, and the **landing** discipline (gate + ship + PR/deploy
on the same branch/label model). **What it skips:** the whole front (`align-context`, `design`,
`specify`, `plan`), the **work-item carrier**, the **product-dashboard registration**, and the
**debrief**. The skips are exactly the parts that exist to *decide what to build and argue its
value* — which a single, understood vertical slice does not need.

## 6. Relationship to the dashboard / ledger

**Recommendation: a standalone IU does NOT appear on the product-dashboard work-ledger.**

Reasoning, grounded in the existing model:

- The product-dashboard is the **record-primary strategic surface** — it shows product
  *progress* against vision/objectives. A standalone IU has **no `outcome_link`** (it improves
  an existing node/reference, it does not advance an OKR), so it has nothing to project onto
  the strategic surface. Putting it there would dilute the ledger with craft/maintenance noise
  — the precise failure the "would a stakeholder track it?" tie-breaker guards against.
- The work-item-schema's three-kinds machinery (curator content, `risk_state`, `tier`,
  `frozen_timeline`, `outcome_link`) is **carrier-for-tracked-product-work** machinery. A
  standalone IU deliberately does not carry most of it. Forcing it onto the ledger would mean
  inventing null/empty values for fields that have no meaning for it.
- It still gets **full instrumentation**: its events flow to the same `.stack-graph/` event
  log, so `current_stage` projects and the analytics loop sees it — it is *measured*, just not
  *merchandised on the strategic surface*.

Where it **is** surfaced: its own **improvements surface** (`improvements-root` manifest),
which the workspace portal can render as a separate, lightweight "improvements log" tab —
visible and auditable, distinct from the product work-ledger. This keeps the strategic surface
honest (only tracked product work) while still giving the incremental loop a durable, visible
home.

*Bridge case:* if a stream of related standalone IUs reveals an emergent capability worth
tracking, that is the **promote** signal — fold them into a work-item whose `links` cite the
standalone IUs that motivated it. The improvements log is then the anti-portfolio / provenance
for the work-item.

## 7. Decisions / forks for the operator

Each fork states the genuine choice and a recommendation.

- **Fork A — Does a standalone IU get its own lifecycle, or stay ephemeral?**
  *Choice:* (a) a minimal authored lifecycle + one gate (carrier-lite), or (b) ephemeral —
  build/review/land with no persisted carrier state.
  **Recommendation: (a) carrier-lite.** The factory's value is the *traceable record* (the
  whole point of "Pocock's traceable approach"). A minimal `lifecycle_state` + one
  `gate_decisions` entry costs almost nothing and gives durable provenance ("this node was
  changed, when, by which slice, with what evidence"). Ephemeral throws away exactly the trace
  the operator asked for.

- **Fork B — One gate or zero gates?**
  *Choice:* (a) a single `commit-to-land` gate, or (b) no gate (AFK slices land on green tests
  alone).
  **Recommendation: (a) one gate, run at the maturity × tier dial.** Keep the gate in the
  model so the record always shows a deliberate land decision; but for an `AFK`/low-tier slice
  in a mature harness, the dial lets the gate auto-record on green (cheap, still logged). This
  preserves traceability without operator friction. Hard gate only rises for HITL/high-tier
  slices.

- **Fork C — Carrier-lite instance file, or a row in the work-item manifest?**
  *Choice:* (a) standalone IUs live in their own `improvements-root` surface, or (b) they
  share the work-items surface with a `standalone: true` flag.
  **Recommendation: (a) own surface.** Keeps the work-ledger clean (§6) and lets the portal
  render an "improvements log" separately. Reuses the same instance-file + manifest pattern, so
  no new storage mechanism — just a second surface and binding.

- **Fork D — Where is an improvement triaged from?**
  *Choice:* (a) operator-initiated only, (b) also auto-fed from the handbook-curator drift
  queue / `learn` / recall, via a `triage-source` binding.
  **Recommendation: (b), but operator-gated.** Wire the `triage-source` binding so drift
  findings and learnings can *seed* candidate improvements, but `triage` still applies the
  decision rule and the operator confirms before a standalone IU is created. This connects the
  factory's existing drift-detection to the loop without auto-spawning work. (Input-gated:
  build the binding now; the auto-feed is on when those queues carry findings.)

- **Fork E — When a standalone IU outgrows itself, promote or split-in-place?**
  *Choice:* (a) `promote` — escalate to the dev-sprint front, creating a work-item; the
  standalone IU is closed (`lifecycle_state: dropped`, reason: promoted) and cited by the new
  work-item, or (b) let the standalone IU grow `children[]` in place.
  **Recommendation: (a) promote.** (b) violates the single-slice invariant and would smuggle
  the heavy machinery back into the light loop. Promotion is clean, keeps each carrier type
  pure, and preserves the trace (the work-item cites the slice that triggered it).

- **Fork F — Is the terminal snapshot (`frozen_timeline`) required for standalone IUs?**
  *Choice:* (a) required (parity with work-items), or (b) optional.
  **Recommendation: (b) optional.** A standalone IU's history is short and its event log is
  usually still present at close; the freeze cost rarely pays off. Make it a harness dial
  (default off), turn on only if a harness gitignores its event log aggressively and wants
  durable timelines for improvements too.

- **Fork G — Does `specify-slice` ever run the lens panel?**
  *Choice:* (a) never (rigor lives only at `review`), or (b) optional single coherence lens for
  `L`/contested slices.
  **Recommendation: (b), off by default.** Keep `AFK`/`S` slices cheap; allow a one-lens
  coherence check as a dial for the rare large/contested slice, so the loop can stretch without
  forcing a sprint. (If a slice routinely needs the full panel at specify time, that is itself
  a promote signal.)

## 8. What to build (for a follow-up session — do NOT build now)

A concrete, ordered build list. Mirrors the dev-sprint backbone's wave discipline.

**Schema edits (references):**

1. **Amend `graph/_refs/IU-schema.md`** → add the **standalone variant**: the `standalone`
   discriminator; the added fields (`improves`, `lifecycle_state`, `slice_type`,
   `gate_decisions[]`, `verification`); the vertical-slice + testing invariants; the
   single-slice invariant; the three-writers note at reduced scope. Bump to `v0.2.0`. Keep the
   child-IU contract verbatim (regression-proof the "IU is not the carrier" line by scoping it
   to `standalone` absent/false).
2. **Amend `graph/_refs/bindings-contract.md`** → add `improvements-root`,
   `improvements-manifest`, and `triage-source` keys + a second surface-structure block for the
   improvements surface. Bump version.

**New nodes:**

3. **`graph/triage/triage.md`** *(skill, collaborative)* — the route-and-scaffold entry.
   Edges: `composes-into {id: incremental, stage: triage}`; `references IU-schema (import)` +
   `bindings-contract (on-demand)` + `instrumentation-preamble (import)`; `precedes
   specify-slice`; a one-way `promote` seam to the dev-sprint front (expressed as `precedes
   align-context` **gated by the promote decision**, or as prose if a typed `escalates` edge is
   preferred — Fork to confirm at build). Goals: correct routing; no misuse of standalone IU.
4. **`graph/specify-slice/specify-slice.md`** *(skill, collaborative)* — the collapsed front.
   Edges: `composes-into {id: incremental, stage: specify-slice}`; `invokes explore` (scoped
   context fill); `references IU-schema (import)` + optionally `lens-dispatch (on-demand)` +
   `instrumentation-preamble (import)`; `can-follow triage`; `precedes build`. Body: write the
   standalone-IU content fields; enforce the vertical-slice + testing invariants; set
   `AFK`/`HITL`. Goals: a well-specified vertical slice enters build; horizontal slices are
   rejected here.

**Node amendments (reused nodes gain the `incremental` arc + small behaviour):**

5. **Amend `graph/build/build.md`** → add `composes-into {id: incremental, stage: build}`; add
   `can-follow specify-slice`; add the **tracer-bullet inner-loop discipline** as an
   `incremental`-arc build-mode section in the body (RED→GREEN→repeat, minimal code, vertical
   not horizontal); add the **`slice_type: HITL` pause** rule. No new IU fields consumed beyond
   `verification`.
6. **Amend `graph/review/review.md`** → add `composes-into {id: incremental, stage: review}`;
   confirm the `tests` lens checks the vertical-slice/test invariants in delivered code. The
   `review → build` fix loop is reused (already declared on build's side).
7. **Amend `graph/land/land.md`** → add `composes-into {id: incremental, stage: land}`; confirm
   the standalone path fires its own `commit-to-land` gate and that a non-deploying harness
   reaches `landed` via `staging-only`/PR-merge. (`ship`/`deploy` reused unchanged.)

**Edge wiring (the `incremental` arc):**

8. Author the arc's process edges as a **self-contained set** (no new F7 debt — all endpoints
   exist after steps 3–7): `triage → specify-slice → build → review → land` as `precedes`; the
   single `review → build` fix loop as `can-follow` on build carrying exit criterion +
   max-attempt/escalation + `fix-loop` re-entry label; the `promote` escalation as a one-way
   gated seam.

**Validate / index:**

9. Run `sg-graph-maintainer validate` (schema, edges, the new arc resolves, IU-schema variant
   discipline) then `index` (regenerate `graph-record.json` so the `incremental` arc appears as
   the union of the new `composes-into` edges).

**Handbook (spec amendments — labelled PRs via the curator):**

10. Amend `02-graph-spec` (the standalone-IU carrier-instance variant; the second arc note),
    `04-harness-spec` (the new bindings), and add a short `incremental`-loop note to `08-devops`
    / `01-concepts` (two loops by *weight*, not just by scope). Per the spec-touchpoints table.

**Explicitly NOT in scope now:** `triage` auto-feed from drift/learn queues (Fork D —
input-gated on those queues), the optional `specify-slice` coherence lens beyond a dial (Fork
G), and `frozen_timeline` for standalone IUs (Fork F — default off). Build the dials; leave the
behaviours off until needed.

## 9. Codex review (2026-06-03) — findings & resolutions

The design was put through an independent Codex soundness review before any build. Six findings,
all accepted. They **modify §2, §3/§6, and §4** and add items to the §8 build list. The build
session must apply these, not the unreviewed draft.

- **R1 — Carrier identity is a strict `oneOf`, not "IU + a flag" (biggest risk).** Do NOT model
  the standalone variant as "child-IU fields plus `standalone: true` adds more." Validation must
  treat the two as **mutually exclusive shapes** sharing some fields, or tools will eventually
  accept illegal hybrids. Hard exclusions to enforce at validate:
  - `standalone` absent/`false` → **forbids** `lifecycle_state`, `gate_decisions`, `improves`,
    `verification` (a child IU has none of these).
  - `standalone: true` → **requires** them and **forbids** `parent` and `children[]` and any
    child-IU-id `dependencies`.
  Restate the invariant honestly as **"child IUs are not carriers"** (scoped), not "the IU is not
  the carrier" (now false for the standalone shape). *(Amends §2.)*
- **R2 — Lifecycle writers are incoherent with one gate (must fix before build).** With a single
  `commit-to-land` gate, *who* moves `proposed → in-delivery`? The draft says gates write
  `lifecycle_state`, but `triage` sets `proposed` and the loop must enter delivery before land.
  As written this **violates the three-writers discipline**. Resolution: split the lifecycle —
  `proposed` and `in-delivery` are **authored/event-driven workflow state** (set by
  triage/specify-slice and the build-enter event), and only the terminal `landed`/`parked`/
  `dropped` transition is **gate-written**. Document the writer for *every* state explicitly.
  *(Amends §2 lifecycle + §4 land.)*
- **R3 — `promote` is a new `escalates` edge type, not gated `precedes`.** `precedes` means
  normal in-arc order; using it cross-arc pollutes traversal and stage projection (escalation
  would look like ordinary next-stage flow). Prose is too weak for a first-class outcome. Add a
  one-way **`escalates`** edge type to the taxonomy with explicit semantics: source stage →
  target arc/stage; creates-or-reuses a work-item carrier; closes the standalone IU as
  `dropped` (reason: promoted); records the provenance link. *(Amends §4 + adds a `02-graph-spec`
  edge-taxonomy touchpoint — this is a real taxonomy gap, flag to the handbook curator.)*
- **R4 — Shared `build/review/land` need carrier-keyed projection + an explicit carrier
  interface.** Event projection must key by **carrier id + carrier kind + arc id**, not carrier
  id / latest stage alone, or `current_stage` will bleed between the dev-sprint and incremental
  arcs. And the reused nodes (`land`, `review` especially) may assume work-item fields
  (`outcome_link`, `risk_state`, `children`, plan context, sprint gate history). The build must
  define an **explicit carrier interface** that reused nodes consume — not prose asserting they
  are "arc-agnostic." *(Amends §4 reuse table + §6 projection; adds a `06-analytics` projection
  touchpoint.)*
- **R5 — Dashboard boundary is right, but the provenance bridge is mandatory.** Keeping
  standalone IUs off the work-ledger is correct, but to avoid fragmenting provenance: a promoted
  work-item **must** cite its source standalone IU(s), and a node/reference's `improves` history
  must be **queryable from the target** (the improved node can answer "which slices changed me").
  Make the bridge a requirement, not a "bridge case." *(Strengthens §6 + Fork E.)*
- **R6 — The invariant most at risk is "three writers, three kinds, never crossed."** R1 + R2
  together blur authored lifecycle, gate-written lifecycle, and projected stage. This is the
  thing to get right before building anything; R1/R2/R4 are its concrete fixes.

**Build-list deltas (apply to §8):** step 1 (IU-schema amend) becomes a **`oneOf` schema** with
the hard exclusions of R1 and the explicit per-state writers of R2; add a new step **0** —
*amend `02-graph-spec` edge taxonomy to add the `escalates` edge type* (R3) — before the node
work; step 4/5/6 (reused-node amends) gain the **carrier-interface contract + carrier-kind+arc
projection key** (R4); step 2 (bindings) keeps the improvements surface but adds the
**queryable-`improves`-from-target** + **mandatory promote-provenance** requirements (R5).
