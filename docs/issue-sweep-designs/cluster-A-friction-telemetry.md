# Cluster A — friction & stall telemetry (#28)

**Issue:** [#28](https://github.com/hk121992/stack-graph/issues/28) — hook-captured session/node
friction events, not model-emitted prose. **IUs:** A1 (session-end friction hook), A2
(schema-validated event append + gate events), A3 (analytics "Process cost" block), A4 (preamble +
spec amendment). Internally ordered A1→A2→A3→A4; **stacks on #21's hook tree**.
**Decisions:** resolved decision #3 — factory scope = **capture (hooks) + project (analytics block)**;
**no new judgment node** (no `measure-process`); the ops-review *process* stays product-local.

## Spec touchpoints

| Spec doc | Section | Relationship |
|---|---|---|
| `06-analytics/README.md` | event sources / event shape / rendered surface | **Amend** — add the process/friction layer (third event source); add `friction-record`, `gate-open`, `gate-closed` to the shape table; add the "Process cost" axis to the rendered surface; restate the deterministic-not-model-emitted invariant. |
| `graph/_refs/instrumentation-preamble.md` | event kinds + version | **Amend** — document `friction-record`, `gate-open`, `gate-closed`; bump `0.4.0 → 0.5.0`; reconcile against live kinds. |

## Why hooks, not model prose (the invariant)

The #28 evidence: 15% of be-civic's model-emitted events were a foreign schema with fabricated
timestamps; the 14h overnight gate stall produced exactly 1 gate event. Model-discretionary emission
is skipped under load, schema-drifts, and gets backfilled with invented data. **Capture must be
hook-deterministic; append must be schema-validated.** No friction datum originates from model
judgment — same discipline as #21's token hooks (fail-loud, scope-gated, `<4KB` atomic O_APPEND).

## IU-A1 — session-end friction hook

Add a friction-capture hook alongside `hooks/` (the #21 tree). Mechanism:

- **Hook event.** A `SessionEnd` entry in `hooks/hooks.json` (if the runtime exposes it; else a
  second `Stop` handler branch) → `hooks/sg-friction-hook.sh <event>`. Confirm the available event
  name against the live Claude Code hook set at build (claude-code-guide / settings.json docs) — the
  design assumes `SessionEnd`; fall back to `Stop` if unavailable.
- **Scope gate.** Same two-var gate as #21 (`SG_EVENT_LOG` set) plus a friction activation flag.
  **Decision:** reuse the existing `SG_TOKEN_EVENT_KIND` activation rather than add a new env var —
  the instrumentation is one switch; a harness that opts into token capture opts into friction
  capture. (If the review prefers independent switches, `SG_FRICTION_EVENT_KIND` is the alternative;
  default = reuse, to keep `harness-init` step 5b unchanged.)
- **Row shape — one `friction-record` per session**, hook-captured from the session transcript the
  hook is handed (never model prose):
  ```json
  { "ts": "ISO-UTC", "session": "...", "kind": "friction-record",
    "permission_denials": N, "denied_rules": ["<rule>:<count>", ...],
    "classifier_denials": N, "classifier_reasons": ["<category>:<count>", ...],
    "tool_errors": N, "rejected_calls": N,
    "wakeups_armed": N, "wakeups_fired": N,
    "v": "0.5.0" }
  ```
  Fields are counts + small bounded arrays derived deterministically from the transcript; `<4KB`.
- **Discipline.** Fail-loud (emit one `instrumentation-error` row if `node`/parse fails, exit 0),
  scope-gated, single O_APPEND `<4KB`. Hands off to `hooks/lib/emit-friction.mjs` (parallel to
  `emit-usage.mjs`) which does the transcript scan + the validated append.

**Acceptance:** a session with denials/rejections/wakeups produces a deterministic friction row; none
originates from model judgment.

## IU-A2 — schema-validated event append + gate-wait first-class

The node enter/exit + gate events are today appended by **raw model tool calls** (the preamble says
"use whatever append method is available") — which is exactly how the foreign-schema/fabricated-ts
rows got in. A2 closes that:

- **A tiny append CLI/script** — `hooks/lib/emit-event.mjs` (stdin = one JSON object; or a thin
  `hooks/sg-emit.sh` wrapper the skills call). It **validates on append**:
  - `kind` ∈ the known set (`enter`, `exit`, `gate-open`, `gate-closed`, `note`, … — the live kinds);
  - `ts` matches strict `ISO_UTC_RE` (same regex the publisher uses); reject malformed + future;
  - reject **unknown shape** (foreign keys like `carrier_id`/`stage` → rejected, counted);
  - single O_APPEND `<4KB`, fail-loud.
  Model-authored freeform rows are rejected at the gate, not silently stored.
- **First-class gate events.** New `gate-open` / `gate-closed` kinds carrying the **blocking
  condition**, so overnight human-gate stalls are derivable from a query (the 14h stall was invisible
  with the single advisory `gate` event):
  ```json
  { "ts": "...", "session": "...", "kind": "gate-open",
    "node": "...", "gate": "<name>", "condition": "<what blocks>",
    "carrier": "...|null", "arc": "...|null", "v": "0.5.0" }
  { "ts": "...", "session": "...", "kind": "gate-closed",
    "node": "...", "gate": "<name>", "outcome": "passed|abandoned",
    "carrier": "...|null", "arc": "...|null", "v": "0.5.0" }
  ```
  Stall duration = `gate-closed.ts − gate-open.ts` for the matched `(session,node,gate)`.
- **Document the failure mode closed:** foreign-schema + fabricated-timestamp rows (the 36 be-civic
  rows) are rejected at append; the preamble + 06-analytics state this is why append is validated.

**Note on the existing `gate` kind:** the publisher currently *skips* `gate`/`traverse`. A2 introduces
the paired `gate-open`/`gate-closed` as the queryable form; the old single `gate` kind stays
recognised-but-not-projected (back-compat), and A3 projects the paired form.

**Acceptance:** an append with unknown shape or malformed `ts` is rejected; a gate wait emits paired
`gate-open`/`gate-closed` with the condition; stall duration is derivable from the log.

## IU-A3 — workspace analytics "Process cost" block

Deterministic projection only — **no judgment node**.

- **`workspace/renderer/publish-projection.ts`:** add `FRICTION_KINDS =
  {"friction-record","gate-open","gate-closed"}` (parallel to `USAGE_KINDS`) and a closed
  **`FRICTION_KEYS`** allowlist (parallel to `USAGE_COMPONENT_KEYS`) for the friction-record numeric
  fields. New read path in `deriveProjection`: accumulate friction-records (denial/error/rejected/
  wakeup counts) and pair `gate-open`/`gate-closed` into stall spans (flag unpaired/dangling). Emit a
  new `process_costs` field on `PortalProjection` (parallel to `session_costs`). Apply the same
  `ts`/version/`ID_RE` sanitization the usage path uses; anonymize `session`.
- **`workspace/renderer/build-analytics.ts`:** add `processCostSection(view)` (sibling to
  `costSection`), rendering: denial counts (by rule/category), total stall time, dangling/unpaired
  spans, rejected-call count, with a degraded state ("No process data — hooks not installed / no loop
  run yet"). Call it in `bodyHtml` after `costSection(view)`.
- **Lockstep:** `FRICTION_KEYS` is defined in **both** files under the existing "Keep in lockstep"
  comment convention (as `AX_NUMERIC_KEYS` already is). The publisher↔build-analytics allowlists must
  not drift.

**Acceptance:** the analytics surface renders a process-cost view from real events; ops-review reads
it; nothing is model-emitted.

## IU-A4 — preamble + spec amendment

- `graph/_refs/instrumentation-preamble.md`: document `friction-record`, `gate-open`, `gate-closed`
  (shapes above); bump `0.4.0 → 0.5.0`; reconcile the documented kinds against the live emitters
  (hooks + the emit-event CLI) so every live kind is in the preamble.
- `06-analytics/README.md`: add the **process/friction layer** as a third event source; add the three
  kinds to the shape table; add "Process cost" to the rendered-surface axes; restate the
  **deterministic-not-model-emitted** invariant and the validated-append failure-mode it closes.

**Acceptance:** every live event kind is documented; preamble version bumped; `06-analytics` describes
the process layer.

## Risks / edge cases

- **`SessionEnd` availability.** If the runtime lacks `SessionEnd`, A1 falls back to a `Stop`-event
  branch (the session-end-ish hook #21 already wires). Confirmed at build via claude-code-guide.
- **Env-switch decision (reuse `SG_TOKEN_EVENT_KIND`)** keeps `harness-init` step 5b untouched —
  flagged for the review; alternative is an independent `SG_FRICTION_EVENT_KIND`.
- **Transcript-derivation in the hook.** The friction-record fields (denials, rejections, wakeups)
  must be extractable from what the `SessionEnd`/`Stop` hook receives (transcript path / session
  payload). If a field isn't derivable hook-side, it's omitted (count 0) rather than model-filled —
  honest under-capture beats fabricated completeness. Confirmed against the hook payload at build.
- **Old `gate` kind vs new paired kinds.** Back-compat: old single `gate` stays recognised; new
  `gate-open`/`gate-closed` are the projected form. No migration of existing logs (ephemeral,
  gitignored).
