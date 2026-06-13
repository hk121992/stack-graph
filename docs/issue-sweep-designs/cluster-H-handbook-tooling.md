# Cluster H — handbook tooling (#26 + #27)

**Issues:** [#26](https://github.com/hk121992/stack-graph/issues/26) (index generator gap) ·
[#27](https://github.com/hk121992/stack-graph/issues/27) (link-validator `related[]` not actionable).
**IUs:** H1 (general index generator + normalize-on-write), H2 (link-validator actionable),
H3 (integrate raises standing breaks). Build order H1 → H2 → H3.
**Decisions:** all resolved in `docs/issue-sweep-sprint-plan.md` — not re-opened here.

## Spec touchpoints

| Spec doc | Section | Relationship |
|---|---|---|
| `05-maintenance-skill/README.md` | the index generator + the link-validator contract | **Amend** — state the generator is plugin-shipped + canon-root-parameterized; state `related[]` is canonicalized identically to file-path slugs before every check; state integrate escalates standing breaks into a `raise`. |
| `graph/_refs/bindings-contract.md` | `handbook-index` key | **Amend (clarify, no new key)** — `handbook-index` is the index *location*; the generator is plugin-shipped (Option 1), so no `handbook-index-generator` key is added. Record this explicitly so the gap #26 names is closed in the contract text. |
| `02-graph-spec` | node schema / `related[]` | **No change** — `related[]` semantics unchanged; only the canonicalization rule used by tooling is specified, and it lives in 05. |

No new bindings key (resolved decision #4). No spec change to the node model.

## Background — the latent bug, verified

The committed `handbook/content/index.json` is exactly:

```
asciiEncode(JSON.stringify(entries, null, 2)) + "\n"        // 4716 bytes, zero diff
```

i.e. the Python `json.dumps(indent=2, ensure_ascii=True)` shape #26 reverse-engineered, each
`related[]` element on its own line. **But the current TS `refresh-index.ts` uses a custom
*compact* serializer** (`related` collapsed to one line) — so running it today rewrites the canonical
index (190→14 lines). The factory generator and the factory index are already out of sync; the latent
gap #26 describes is live here, not just in be-civic. **H1's crux is replacing the drifted serializer
with the canonical pretty-print form**, after which regeneration is a no-op.

## IU-H1 — general index generator (#26 + #27-A normalize-on-write)

**What changes** in `tooling/sg-handbook-curator/scripts/refresh-index.ts`:

1. **Canon-root parameterization.** Accept the canon root as an explicit input — `--root <path>`
   positional/flag — keeping the existing `HANDBOOK_ROOT` env fallback and the walk-up discovery as
   last resort. The curator overlay (and `raise`/`integrate` post-batch refresh) invokes it with the
   bound canon root, so any harness runs the *same* validated generator. No new bindings key — the
   generator is plugin-shipped (resolved decision #4).

2. **Canonical serializer (the byte-for-byte fix).** Replace the custom compact serializer
   (`serializeEntry`/`serialize`) with standard pretty-print:
   ```
   JSON.stringify(entries, null, 2) + "\n"                    // default: literal UTF-8 (factory)
   asciiEncode(JSON.stringify(entries, null, 2)) + "\n"       // with --ascii flag (be-civic)
   ```
   **CORRECTION (review B1, verified empirically):** the committed *factory* `index.json` is
   **literal UTF-8** — 4716 bytes, **zero `\uXXXX` escapes** — reproduced byte-for-byte by
   `JSON.stringify(entries,null,2)+"\n"` with **no** ASCII-escaping. The current TS serializer is
   drifted on *two* axes (compact `related` **and** ASCII-escaped); the fix corrects both. be-civic's
   committed index *is* ASCII-escaped (`json.dumps(ensure_ascii=True)`), so a single hardcoded
   encoding cannot reproduce both canons. **Resolution: encoding is a flag** — `--ascii` (default
   off = literal). The factory acceptance runs with the default and passes byte-for-byte; the
   be-civic curator overlay passes `--ascii`. `asciiEncode` (when enabled) escapes every UTF-16 code
   unit `> 0x7f` to `\uXXXX` lowercase (iterate `charCodeAt` per code unit, matching Python
   `ensure_ascii`). Key insertion order stays `slug, title, type, read-when, related`
   (JSON.stringify preserves it). Trailing newline is load-bearing.

3. **Normalize `related[]` on write (couples #27-A).** Before emitting, canonicalize each `related[]`
   entry by the **same** rule the link-validator will use:
   - split on `/`; strip a leading `NN-` (`/^\d{2}-/`) on the **final** segment only;
   - `X/README` → `X`; bare `README` → root (`""`); `.md` suffix stripped if present.
   This makes the projected `related[]` canonical so authors can't reintroduce mixed forms. The
   factory index's `related[]` is already all-clean (0 of 14 non-canonical) → normalization is a
   no-op there, so byte-for-byte is preserved.

4. **Archive exclusion, generalized.** The current script hardcodes `name === "11-archive"`; the
   factory has no archive section and be-civic's is `12-archive`. Generalize to: exclude any
   top-level section whose post-`NN-`-strip slug is `archive` (NN-agnostic). Keep the depth>1 and
   non-`NN-` exclusions as-is.

**Vendoring.** The generator is a tooling script, not a `.claude` primitive — `build/vendor.ts`
aborts on `primitive: script`. Add a new byte-copy stage (modeled on the hooks stage, Stage 6):
`writeScripts()` / `checkScripts()` copying `tooling/sg-handbook-curator/scripts/refresh-index.ts`
→ `stack-graph-plugin/scripts/refresh-index.ts`, wired into `main()` and the `--check` drift list.
*(Implemented in Z1's vendor run; H1 lands the stage + the script change.)*

**Acceptance:** one validated generator regenerates `index.json` byte-for-byte against the current
canonical index from any canon root (`git diff` clean after run); projected `related[]` is canonical
(no mixed forms); a canon with a `12-archive` (or any-NN `archive`) section excludes it.

## IU-H2 — link-validator `related[]` actionable (#27-A + #27-C)

**What changes** in `tooling/sg-handbook-curator/agents/link-validator.md`:

- **(A) Normalization contract.** State that `related[]` entries are canonicalized **identically to
  file-path slugs** — `slug_rule` final-segment `NN-` strip + `X/README`→`X` + bare `README`→root +
  `.md` strip — **before** both `related_slug` membership and `related_asymmetric` pairing. This is
  the exact rule H1 applies on write, named once and referenced by both checks.
- **(C) Asymmetry triage.** Annotate each `related_asymmetric` finding with the target's
  **inbound-degree** (how many pages list it) and a **`net_new_in_batch`** flag (the asymmetry was
  introduced by a PR in this batch's queue vs pre-existing). The triage view defaults to
  **net-new + low-inbound (1:1 pairs)**, collapsing the tolerated hub/section-index baseline
  (high-inbound hubs, child→section). Keep advisory — **never auto-reciprocate** (altitude is a
  judgment call).

**Acceptance:** a canon with mixed `related[]` forms (clean / `NN-`prefixed / `X/README`) produces
zero false `related_slug` breaks; `related_asymmetric` findings carry inbound-degree + net-new flags;
the tolerated baseline is collapsed in the default view.

## IU-H3 — integrate raises standing breaks (#27-B)

**What changes** in `tooling/sg-handbook-curator/SKILL.md`, `integrate` mode:

- Detect standing `related_slug` / `unindexable` breaks in the merged preview **independent of
  `introduced_by` attribution**, and **escalate them directly into a `raise`** (resolved decision #2
  — *not* gated on `introduced_by`, *not* routed through a separate `sweep` run). The raise is gated
  (a labelled PR the operator reviews), never an auto-merge.
- **Net-new-in-batch breaks still block the batch** as today (step 5 hold on `introduced_by`).
  Standing breaks no longer live forever in the triage view — they become a raisable PR.
- **Ordering (review S2 — worktree/branch hazard).** The raise must fire **after** integrate's
  step-7 post-batch index commit to `main` *and* step-8 preview-worktree cleanup, off a **clean
  `main`** — because `raise` requires a clean tree + branches off `main`, and leftover `integrate/*`
  refs are a hard-abort preflight condition. So: collect the standing breaks during the preview
  (step 4 link-validator findings), complete the merge + index refresh + worktree teardown, **then**
  open the raise from clean `main` as the final integrate action. Never invoke raise mid-integrate
  while the preview worktree or `integrate/*` branches still exist.

**Acceptance:** a dangling `related[]` target on a page no PR touches results in a gated raise PR, not
a perpetual triage-view line (be-civic's 46 dangling targets each become raisable).

## Risks / edge cases

- **Trailing-newline / `ensure_ascii` parity with be-civic.** The factory index ends `\n]\n`;
  Python `json.dumps` adds no trailing newline. The general generator standardizes on
  `JSON.stringify(...,2)+"\n"` (matches the factory exactly). If be-civic's committed index lacks the
  trailing newline, the first generator run there is a one-time normalization (acceptable; the issue
  validated the *projection*, and a trailing newline is conventional).
- **`bun` availability in the consuming harness.** The vendored script is `bun run`-shebanged like
  the source; the curator overlay invokes it the same way. No new runtime dependency beyond what the
  workspace renderer already assumes.
- **H1↔H2 coupling.** The normalization rule must be defined once and applied identically on write
  (H1) and on check (H2); the design states it once above and both IUs reference it verbatim.
