---
title: Product-dashboard — design (the strategic surface)
status: working draft — 2026-06-01
---

# Product-dashboard — design

The **product-dashboard** is the operator's single strategic surface — the *home base* for steering the
product. It hosts:

1. **Product vision & strategy** — where we're going (the apex of the outcome layer).
2. **Progress toward it** — OKRs, north-star, KPIs, strategic analytics: *how far have we come.*
3. **The work ledger** — one ledger of every feature across its lifecycle, rendered as two views that
   lead on *different* axes (not "co-equal" hand-waving):
   - the **forward view** — **operationally first-class**: the *active workspace* where work matures
     (idea → discovery → ready) and where we see what's building and what's next;
   - the **record** — **durably primary**: the *durable memory* of what we built, why we made the call,
     when, and how it ladders to the vision. The record is the centre of *durable* value; the forward
     view is the centre of *daily* work. Neither is subordinate — they lead on different axes.

Renamed from "roadmap" per the operator's call (proposed **D49**). It is the rendered union of the
**outcome layer** (D43) and the **work ledger**, surfaced across both PM faces: the strategy/discovery
loop feeds vision + OKRs; the delivery coupling feeds the ledger.

**What's built when — the anti-deferral stance.** Reflexively deferring *buildable, needed* work is the
pre-AI habit to resist: a feature is an hour, not a quarter, so "we'll do it later" is *usually* the wrong
call. Build what's buildable and needed now — here, the Vision/OKR home, the full forward view, the
record, the sprint log. But "later" is sometimes honest, for two reasons we **name explicitly** rather
than dress up as staging: (a) **input-gated** — the capability's subject data does not yet exist (strategic
product analytics need real user signal); (b) **not-yet-needed at this maturity** — it serves no current
outcome and would only add cost/complexity now (e.g. heavier gates, the full business-model graph — the
maturity dial, §2.6). The discipline is honesty about *which* reason applies, not a blanket ban on
sequencing.

Child of the PM pack (`docs/product-management-design.md`, D43). Entries are carriers (D44). Graph
translation: `docs/pm-graph-map.md` (to be extended from this).

## Spec touchpoints

| Spec doc | Section | Relationship | Core / PM-pack |
|---|---|---|---|
| `01-concepts` | The outcome layer; carriers & gates; maturity × tier dial | The dashboard *is* the outcome layer made into a surface; entries instantiate the carrier; the dial sets gate rigour | Core |
| `02-graph-spec` | The carrier | Ledger entry = carrier; the forward view renders pre-build lifecycle states, the record renders post-build | Core |
| `06-analytics` | Instrumentation / conformance | The Progress panel consumes **product** analytics; distinguish from **factory** analytics (graph performance) — shared machinery, different subject | Seam (note) |
| `07-decomposition` | Decomposing a function | The dashboard is the PM pack's delivery-coupling surface — a curator-over-carrier instance | PM-pack illustration |
| *(decisions)* | D32, D43, D44, D45 | Applies strategy-over-backlog (D32), the outcome layer + two faces (D43), the carrier (D44), the maturity dial (D45); **proposes D49** | — |

## 1. The role — one surface, four questions

- **Where are we going?** → *Vision & strategy.*
- **How far have we come?** → *Progress* (OKRs, north-star, analytics).
- **What are we working on, and what's next?** → the *forward view.*
- **What have we built, and why?** → the *record.*

The home base across both PM faces — the **strategy/discovery loop** surfaces vision + OKRs; the
**delivery coupling** surfaces the work ledger; **progress** measures the second against the first.
Largely a **rendered/read surface assembled from several sources** (§6), not a single-writer document.

## 2. The work ledger — forward view + record

One ledger of carriers (D44), rendered by lifecycle zone:

```
   FORWARD VIEW  (active workspace)        IN FLIGHT          RECORD  (durable memory)
   ┌───────────────────────────────┐    ┌──────────┐    ┌──────────────────────────────────┐
   │  later · next · now           │ →  │ building │ →  │ shipped · live · parked · killed   │
   │  idea → exploring → committed │    │          │    │ what + why + evidence + when       │
   │  (matures here, often in days)│    │          │    │ + contribution-to-vision           │
   └───────────────────────────────┘    └──────────┘    └──────────────────────────────────┘
        explore lane  ──────────────────────────────────►  exploit lane
                         (lane gate is evidence-triggered, not calendar-triggered)
```

**One carrier identity, multiple projections.** An entry is a single carrier (D44); the dashboard never
duplicates it — it *projects* it three ways: the **forward workspace** (opportunity maturity), the
**delivery traversal** (in-flight stage, projected from the dev-sprint), and the **durable record**
(decision + evidence history). A parent whose children sit at different stages is still one identity with
many projected facets — the surface renders facets, it does not fork the carrier.

Direction coherence is a property of the whole ledger: **every entry, forward or recorded, traces to an
outcome → the vision.**

### 2.1 The forward view — where features mature (the active cockpit)

Not a thin afterthought, and not a hoarded backlog: a **fast-flowing maturation workspace.** Work enters
as an idea or opportunity (a *problem* worth solving, not a pre-committed feature) and matures — often in
days — through:

- **Later / explore** — raw opportunities & outcomes; low commitment; problem-framed.
- **Next** — opportunities under *active discovery*: the four risks examined at the maturity bar, the
  value-prop **being tested** (evidence accruing to the bar, not "cleared") — *still problem-framed, not
  solution-locked* (Torres).
- **Now** — committed: the solution has crystallised; building or ready to. Exploit lane.

This is where the **thinking** happens — discovery, clearing the four risks, letting a solution
crystallise before we commit. **Low inventory** (nothing lingers — the AI-world "kill the backlog"
point), **high function** (it's the cockpit, not a parking lot). It maps directly to the carrier's
`lifecycle_state` (the pre-delivery states `idea` → `discovery` → `defined` → `committed`).

*Why it must exist (the operator's point):* **a feature needs a place to mature and get built out, even
if only for a few days until the next sprint.** Without it, an idea has nowhere to move from "maybe" to
"ready" — discovery would be homeless, and we'd either build un-vetted things or drop them on the floor.
The forward view is precisely the *"nothing gets dropped"* guarantee, realised as a workspace rather than
a backlog.

### 2.2 The record — durable memory (record-primary)

The centre of *durable* value, and the artefact's reason for existing once a feature has shipped.

> The record is a durable, queryable ledger of *what we built, why it was the right thing, when, and how
> it ladders to the vision.* It is **not** a delivery schedule, **not** a feature list, **not** a task
> tracker.

**Why record-primary — the AI-native argument.** When a feature takes under an hour, the *forward-
planning* job shrinks (you don't sequence a 6-month queue you can build in a week), and the durable value
moves to the record. Corroborated across the research:

- **The backlog is vestigial** — nothing lingers; a large backlog is stale inventory and a tax on
  thinking (confirms D32, *strategy over backlog*). *(This is about not hoarding a future queue — it does
  not diminish the forward view, which is a high-throughput workspace, not an inventory.)*
- **The bottleneck moved from delivery to discovery** (Cagan, 2025) — so the value is in *recording that
  discovery happened and what it concluded.*
- **Coherence is now the scarce good** — cheap output makes *incoherent* output the failure mode; the
  record keeps a fast product coherent.

**The record's three jobs:**

1. **Process legibility — the deliberate-decision evidence.** Every build carries durable proof it went
   through discovery and *examined* the four risks at the maturity-appropriate bar — i.e. that we made the
   call deliberately on the best evidence available *at the time*. (Whether it turned out *right* is a
   separate question, answered later by the Progress panel + `debrief`.) Gate decisions are *kept*, not
   discarded once an item ships. *This is the record's core.*
2. **Contribution mapping.** Each build ladders to an outcome → the vision via an **authored**
   `outcome_link` — not an inferred edge (the D38/D39 *authored-not-inferred* traceability principle) — so
   the by-contribution view is a trustworthy rollup, not a guess. (Feeds the Progress panel.)
3. **Progress comprehension.** A durable place to understand where we are and what we've done — via the
   record plus each entry's auto-projected state (§2.5).

### 2.3 The entry (= carrier D44 + record content)

**Carrier state — projected or decided, never hand-curated as a plan:** `id`, `title`; `lifecycle_state`
(`idea|exploring|committed|building|shipped|live|parked|killed`, advanced *at gates*); `current_stage`
(**projected** from dev-sprint traversal, operator-overridable); `transition_history[]` (projected — the
**"when"** + the journey); `gate_decisions[]` (appended at each gate:
decision/owner/timestamp/evidence/confidence/conditions/override — **the deliberate-decision evidence: proof we made the
call on the best evidence available; the record's spine**); `children[]` (decomposition; parent aggregates).

**Record content — curator-maintained, PR-gated (the deliberate "why"):** the problem/opportunity
statement; `outcome_link` (the OKR it serves → vision laddering); `value_prop_link` (the VPC job/pain/gain
— Strategyzer); `risk_state` (the four-risks evidence-state, strength × maturity bar, per
`graph/_refs/four-risks.md`); `tier` (T1/T2/T3 dial override); the solution summary (**only once it
reaches Now**); `links` (spec-amendment PR, build PRs, experience-contract, debrief); `disposition` (for
parked/killed: the reason — **killed entries are kept**, the anti-portfolio learning record).

`gate_decisions[]` + `risk_state` + `transition_history[]` together *are* the operator requirement:
"document that we went through the process… what we built and why… when we built it."

### 2.4 Methodology grounding (PM-pack, not core)

SVPG: entries are outcomes/problems not features; discovery precedes commitment. Strategyzer:
explore/exploit lanes, bets carry validation state, kill is first-class and retained. Four-risks (our
ref): the `risk_state` record, maturity-aware. Torres: opportunities-not-solutions in the forward view.
All **PM-pack** — the core contributes only the carrier (D44), the outcome-layer slot (D43), and the dial
(D45).

### 2.5 Progress & the sprint record (the re-homed "record sprint progress")

Progress is **recorded, but off the forward cockpit.** Two mechanisms: (a) **auto-projected state** — an
entry's `current_stage` + `transition_history` are derived from the work itself, so single-item progress
needs no manual tracking; (b) a thin **sprint-record layer** beside the ledger (goal · entries touched ·
evidence/shipped · decision), assembled from the same traversal + gate events — a *view*, not a second
source of truth. (BC's `sprints/*.md` is the prior art.) Neither the forward view nor the record degrades
into a task board (the most-cited failure mode).

### 2.6 Cadence, lifecycle & the dial

**Rolling, not quarterly** (`debrief` feeds reprioritisation + the discovery loop). **Forward items
expire** (stale bets culled or re-validated — the workspace stays small). **Kill is first-class and
retained.** **Maturity × tier (D45):** per-product maturity sets the default evidence bar, per-item tier
overrides; **pre-launch / founder-led runs light gates** so intuition can move with weak→moderate
evidence; first-users tightens; scale demands observed data. The four *questions* never change — only the
*bar*.

## 3. Vision & strategy — the apex

The durable home for product direction, fed by the **strategy/discovery loop** (`strategy-curator`, the
upstream PM face) and modelled on a CE-style `STRATEGY.md` (durable, short, anti-fluff — D32 prior art).
Its components:

- **Vision** — the long-term concept of what we're building toward.
- **Guiding policy** — the strategic approach (Rumelt's kernel: diagnosis → guiding policy → coherent
  action); the leverage we're betting on.
- **Who & the job** — target user(s) + JTBD (the personas the experience thread builds on, D47).
- **North-star + input metrics** — the yardstick; the bridge into the Progress panel.
- **Open questions** — the key questions to answer over time (what discovery is chasing).
- **Decided / not-doing** — explicit non-goals, so the forward view stays coherent.

These are the targets each ledger entry ladders to via `outcome_link`. **Built now** — it must exist for
entries to point at something; it is durable product *memory*, not a plan, and short by design.

## 4. Progress — OKRs, north-star, strategic analytics

*How far toward the vision.* **OKR progress is shown now** (it's the yardstick; it needs no usage data —
just the targets and our own read of them). The **strategic product-analytics** layer (north-star/KPI
trends from real behaviour) is **input-gated**: it lights up when there is user signal to show — *not
deferred, simply waiting on data that does not exist pre-launch.*

**Namespace three streams hard — never pool them in one "analytics" bucket** (the seam leaks otherwise):
(1) **product outcomes** — the product's performance toward its OKRs (the Progress panel's subject); (2)
**factory conformance** — how the **graph itself** performs (`06-analytics`: conformance, AX,
tokens/latency); (3) **carrier projection** — the dev-sprint traversal events that project an entry's
stage/history. Note the deliberate crossing: stream (3) consumes *factory* traversal events to derive a
*product*-side carrier state — which is exactly why the three must stay namespaced, not merged.

## 5. What's built now vs input-gated (the no-deferral stance)

- **Built now (buildable + needed) — this is Arc B:** the Vision/OKR home; the **full forward view** (the
  maturation workspace + explore/exploit lanes + light gates); in-flight; the record; the sprint log; OKR
  progress.
- **Input-gated (waits only on data that doesn't exist yet):** the strategic product-analytics layer of
  the Progress panel — needs real user signal.
- **The stance:** we do not defer buildable work. The maturity evolution (founder-led → first-users →
  analytics-driven) is honoured by *what data is available to consume*, not by withholding capability we
  could build today.

## 6. Relationships (preview of the graph map)

- **strategy/discovery loop (`strategy-curator`) →** Vision & Progress panels (vision, OKRs).
- **outcome layer (D43) →** the contribution axis + Progress.
- **dev-sprint →** the carrier travels it; traversal events **project** stage/history. Stages read the
  carrier, hold no write-edge.
- **gates →** advance `lifecycle_state` + append a `gate_decision` (operator decision, not a node).
- **`debrief` →** closes the record entry (KPIs vs the OKR) + reprioritises the forward view.
- **analytics/instrumentation →** Progress panel (product-analytics layer, input-gated).
- **The curator(s).** The ledger *content* is maintained by a curator — PR-gated, **content only** (not
  projected stage, not gates). Because the dashboard is **assembled from multiple sources** (vision from
  the strategy loop, progress from analytics, ledger from carriers), it is largely a rendered/read
  surface. The node is **`product-dashboard-curator`**, which maintains the work-item content of the
  product-dashboard (content only — not vision, not progress, not the projected stage, not gates).

## 7. Proposed decision & open questions

**Proposed D49 — the product-dashboard.** The operator's unified strategic surface — Vision & strategy +
Progress (OKRs/north-star/analytics) + the work ledger (forward view + record). The forward view is the
first-class active workspace where features mature; the record is the durable, **record-primary** memory
(centre of durable value, because AI-native build makes sequencing cheap and backlogs vestigial). Renames
"roadmap" → "product-dashboard". Built to the **no-deferral stance**: everything buildable now is built;
only data-dependent analytics are input-gated. Extends D32/D43; applies D44/D45. *(To be logged in
`decisions.md` once the parallel-chat commit coordination settles — not edited now to avoid collision.)*

Open (for the build / for review):
- **Surface & file format** — entry as graph-frontmatter node, JSON record, or markdown artefact? (BC:
  markdown-per-item + `manifest.json`.)
- **Vision/OKR storage** — how vision + OKRs are stored vs referenced; how `outcome_link` is expressed
  (field vs edge).
- **`children` decomposition** — edges vs embedded list.
- **The product-vs-factory analytics seam** — shared machinery, kept distinct.
- **Rendering** — how the four surfaces (and the contribution view) render for the operator.
  *Re-resolved by D65 (`docs/product-dashboard-two-surface-design.md`, 2026-06-08): the dashboard is **two
  surfaces** — Work ledger (home) + Strategy — with objectives, bets, IUs, and item detail reached **in place**
  (drawers / pop-outs / expand), the UI links mirroring the authored artefact links. This supersedes the
  five-page IA below (from `docs/dashboard-strategic-surfaces-design.md`, D64), whose components are preserved.*
  The (superseded) D64 model rendered five pages threaded as a throughline (vision → bets → objectives → work → record):
  - **Direction** (`""`) — the overview: vision apex, bets posture (two-axis rollup from
    `canvas.json` — lifecycle state *and* evidence-strength rung), per-objective key-result
    progress, in-flight strip, and recently shipped/learned. The answer to "does this product
    have coherent direction?" Direction is the home; the work-ledger moves to `/ledger`.
  - **Work ledger** (`/ledger`) — the Kanban forward-view + record (moved from the root slug).
  - **Progress** (`/progress`) — live OKR cascade: vision apex, each objective with key-result
    progress bars, contribution view (reverse index of `outcome_link`), north-star/KPIs
    (input-gated on real user signal, per §4 above).
  - **Vision & strategy** (`/strategy`) — the Product Strategy thesis: vision (composed from
    `objectives.md` apex, §3/4 — **not restated in `strategy.md`**), Rumelt kernel (diagnosis
    → guiding policy → coherent action), who & JTBD, open questions, decided/not-doing, and a
    compact bets rollup into the canvas. `strategy-doc` binds the **authored vision narrative**
    (the thesis); a harness **must not** bind `strategy-doc` to a canvas/bmd inventory — the
    canvas owns the bets, the strategy page owns the narrative + linkage. (Anti-redundancy rule.)
  - **Work-item detail** (`/item/<id>`) — cross-links: → objective → vision; → bet via
    `value_prop_link` (navigates to the canvas entry); risk-state grid; → debrief/record.
  Cross-link contract: every strategic surface carries the persistent spine breadcrumb
  `vision ▸ bets ▸ objectives ▸ work ▸ record`. The bets rollup reads the canvas via the
  optional `renderer.canvas-root` sub-key and **degrades gracefully** (narrative + objectives
  only) when the canvas is not bound.
