---
title: Advisory council — methodology-grounding board (working doc)
status: working draft v2 — 2026-06-01 (revised after Codex review + operator steer)
---

# Advisory council — methodology-grounding board

A **dev-time, non-authoritative board** that surfaces where the graph's **construction** may have
drifted from, or under-implemented, the methodology it claims to bake in. Pointed at a pack, it
reads that pack's **methodology provenance manifest** (a graph-native record of *what method we
claim and which nodes encode each principle*) and convenes the relevant **method custodians** —
each able to cite only from a closed catalog of that thinker's real principles — to flag three
things: **fidelity** (is each claimed principle faithfully encoded?), **gaps** (what of the method
is missing or omitted?), and **grounding** (would the encoding survive a real startup?).

> **What it is, precisely.**
> - **Dev-time tooling** in `tooling/`, sibling to `sg-graph-maintainer` and `sg-handbook-curator`.
>   **Never vendored** into the shipped plugin. Not a `graph/` node.
> - **Object of critique = the graph's construction and its baked-in methodology** — *not*
>   stack-graph as a product, and *not* any product decision. (Operator steer: *"about the graph
>   and how it is built… how we keep ourselves grounded in methodology."*)
> - **Non-authoritative.** Findings are *suggestions a human reads and filters*. Nothing is
>   auto-applied; the operator routes anything worth acting on into the maintainer/curator.
> - **Hallucinations are avoided, not feared.** Because output is advisory and human-filtered, the
>   grounding mechanism is *lightweight* (closed principle catalogs + confidence flags), not a heavy
>   retrieval/validation engine. An advisor that can't ground a concern labels it an
>   *ungrounded hunch* rather than fabricating a citation.

## Spec touchpoints

| Spec doc | Section | Relationship |
|---|---|---|
| `07-decomposition` | Decomposing a function (packs) | **amend** — a pack carries a **methodology provenance manifest**: claimed method, sources, principles included **and intentionally omitted**, and a principle→node **encoding map**. Provenance is *authored as part of building the pack* (extends D38's "traceability is authored, not inferred"). |
| `05-maintenance-skill` | Authoring a pack | **amend (follow-on)** — `sg-graph-maintainer` produces/maintains a pack's provenance manifest when authoring pack nodes. |
| `08-devops` | The two loops / Steady state | **amend** — add the **methodology-grounding gate**: a dev-time board convened during pack design/review. Advisory, `tooling/` branch+label, never vendored. |
| `CLAUDE.md` (project root) | "Building the graph — dev tooling" | **amend** — list `sg-advisory-council` + install symlink. |
| `06-analytics` | Outcome measurement | **defer** — fidelity-over-time as a signal; noted, not built. |
| `docs/decisions.md` | new **D48** | **add** — charter, manifest-in-graph, non-authoritative, product-domain scope. Text at end. |

## Why this exists

stack-graph bakes methodology into the graph: the PM pack runs on SVPG (Cagan) + Strategyzer
(Osterwalder) + customer development (Blank); future packs each ride an established method. Baked-in
methodology **drifts or gets quietly half-implemented** as nodes accrete, and nothing catches it.
The board is the forcing function — the methodology analogue of what the repo already has for two
other axes:

| Board | Object of critique | Surface | Authority |
|---|---|---|---|
| `review` + lenses | Is the **code** correct/secure/tested? | shipped graph node | gating |
| `sg-handbook-curator` | Is the **handbook** consistent? | dev-time tooling | gating (PR) |
| **`sg-advisory-council`** | Is the **methodology** we baked in faithful & complete? | **dev-time tooling** | **advisory only** |

## The provenance manifest — the thing being audited (graph-native)

The manifest is **not a council artifact**; it is **authored when a pack is built** and lives in the
graph (`graph/_refs/<pack>-methodology-provenance.md`). It makes "grounding" a *checkable, authored*
property. One per pack:

| Field | Contents |
|---|---|
| `claimed_methods` | the named methodologies the pack rides (e.g. SVPG, Strategyzer, Customer Development) |
| `sources` | canonical works |
| `principles_included` | for each: principle (id), method, **`encoded_by`** = the node(s)/reference(s) that implement it, `present`\|`planned` |
| `principles_omitted` | method principles the pack **intentionally** does not encode, each with a one-line reason (this is what makes the gap-audit honest) |
| `method_interfaces` | the **seams** — where two methods nest/meet (e.g. "SVPG is the spine; Strategyzer is how strategy/value discovery is done inside it"), who owns what, intended overlaps |

The council audits the graph **against this manifest**. No manifest → nothing to audit → the council
tells you to author one (that *is* the first grounding finding).

## Grounding — lightweight, human-backstopped

Each seat is anchored to a **closed-set principle catalog** (`references/catalogs/<seat>.md`):
`principle_id`, source, one-line summary, `applies-when`, `does-not-apply`. **A finding may cite
only a catalog id.** No free-text chapter numbers, no cross-seat misattribution. A concern with no
backing principle is allowed but must be labelled `status: ungrounded-hunch` at low/medium
confidence — never dressed as methodology.

That is the whole anti-hallucination story: a closed catalog + a confidence/`status` flag + the
operator reading the output. No retrieval pipeline, no deterministic validator (the failure mode
those defend against — a fabricated finding getting auto-applied — can't happen here, because
nothing is auto-applied).

## The board — product-domain seats (now)

Three method custodians, scoped to **product** (the operator's "do product"):

| Seat | Custodian | Method | Audits the pack for… |
|---|---|---|---|
| `cagan` | Marty Cagan | SVPG — discovery vs delivery, the four risks, outcome>output, empowered teams, dual-track | is product-discovery method faithfully encoded; what SVPG the pack omits |
| `osterwalder` | Alexander Osterwalder | Strategyzer — BMC, VPC, Testing Business Ideas, evidence strength | is the business-model/value engine faithfully encoded; weak/absent assumption-testing |
| `blank` | Steve Blank | Customer Development — discovery/validation, get-out-of-the-building, market type | does the pack actually validate demand, or assume it; missing learning loops |

**Deferred (not built now):** Balfour/growth (no growth pack exists to audit yet); Graham + Tan
(reframed per the review from methodology auditors to *optional reality-check* voices — convened
later only for "is-this-real / is-this-simple / founder-workflow" targets, not pack-method audits).

## Selective dispatch + mandatory seam pass

The orchestrator convenes **only** the seats whose triggers match the target (a pack/manifest →
its method custodians). It then **always** runs a **seam pass**: a cross-method conformance check
over the manifest's `method_interfaces`, and it may raise a **seam finding no single seat owns**
(e.g. SVPG⊃Strategyzer nesting, Blank-vs-Osterwalder evidence standards). For a multi-method pack,
≥1 integration review over each method boundary is forced. Rubric lives in
`references/council-dispatch.md` (sibling of the proven `lens-dispatch`).

## Structure (tooling layout)

```
tooling/sg-advisory-council/
  SKILL.md                       # dispatcher: convene + roster; selective dispatch; seam pass; non-authoritative synthesis
  agents/
    cagan.md  osterwalder.md  blank.md      # autonomous advisor sub-agents (stateless, like the review lenses)
  references/
    council-dispatch.md          # convene-when + seam pass + synthesis rules
    grounding-schema.md          # the finding schema (fidelity|gap|grounding|seam; principle_id; confidence; status)
    catalogs/
      cagan.md  osterwalder.md  blank.md    # closed-set, source-attributed principle catalogs (the grounding spine)

graph/_refs/
  pm-methodology-provenance.md   # the PM pack's manifest (graph-native; authored from the PM design)
```

### Modes (v1)
- `convene` *(default)* — target + optional roster → select seats → seam pass → dispatch → synthesise an **advisory grounding report**. Auto-selects custodians for a named pack.
- `roster` — print the board, each seat's method, triggers, sources. No dispatch.

Deferred: `sweep` (whole-graph scan), auto-routing into maintainer/curator, fidelity analytics, growth + reality-check seats.

## Object of critique & output

**Input (encoding-fidelity only):** the pack's provenance manifest + the named graph nodes/refs it
maps to + (optionally) the pack design doc. **Never** live product artifacts, a roadmap, or a
business-model's *content* — that would be re-judging the product, which is the existing nodes' job
(see below).

**Output:** an **advisory grounding report** to chat (no audit files): per seat, cited findings by
dimension; a synthesis clustered **faithful / drifting / missing / seam**, prioritised; topped with
a banner that it is *suggestions to consider, not verdicts*. The operator routes anything worth
acting on into `sg-graph-maintainer` / `sg-handbook-curator`.

## Relationship to existing nodes (no duplication)

`product-lens`, `strategy-curator`, `four-risks` **apply** Cagan/Osterwalder method *inside a
product workflow* (judging the product). The council **audits the encoding** of those methods:
*source principle → graph artifact → present / drifting / missing / overclaimed*. The distinction is
made mechanical by the input contract — the council reads the **manifest + nodes**, never the
product's live strategy content, so it cannot collapse into re-doing `product-lens`'s job.

## Placement — why `tooling/`, not a graph node

Codex flagged that the shipped `review` node uses the same fan-out pattern yet is a graph node.
The repo already draws the line elsewhere: `sg-graph-maintainer` and `sg-handbook-curator` both own
control flow and are **`tooling/` skills, not graph nodes**. The discriminator is **product
operating-environment (graph node) vs. factory build-tool (`tooling/`)**, not "owns control flow."
The council is a sibling of the maintainer and curator, so `tooling/` is the consistent choice. (A
graph node carrying `dev-time`/`not-vendored` distribution metadata was considered and rejected for
now — it would fork the distribution model ahead of need.)

## How it rides the dev loop (`08-devops`)
- Branch/label `tooling/advisory-council`, label `tooling`, title `tooling:`. Bootstrap: direct
  commit to `main`.
- Convened during **pack design/review** and on demand. A *grounding gate* in the spec-first sprint's
  REVIEW phase — advisory, beside the eng/design reviews. Factory-general (about building
  stack-graph); a consumer would not vendor it.

## Build-now vs defer

**Now:** the manifest concept + the PM pack's manifest (`graph/_refs/pm-methodology-provenance.md`);
`SKILL.md` (`convene` + `roster`, selective dispatch, seam pass, non-authoritative synthesis); three
advisor agents (`cagan`/`osterwalder`/`blank`); three source-attributed principle catalogs;
`council-dispatch.md` + `grounding-schema.md`; install symlink + `CLAUDE.md` entry; **D48**; the
`07-decomposition` manifest amendment.

**Defer:** `sg-graph-maintainer` auto-authoring manifests for every pack; `sweep`; auto-routing;
fidelity analytics; growth seat (Balfour) and reality-check seats (Graham/Tan); promotion to a
consumer-facing capability.

## Behaviour contract

**MUST** — convene only matching seats + always run the seam pass; cite only catalog `principle_id`s
(or label `ungrounded-hunch`); audit **encoding fidelity** against the manifest, never product
decisions; be report-only and non-authoritative; calibrate confidence.

**MUST NOT** — fabricate citations or chapter refs; judge a product/roadmap/business-model's content;
auto-apply or open PRs; be vendored or installed by a consuming workspace.

## Open questions
1. **Growth seat** (when a growth pack exists): Balfour vs Chen vs Ellis.
2. **Name**: `sg-advisory-council` (kept) vs `sg-methodology-board`.
3. Whether the `07-decomposition` + `05` amendments land as direct commits (bootstrap) or curator PRs.

## Proposed decision (for `docs/decisions.md`)

> **D48 — A dev-time advisory council grounds the graph in methodology; provenance is authored into
> the graph.** Methodology baked into a pack is recorded in a graph-native **provenance manifest**
> (claimed method, sources, principles included **and intentionally omitted**, principle→node
> encoding map) authored when the pack is built (extends D38). A **non-authoritative** dev-time board
> (`tooling/sg-advisory-council/`, sibling to the maintainer + curator, never vendored) reads that
> manifest and convenes **method-custodian** sub-agents — each citing only a **closed principle
> catalog** — to surface **fidelity / gap / grounding / seam** findings for *the operator to filter*.
> Built now for the **product** domain (seats: Cagan, Osterwalder, Blank); growth and reality-check
> seats deferred. Critiques **the graph's construction**, never the product; **report-only**
> (operator routes findings into the maintainer/curator). *Why:* baked-in methodology drifts as the
> graph grows and nothing catches it; this is the methodology analogue of `review` (code) and the
> curator (handbook). Because output is advisory and human-filtered, grounding is lightweight
> (catalog + confidence flag), not a validation engine. *Design:* `docs/advisory-council-design.md`.
> *Queues:* `07-decomposition` (manifest) + `05-maintenance-skill` (maintainer authors it) +
> `08-devops` (grounding gate) + `CLAUDE.md`. *Status:* Accepted (design); build in progress.
