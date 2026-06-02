# council-dispatch — selective convening, seam pass, synthesis

The convening rubric for the methodology board. Sibling of `graph/_refs/lens-dispatch.md`. The board
is **advisory** and **convened selectively** — never the whole roster by default.

## Roster (now)

| Seat | Method | Custodian of |
|---|---|---|
| `cagan` | SVPG | product discovery, the four risks, outcome>output, empowered teams |
| `osterwalder` | Strategyzer | business model, value proposition, assumption/evidence testing |
| `blank` | Customer Development | demand validation, get-out-of-the-building, market type |

Deferred: `balfour` (growth — no growth pack exists to audit yet); `graham`, `tan` (optional
*reality-check* voices for "is-this-real / is-this-simple / founder-workflow" targets — **not**
methodology auditors).

## Selection

1. Identify the target's pack(s) and read the pack's provenance manifest at
   `graph/_refs/<pack>-methodology-provenance.md`. **If no manifest exists, STOP** and report:
   *"no methodology provenance manifest for `<pack>` — author one first."* That refusal IS the first
   grounding finding.
2. Convene the **domain board** for the target — two kinds of seat, not just the claimed methods:
   - **Claimed-method custodians** (methods in the manifest's `claimed_methods`) run a
     **fidelity + gap** audit: is each claimed principle faithfully encoded; what of the claimed
     method is missing. PM pack → `cagan` (SVPG) + `osterwalder` (Strategyzer).
   - **Domain-relevant *unclaimed* custodians** (a recognised method of this domain the pack does
     **not** claim) run a **coverage-gap** audit: "this method is absent — deliberate scope call or
     blind spot?" PM pack → `blank` (Customer Development is `not claimed`; the manifest's
     `principles_omitted` records it — Blank checks whether the pack *validates* demand or *assumes*
     it). A coverage-gap finding must respect the manifest: an explicitly-omitted method with a
     stated reason is a low-salience note, not a defect.

   Prefer the **smallest sufficient set**. Caller may override (`--advisors a,b`) or, rarely, force
   all (`--full-board`).
3. **Floor:** at least one seat. If none matches, refuse and ask the caller to name a seat.

## Mandatory seam pass (always, after selection)

Run a cross-method conformance check over the manifest's `method_interfaces`:
- For every method boundary (e.g. SVPG ⊃ Strategyzer; Blank's evidence standard vs Osterwalder's;
  discovery vs delivery), confirm the manifest names who owns what and that the encoding honours the
  nesting.
- The orchestrator MAY raise a `dimension: seam` finding **even when no single seat owns it** — this
  is the guard against selective dispatch missing the seams where drift actually hides.
- A multi-method pack ⇒ at least one integration review per boundary.

## Dispatch

Spawn each selected advisor in its own isolated context, **in parallel** (one Agent call each), with
the bundle: `{ manifest, the named node/reference files, optional design-doc section, the question,
the dimensions }`. Each returns findings per `references/grounding-schema.md`.

## Synthesis (inline, advisory)

Merge + dedup + corroborate across seats; cluster `faithful / drifting / missing / seams`; prioritise;
attach the advisory banner from `grounding-schema.md`; **route nothing automatically.** Hand the
report to the operator, who decides what to act on.
