# catalog — osterwalder (Strategyzer)

The **closed** principle set for the `osterwalder` seat. Findings emitted by
`agents/osterwalder.md` may cite **only** the `principle_id`s defined here. A concern with no
backing id is an `ungrounded-hunch` (see `references/grounding-schema.md`), never dressed as
methodology.

- **Seat:** `osterwalder`
- **Custodian of:** business model, value proposition, assumption/evidence testing
- **Person:** Alexander Osterwalder (with Yves Pigneur, Greg Bernarda, Alan Smith, David Bland,
  Trish Papadakos) — Strategyzer.
- **Sources:**
  - *Business Model Generation* (Osterwalder & Pigneur, 2010) — the Business Model Canvas.
  - *Value Proposition Design* (Osterwalder, Pigneur, Bernarda, Smith, 2014) — the Value
    Proposition Canvas and the three fits.
  - *Testing Business Ideas* (Bland & Osterwalder, 2019) — assumptions mapping, the test/learning
    cards, the experiment library, the evidence-strength ladder.
  - *The Invincible Company* (Osterwalder, Pigneur, Smith, Etiemble, 2020) — the portfolio map and
    the explore/exploit continuum.

> **Scope guard.** This seat audits the **business-model / value / test-and-learn engine** of the PM
> pack. SVPG operating-model structure (vision→strategy→objectives, empowered teams, outcome over
> output) is `cagan`'s lane; customer-development demand validation / market type / "get out of the
> building" is `blank`'s. Where the four-risks frame is shared, this seat owns only the
> **desirability/viability** mapping onto the canvas-and-test engine — not the SVPG framing of the
> four risks themselves. Locators below cite the **work**, not invented chapter numbers.

---

## Principles

### `osterwalder.business-model-canvas`
- **name:** Business Model Canvas — nine building blocks
- **source:** *Business Model Generation* (the Business Model Canvas)
- **summary:** A business model is described on one shared canvas of nine blocks — customer segments,
  value propositions, channels, customer relationships, revenue streams, key resources, key
  activities, key partnerships, cost structure.
- **applies-when:** the pack claims to model the business model / viability, or names BMC blocks
  (segments, revenue, cost, channels, partners, resources, activities, relationships).
- **does-not-apply:** value-proposition-only or pure product-discovery surfaces that make no
  whole-business-model claim; the canvas is not required where viability is explicitly out of scope.

### `osterwalder.value-proposition-canvas`
- **name:** Value Proposition Canvas — two sides that must fit
- **source:** *Value Proposition Design* (the Value Proposition Canvas)
- **summary:** The VPC zooms into one segment with two sides — the **customer profile** and the
  **value map** — and the work is to make the value map *fit* the profile, not to describe them
  independently.
- **applies-when:** the pack claims a value proposition, a VPC, or a jobs/pains/gains + value-map
  structure for a segment.
- **does-not-apply:** whole-portfolio or org-level strategy artefacts that aren't scoped to a single
  segment's value proposition.

### `osterwalder.customer-profile-jobs-pains-gains`
- **name:** Customer profile — jobs, pains, gains
- **source:** *Value Proposition Design* (customer profile side of the VPC)
- **summary:** The customer side is modelled as **jobs** (functional, social, emotional tasks the
  customer is trying to get done), **pains** (undesired outcomes, obstacles, risks), and **gains**
  (required, expected, desired, unexpected benefits) — observed from the customer, ranked by
  importance/severity.
- **applies-when:** the pack encodes customer needs, jobs-to-be-done, pains, or gains.
- **does-not-apply:** the value-map / solution side (covered by `value-map-fit`); internal-team or
  build-cost concerns.

### `osterwalder.value-map-fit`
- **name:** Value map — products, pain relievers, gain creators (and the fit)
- **source:** *Value Proposition Design* (value-map side of the VPC; "fit")
- **summary:** The solution side lists **products & services**, **pain relievers**, and **gain
  creators**, and each must be tied back to a ranked customer job/pain/gain — fit is the explicit
  link, not coverage of every box.
- **applies-when:** the pack encodes the offering, features, pain relievers, or gain creators, or
  claims a value-proposition "fit".
- **does-not-apply:** the customer-profile side alone; roadmap sequencing or delivery mechanics.

### `osterwalder.three-fits`
- **name:** The three fits — problem-solution, product-market, business-model
- **source:** *Value Proposition Design* (the three kinds of fit)
- **summary:** Fit is achieved in a progression, each demanding more evidence: **problem-solution
  fit** (jobs/pains/gains are real and the value prop addresses them, on paper), **product-market
  fit** (evidence the value prop actually creates value in the market), **business-model fit** (the
  value prop sits in a profitable, scalable model).
- **applies-when:** the pack claims fit, validation maturity, product-market fit, or distinguishes
  on-paper design from in-market evidence.
- **does-not-apply:** where the pack deliberately models only one fit stage and says so; do not
  demand business-model fit of an early problem-solution-fit artefact.

### `osterwalder.assumptions-mapping`
- **name:** Assumptions mapping — make hypotheses explicit, prioritise by importance × evidence
- **source:** *Testing Business Ideas* (assumptions mapping)
- **summary:** Before testing, surface everything that must be true for the idea to work as explicit
  **hypotheses**, then prioritise on two axes — **importance** (would failure sink the idea?) and
  **how much evidence exists** — and attack the important-and-unevidenced quadrant first.
- **applies-when:** the pack claims a discovery/test process, an assumptions or hypothesis register,
  or a way to decide what to test next.
- **does-not-apply:** pure description of canvases with no claim to drive testing or prioritisation
  (that absence is itself a `gap`, not a misuse of this id).

### `osterwalder.riskiest-assumption-cheap-bets`
- **name:** Test the riskiest assumption first with small, cheap bets
- **source:** *Testing Business Ideas* (sequencing experiments; "the bolder the innovation, the
  smaller the initial bets")
- **summary:** Start where uncertainty and importance are highest, with the fastest/cheapest
  experiment that can produce evidence; escalate to costlier experiments only as risk falls —
  reduce the cost of being wrong.
- **applies-when:** the pack sequences experiments, sizes evidence-gathering effort, or sets an
  evidence bar by stage/maturity.
- **does-not-apply:** delivery-stage execution effort sizing (an engineering concern, not a
  discovery-experiment concern).

### `osterwalder.evidence-over-opinion`
- **name:** Evidence trumps opinion
- **source:** *Testing Business Ideas* (and the Strategyzer innovation scorecard; "why evidence
  trumps opinion")
- **summary:** Direction and investment decisions should rest on observable customer **evidence**
  (qualitative or quantitative), not on seniority, conviction, or who argues loudest.
- **applies-when:** the pack defines how go/no-go or kill/continue decisions are made, what a gate
  weighs, or how conviction relates to evidence.
- **does-not-apply:** explicit founder-conviction-led postures *that the pack itself flags as
  evidence-thin* (e.g. a stated pre-launch default) — name the tension, don't treat the posture as a
  fidelity break on its own.

### `osterwalder.evidence-strength-ladder`
- **name:** Evidence strength ladder — weak / moderate / strong
- **source:** *Testing Business Ideas* (evidence strength; directional → moderate → strong)
- **summary:** Not all evidence is equal: opinions and hypothetical responses are **weak**, stated
  intentions/preferences are **moderate**, and actual observed behaviour (purchases, usage,
  retention) is **strong** — and the strength required should match the importance of the decision.
- **applies-when:** the pack grades evidence, distinguishes interviews from analytics from "what
  people say", or sets an evidence bar that should scale with stake.
- **does-not-apply:** packs with no evidence-grading claim at all (that's a `gap` against
  `assumptions-mapping`/`evidence-over-opinion`, not a misuse here).

### `osterwalder.test-and-learn-loop`
- **name:** Test-and-learn loop — hypothesis → experiment → evidence → insight → decide
- **source:** *Testing Business Ideas* (the Test Card and Learning Card)
- **summary:** A disciplined loop: state a falsifiable **hypothesis** (Test Card: believe → test →
  metric → criteria), run the experiment, record the **observation**, extract the **insight**, and
  make an explicit **decision/action** (Learning Card) — testing is incomplete without the
  decide step.
- **applies-when:** the pack claims an assumption→experiment→evidence→decide cycle, a hypothesis
  lifecycle, or a learning/decision record.
- **does-not-apply:** a static canvas snapshot with no claim to iterate; deciding *what to build*
  in delivery (that's the roadmap/gate machinery, not the discovery learning loop).

### `osterwalder.desirability-viability-feasibility`
- **name:** Desirability, viability, feasibility (and adaptability) as the risk types tested
- **source:** *Testing Business Ideas* (the hypothesis/risk types)
- **summary:** The hypotheses behind an idea fall into **desirability** (do they want it?),
  **viability** (can it be made profitable?), and **feasibility** (can it be built/delivered?) —
  with adaptability (can it survive a changing environment?) as the fourth — and a test programme
  should cover all of them, not just desirability.
- **applies-when:** the pack maps risks, names desirability/viability/feasibility, or claims to test
  across these categories.
- **does-not-apply:** the SVPG *framing/ownership* of the four risks and where each is de-risked in
  the operating model — that integration is `cagan`'s spine and the seam pass, not this seat.

### `osterwalder.multiple-value-propositions`
- **name:** A business model may need several value propositions, one per segment
- **source:** *Business Model Generation* / *Value Proposition Design* (segment ↔ value-proposition
  fit; multi-sided and intermediary models)
- **summary:** One business model can carry multiple value propositions for distinct segments
  (including multi-sided/platform/intermediary models), each needing its own profile↔value-map fit —
  a single "the value prop" can hide a mismatch across segments.
- **applies-when:** the pack serves multiple segments, claims a platform/multi-sided model, or links
  segments to value propositions.
- **does-not-apply:** genuinely single-segment products where one value proposition is the honest
  model.

### `osterwalder.explore-exploit-portfolio`
- **name:** Explore vs exploit — manage innovation as a portfolio
- **source:** *The Invincible Company* (the portfolio map; explore/exploit continuum)
- **summary:** Searching for new value propositions/models (**explore** — high uncertainty, many
  small bets, managed by evidence and metered funding) is a different discipline from running proven
  ones (**exploit** — lower uncertainty, plan-and-execute); a healthy product manages both and funds
  explore bets in stages as evidence accrues.
- **applies-when:** the pack distinguishes new-bet discovery from running/scaling a proven model,
  spans a maturity range, or claims metered/stage-gated funding of bets.
- **does-not-apply:** a single-stage early-venture pack that makes no exploit/portfolio claim — its
  absence is a deliberate scope call unless the pack claims to span maturity (then it's a `gap`).
