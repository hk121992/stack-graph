---
title: Artefacts & surfaces — format, storage, and binding
status: working draft — 2026-06-01 (Codex-revised)
---

# Artefacts & surfaces

The loop operates on **runtime artefacts** — the work-items it carries, the product-dashboard it renders,
the plans it produces, the sprint-records it keeps. The graph's *schemas* fix their **fields**; this spec
fixes their **format, storage, organisation, and how they bind to the graph** — the contract a harness
must satisfy for the loop to run. It resolves the open "surface & file format" question in
[`product-dashboard-design.md`](product-dashboard-design.md), generalises BC's prior art
(`bc-workspace/roadmap/`), and fits the harness topology
([`04-harness-spec/01-directory-topology`](../handbook/content/04-harness-spec/01-directory-topology.md)).
**This is the *factory contract*; instantiating it for a product is the *harness build*** (the next
prerequisite, not this doc).

**The spine of this spec — three kinds of state, strictly separate** (conflating them is the design risk):

1. **Authored facts** — committed, in the work-item file: curator content + the gate decisions that
   advance lifecycle.
2. **Projected facts** — derived from the event log in `.stack-graph/` (gitignored), **not** committed:
   the dev-stage the carrier is at + its traversal sequence.
3. **The terminal snapshot** — frozen into the closed record at a terminal state: the durable history; the
   *only* point a derived value enters a committed file.

A **carrier is not a node** (D44) — it is a runtime *instance*; this spec is about those instances and the
surfaces that hold them, distinct from **node storage** (`02-graph-spec` "Storage & projection", which is
about node *files*).

## Spec touchpoints

| Spec doc | Section | Relationship | Core / pack |
|---|---|---|---|
| `02-graph-spec` | The carrier; Storage & projection | Carrier **instance** storage (complements node storage); the projection reads the event log | Core |
| `03-plugin-spec` | Vendor pipeline | Schemas + format conventions are **general** (vendored); instances are **harness** — the plugin carries the contract, never the data | Core (boundary) |
| `04-harness-spec` | Directory topology; bindings | Artefacts live in `workspace/<surface>/`; bound via the bindings reference; `.stack-graph/` holds the projection | Core |
| `06-analytics` | Instrumentation / event log | Projected state is derived from the carrier-tagged event log | Core |
| *(decisions)* | D44, D49, D38 | Instances the carrier (D44 projected-stage); record-primary work-item (D49); authored links (D38) | — |

## 1. The principle

Artefacts are **markdown files with YAML frontmatter** (authored state) **+ a body** (narrative/content),
indexed by a **manifest**, living in **harness surfaces** (`workspace/<surface>/`), **bound to the
vendored nodes via the bindings reference** (no hardcoded paths). Derived/machine state lives in
`.stack-graph/` (generated, gitignored). This extends the graph's own *files-canonical /
frontmatter-structured / index-derived* pattern to runtime artefacts. *Decision: markdown + frontmatter +
manifest — not a JSON record, not a graph node.* It generalises BC, stays human-navigable and
renderer-friendly, keeps structured state machine-readable.

The committed/derived line follows one test: **`.stack-graph/` holds only state that is *derived*
and *replayable* from the event log** (the carrier stage, its traversal sequence); anything
*generative* and *non-replayable* must be committed. By that test, `capture-learnings`' proposals
archive — a model-synthesised list the next sprint reads to detect recurrence — is a **committed
file** (the `learnings-archive` binding → `workspace/<surface>/learnings/archive.md`), **never**
`.stack-graph/`: gitignoring it would silently destroy cross-sprint recurrence detection on every
fresh clone (D60).

## 2. The work-item artefact — authored facts only

**File:** `workspace/<dashboard-surface>/items/<id>.md`. Per `work-item-schema`.

**Frontmatter — authored only** (committed): `lifecycle_state` + `gate_decisions[]` (gate-written — the
committed record of every lifecycle transition), `stage_override` (operator, optional), `children[]`
(planned child ids), and curator content (`outcome_link`, `value_prop_link`, `risk_state`, `tier`,
`links`, `disposition`). **Body:** the problem/why, the solution (once committed), the `## Plan` (§4), the
decision/evidence narrative. **NOT in the file:** `current_stage`, `dev_transition_history` — projected
(§5). Canonical `lifecycle_state`: `idea → discovery → defined → committed → in-delivery → shipped → live →
(parked | killed)`.

## 3. The product-dashboard surface

A surface at `workspace/<dashboard>/` (the topology's "a surface per function output") — a content tree the
**portal renders as one navigable space**:
- **Vision & strategy** → `strategy.md` (vision · guiding policy · JTBD · open questions · decided — the CE
  `STRATEGY.md` shape).
- **Progress** → `objectives.md` (objectives / OKRs / north-star, per `okr-schema`); the strategic-analytics
  layer is input-gated (D49).
- **Work ledger** → `items/<id>.md` + `items/manifest.json` + `sprints/<id>.md` (§4). The **now / next /
  later** view is **derived from `lifecycle_state`** (later = `idea`/`discovery`; next = `defined`; now =
  `committed`; building = `in-delivery`; the record = `shipped`/`live`/`parked`/`killed`).

**Manifest** (`items/manifest.json`): a **committed, derived index** (`{id, file, title, lifecycle_state,
tier, outcome_link}` per item). Discipline (the handbook-index / graph-record pattern — *not* a second
source of truth): a deterministic **`refresh-index`** regenerates it; a **validation step fails on a stale
manifest** (the integrate gate / CI); refresh points = create/update item, gate decision, integrate,
terminal freeze. The item files remain authoritative.

**Degraded mode (no projection present).** A fresh clone or any context without `.stack-graph/` renders the
authored ledger and the **frozen snapshots of closed items in full**; **in-flight** items show
`current_stage` as **unknown/stale** until the projection rebuilds from replayed events. The surface never
implies full record fidelity without the projection. (Closed items are always complete — their timeline is
frozen and committed, §5.)

## 4. The plan artifact & the sprint-record

- **Plan:** the impl-unit breakdown is a **`## Plan` section in the work-item body**, each unit per
  `IU-schema`. At `build`, units may materialise as **child work-items** (`children[]`); the parent
  aggregates. A large plan may graduate to a linked `plan.md` per a harness-set threshold (`plan-policy`).
- **Sprint-record:** `workspace/<dashboard>/sprints/<id>.md` — goal · items touched · evidence/shipped ·
  decision (generalises BC's `sprints/`). Largely **assembled from the event log + gate decisions** (a
  view, per D49), not hand-kept.

## 5. State: authored / projected / frozen — the three-way split

The crux. `current_stage` and the dev-stage traversal are **never** hand-written into the work-item file;
the gate facts **are**.

- **Authored (committed).** `lifecycle_state` + `gate_decisions[]` (the committed lifecycle-transition
  record) + `stage_override`, written by gates (operator) + the curator (content). (§2.)
- **Projected (derived, `.stack-graph/`, not committed).** The `instrumentation-preamble` (06-analytics)
  emits a node-enter/-exit event **tagged with the carrier id** on every stage traversal → the event log.
  `current_stage` = the latest stage event for that carrier — **unless a `stage_override` is set, which
  wins**; `dev_transition_history` = the sequence. The dashboard render **joins** these onto the authored
  file. No stage or curator writes them (D44).
- **Frozen (terminal snapshot, committed).** When a carrier reaches a **terminal `lifecycle_state`**
  (`shipped`/`live` **or** `parked`/`killed`), a **recorder** writes the `dev_transition_history` snapshot
  into the closed record (`frozen_timeline`, a clearly-marked derived field). This is a **recorder action
  keyed off the terminal transition** — *not* a stage writing the carrier — and **decoupled from lifecycle
  advancement** (the gate advances the state; the recorder freezes the timeline). It runs via `debrief`'s
  fleet for `shipped`/`live` and via the kill/park recorder for `parked`/`killed`, so **no terminal item
  loses its timeline**. This is the only point a derived value lands in a committed file, and it lands
  once, at close.

## 6. Binding — factory contract vs harness instance

- **Factory (general, this repo):** the field schemas (`work-item-schema`, `okr-schema`, `IU-schema`), the
  format conventions (this doc), the projection mechanism, the surface-structure template, and the bindings
  contract (below). No product data.
- **Harness (the product workspace):** the actual surface (`workspace/<dashboard>/` + its content — real
  work-items, OKRs, strategy, personas), the bindings **values**, the deploy-config, the experience-contract
  instance. Built in the harness step, not here.
- **Bindings contract — the complete set of keys a harness must supply** (read via the bindings reference
  in `.claude/`, never hardcoded): `surface-root`, `items-root`, `manifest-path`, `sprint-records-root`,
  `strategy-doc`, `objectives-doc`, `personas`, `handbook-index`, `event-log` (the carrier-tagged stream
  path/shape under `.stack-graph/`), `renderer` (entrypoint + output/portal), `deploy-config`,
  `experience-contract`, `okr-binding` (how `outcome_link` resolves to an objective id), `plan-policy`
  (in-body vs linked threshold + link shape), `terminal-recorder` (who freezes the timeline), `maturity`
  (the dial setting), `stale-projection-policy` (degraded-mode policy).

## 7. Resolves — the dashboard design's open questions

- *"Surface & file format"* → §1 / §2 (markdown + frontmatter + manifest).
- *"Vision / OKR storage"* → §3 (`strategy.md` + `objectives.md`).
- *"`children`: edges vs list"* → §2 / §4 (a frontmatter **list** of child ids; graph **edges** stay
  between nodes, never instances).
- *"Rendering"* → §3 + §6 (the renderer is a bound contract: inputs, output/portal, degraded behavior).
- *"`outcome_link` stored"* → §2 (an authored frontmatter field, an authored link, D38).

## 8. Open / forks (resolved)

- **Manifest home** — *resolved:* committed-in-surface **with** the deterministic refresh + stale-check
  discipline (§3); it is the operator-facing ledger index. (Else it would be a second source of truth.)
- **Plan home** — *resolved:* in-body `## Plan` by default; a linked `plan.md` past a harness `plan-policy`
  threshold (§4/§6).
- **Renderer** — *resolved into the contract:* inputs / output / degraded behavior are bound keys (§6);
  whether it reuses the handbook renderer core (D46) is a plugin/harness-build choice.

## What this unblocks

With the artefact contract fixed, the two remaining prerequisites to **exercising** the loop are unblocked:
**(a) the plugin build** (vendor the nodes — they now know the artefact formats they read/write) and
**(b) the harness build** (instantiate the surfaces + bindings + content for BC, filling the OKR gap). This
doc is the contract both depend on.
