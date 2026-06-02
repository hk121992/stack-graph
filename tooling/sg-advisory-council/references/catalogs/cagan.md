# catalog — `cagan` (Marty Cagan / SVPG)

The **closed set** of methodology principles this seat may cite. A finding from the `cagan`
advisor MUST carry a `principle_id` drawn from this file (or be labelled
`status: ungrounded-hunch` per `references/grounding-schema.md`). Nothing here is a gate — the
catalog exists so that every concern is traceable to a real, attributable SVPG idea rather than
generic product lore.

- **Seat:** `cagan`
- **Custodian of:** product discovery, the four risks, outcome-over-output, empowered teams,
  product vision/strategy/objectives, the product operating model.
- **Person:** Marty Cagan, founder/partner, Silicon Valley Product Group (SVPG).

## Canonical sources

Locators are deliberately coarse — a work and at most a named article/chapter-topic we are
confident in. We do **not** assert chapter numbers. Where an idea is most cleanly stated in a
public SVPG article, that article is cited as the locator.

- **INSPIRED** — *Inspired: How to Create Tech Products Customers Love*, 2nd ed. (Cagan, 2017).
- **EMPOWERED** — *Empowered: Ordinary People, Extraordinary Products* (Cagan & Jones, 2020).
- **TRANSFORMED** — *Transformed: Moving to the Product Operating Model* (Cagan et al., 2024).
- **SVPG articles** — `svpg.com`, notably *The Four Big Risks*, *Product Risk Taxonomy*,
  *Dual-Track Agile*, *Continuous Discovery*, *Vision vs. Strategy*, *The Alternative to Roadmaps*,
  *The Product Operating Model*, *Empowered Product Teams*.

> **Attribution discipline.** "Dual-track" was coined by Jeff Patton and adopted by Cagan, who now
> prefers *continuous discovery / continuous delivery*; the catalog uses the parallel-track idea
> under that framing and does not credit Cagan with the original term. "Continuous discovery habits"
> / "the product trio" as a named practice is Teresa Torres' formulation (foreword by Cagan) and is
> **not** in this closed set — where the SVPG idea overlaps, the catalog cites Cagan's own
> *empowered product team* (PM + design + eng) instead.

---

## Principles

### `cagan.four-risks`
- **name:** The four big product risks
- **source:** INSPIRED; SVPG *The Four Big Risks* / *Product Risk Taxonomy*
- **summary:** Most product failure traces to four knowable risks — **value** (will they buy/use
  it?), **usability** (can they figure out how to use it?), **feasibility** (can we build it with
  the time/skills/tech we have?), and **business viability** (does it work for the rest of the
  business — finance, legal, sales, marketing, brand?).
- **applies-when:** the pack claims to encode a discovery or risk lens; auditing whether all four
  risks are represented and distinct in the relevant node(s)/reference(s).
- **does-not-apply:** judging whether a *specific* feature is risky — that is a product decision,
  out of lane. Only audit whether the four-risk taxonomy is encoded faithfully.

### `cagan.value-viability-pm-owned`
- **name:** Risk ownership across the team
- **source:** INSPIRED; SVPG *The Four Big Risks*
- **summary:** The risks have owners — the product manager owns **value and viability**, the
  designer owns **usability**, the tech lead owns **feasibility**; the discovery lens is a team
  responsibility, not the PM's alone.
- **applies-when:** the manifest maps the four-risks lens onto nodes/roles; checking that the
  encoding does not collapse all four risks onto a single PM node or drop the cross-role ownership.
- **does-not-apply:** prescribing org/team headcount, or auditing packs that deliberately model a
  single-operator context where role split is explicitly out of scope (note it as a `seam`, not a
  fidelity defect, if the manifest says so).

### `cagan.discovery-before-delivery`
- **name:** Discovery de-risks before delivery builds
- **source:** INSPIRED; SVPG *Continuous Discovery*, *Discovery - Delivery*
- **summary:** Discovery exists to address the four risks *before* committing to build; most orgs
  over-invest in delivery and under-invest in discovery, shipping well-built things nobody wants.
- **applies-when:** auditing whether the pack encodes a discovery step that gates or precedes
  commitment to delivery, rather than treating "decide" and "build" as one move.
- **does-not-apply:** mandating a heavyweight discovery phase for every item — Cagan allows risk to
  be assessed and small/low-risk work to move fast; do not flag a deliberately fast-tracked path as
  a fidelity defect on its own.

### `cagan.continuous-dual-track`
- **name:** Continuous discovery alongside continuous delivery
- **source:** INSPIRED; SVPG *Dual-Track Agile* / *Continuous Discovery* (parallel-track framing;
  "dual-track" originally Jeff Patton)
- **summary:** Discovery and delivery run **in parallel and continuously**, not as sequential
  phases — the team is always discovering what to build next while delivering what was already
  validated.
- **applies-when:** the pack claims a discovery loop *and* a delivery arc; checking the encoding
  lets them run concurrently rather than as a one-time gate hand-off.
- **does-not-apply:** demanding literal simultaneity in the graph topology, or auditing a pack that
  explicitly models only one track for scope reasons.

### `cagan.discovery-prototype-not-product`
- **name:** Test ideas with prototypes, cheaply, before building
- **source:** INSPIRED (product discovery techniques)
- **summary:** Discovery validates ideas with **prototypes and fast/cheap experiments** — an order
  of magnitude less effort than production — so most ideas are killed or reshaped before any
  delivery cost is paid.
- **applies-when:** the pack encodes discovery activities; checking they admit cheap-experiment /
  prototype evidence rather than treating "build the real thing" as the only way to learn.
- **does-not-apply:** dictating *which* prototype or experiment technique to use; choosing a
  technique is a product/method call. (Strategyzer's experiment-design specifics belong to the
  `osterwalder` seat.)

### `cagan.outcome-over-output`
- **name:** Outcomes over output
- **source:** EMPOWERED; TRANSFORMED; SVPG *The Product Operating Model*
- **summary:** Teams are measured by **business/customer outcomes** (problems solved, metrics
  moved), not by **output** (features shipped, roadmap items completed).
- **applies-when:** auditing the outcome layer / debrief encoding — whether success is defined and
  measured as outcome vs OKR, not as "shipped vs not shipped".
- **does-not-apply:** judging whether a *particular* metric or OKR is the right one to chase — that
  is a product-strategy decision, out of lane.

### `cagan.empowered-teams`
- **name:** Empowered teams — problems to solve, not features to build
- **source:** EMPOWERED; SVPG *Empowered Product Teams*
- **summary:** Empowered teams are handed **problems to solve and outcomes to own**, then find the
  solution themselves — the opposite of a feature-team executing a handed-down list.
- **applies-when:** auditing how the pack frames work into the delivery arc — as an opportunity /
  problem-to-solve serving an objective, vs a pre-decided feature spec pushed through build.
- **does-not-apply:** prescribing autonomy/management practice for a human org; the audit is about
  how *work is framed in the encoding*, not how a real team is managed. Single-operator packs that
  fuse the roles are a `seam` note, not a defect.

### `cagan.missionaries-not-mercenaries`
- **name:** Missionaries, not mercenaries
- **source:** EMPOWERED (attributed by Cagan to John Doerr); SVPG *Empowered Product Teams*
- **summary:** Teams that understand the vision, the customer's pain, and the "why" behave as
  **missionaries** (invested, creative, accountable); teams handed only commands behave as
  **mercenaries**. The encoding should carry the *why/context*, not just the *what*.
- **applies-when:** checking whether nodes that frame or hand off work also carry vision/strategy/
  objective context (the "why"), rather than a bare instruction stripped of intent.
- **does-not-apply:** assessing team morale or culture (no such target exists here); do not stretch
  this into a motivation critique of the operator.

### `cagan.product-vision`
- **name:** Product vision
- **source:** INSPIRED; TRANSFORMED; SVPG *Vision vs. Strategy*
- **summary:** A compelling, customer-centric **product vision** describes the future being created
  (typically ~2–5 years out) and is the shared north the strategy serves; it is distinct from
  strategy.
- **applies-when:** auditing whether the pack encodes a stated product vision as the apex the
  strategy/outcome layer hangs from (the PM design itself flags this as thin in the prior art).
- **does-not-apply:** evaluating the *content* or ambition of a given vision statement — out of
  lane; only whether the vision element is present and correctly distinguished from strategy.

### `cagan.product-strategy-insights`
- **name:** Insight-driven product strategy
- **source:** TRANSFORMED; SVPG *Vision vs. Strategy*, *The Product Operating Model*
- **summary:** Product strategy is the plan to achieve the vision while meeting business
  objectives; it is **focused** (a few bets that matter most) and **powered by insights** drawn
  from data, customers, enabling technology, and industry — not a wishlist.
- **applies-when:** auditing the strategy node/surface — whether it encodes focus + an
  insights-driven basis tied to objectives, vs an unfocused feature catalogue.
- **does-not-apply:** judging whether the *chosen* strategy or insights are correct; that is a
  product decision. Strategyzer's BMC/VPC mechanics for *deriving* value/viability evidence belong
  to the `osterwalder` seat.

### `cagan.objectives-okrs`
- **name:** Objectives over feature roadmaps
- **source:** EMPOWERED; TRANSFORMED; SVPG *The Alternative to Roadmaps*
- **summary:** Direction is set as **objectives/outcomes** (commonly OKRs) the team must move — the
  alternative to a feature-/date-based roadmap; the roadmap, if any, lists problems to solve in
  service of objectives, not a locked feature list.
- **applies-when:** auditing the objectives ↔ roadmap seam — whether items are framed as
  opportunities serving an objective, and whether the outcome layer drives prioritisation.
- **does-not-apply:** banning roadmaps wholesale or auditing roadmap *content* / sequencing; the
  audit is about how the roadmap is *framed and tied to objectives* in the encoding.

### `cagan.principles-over-process`
- **name:** Principles over process (the product operating model)
- **source:** TRANSFORMED; SVPG *The Product Operating Model*
- **summary:** The product model is a set of **first principles** (outcomes over output, innovation
  over predictability, product over project, principles over process) — adopting process mechanics
  without the underlying principles is cargo-culting the model.
- **applies-when:** a **grounding** check — would the encoding survive a real startup, or has it
  copied SVPG ritual (gates, ceremonies, artefact names) while dropping the principle the ritual
  serves?
- **does-not-apply:** demanding the pack literally name these principles; a pack can honour them
  without quoting them. Flag only where ritual is present but the principle it should embody is
  absent.

### `cagan.product-over-project`
- **name:** Product over project
- **source:** TRANSFORMED; SVPG *The Product Operating Model*
- **summary:** Work is organised around **durable products and the outcomes they drive**, not
  temporary projects scoped to a date and disbanded — funding, teams, and measurement follow the
  product, not a one-off delivery.
- **applies-when:** auditing whether the carrier/lifecycle encoding treats an item as an enduring
  opportunity measured past ship (debrief → live → outcomes), rather than a project that "completes"
  at land.
- **does-not-apply:** prescribing budgeting/staffing models for a real org; only audit whether the
  encoded lifecycle carries the item *through outcome measurement* rather than ending at delivery.
