# grounding-schema — advisory council finding contract

The closed contract for what each advisor sub-agent emits and how the orchestrator synthesises.
**All output is advisory** — suggestions a human filters, never auto-applied.

## Finding (one per concern)

- `seat`: `cagan` | `osterwalder` | `blank`
- `dimension`:
  - `fidelity` — a claimed principle IS encoded, but drifts / is partial / over-claims
  - `gap` — a catalog principle is absent from the manifest, or mapped but with no real encoding
  - `grounding` — the encoding wouldn't survive a real startup (academic / improvised / cargo-culted)
  - `seam` — a cross-method boundary issue (raised in the seam pass; may have no single owner)
- `principle_id` — an id from `references/catalogs/<seat>.md`. **Required** unless `dimension: seam`
  or `status: ungrounded-hunch`.
- `target_ref` — the graph node / reference / manifest entry / design section under audit
- `claim` — one or two sentences: what is faithful / drifting / missing / overclaimed
- `severity` — `high` | `medium` | `low`  (advisory salience only — never a gate)
- `confidence` — `high` | `medium` | `low`  (`low` ⇒ explicitly flag for human scrutiny)
- `recommendation` — what to change, or `"investigate"`
- `status` — `grounded` | `ungrounded-hunch`
  - `ungrounded-hunch`: no catalog principle backs it. ALLOWED, but must be labelled and capped at
    `medium` confidence. **Never present a hunch as methodology.**

## Synthesis (orchestrator → operator) — advisory

Always lead with the banner:

> **Advisory only** — suggestions to consider, not verdicts. Nothing here is applied automatically;
> you decide what (if anything) to route into `sg-graph-maintainer` / `sg-handbook-curator`.

Then:
- `faithful[]` — where the graph embodies the method well (brief; this is what earns trust)
- `drifting[]` — `fidelity` findings
- `missing[]` — `gap` findings (include manifest `principles_omitted` entries that look like *real*
  gaps rather than deliberate scope calls)
- `seams[]` — `seam` findings
- `prioritised[]` — the few worth acting on first, each citing its finding(s)

Dedup and corroborate across seats; cluster; **never auto-route**.
