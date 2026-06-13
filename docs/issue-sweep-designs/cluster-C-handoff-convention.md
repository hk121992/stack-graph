# Cluster C — handoff convention (#29)

**Issue:** [#29](https://github.com/hk121992/stack-graph/issues/29) — vendor a chip/handoff-prompt
convention as a reference node. **IU:** C1 (`handoff-prompt-convention` reference + scaffold pointer).
**Decisions:** resolved in the sprint plan.

## Spec touchpoints

| Spec doc | Section | Relationship |
|---|---|---|
| `04-harness-spec/README.md` | "Instantiating a harness" / scaffold | **Amend** — `harness-init scaffold` writes a one-line pointer to the convention into the harness root CLAUDE.md (single always-on cost). |
| `graph/_refs/handoff-prompt-convention.md` | — | **New reference node** (`kind: reference`). |
| `graph/harness-init/harness-init.md` | scaffold step 4 (org-root CLAUDE.md) | **Amend** — emit the pointer line during scaffold. |

## Design

New `graph/_refs/handoff-prompt-convention.md`, `kind: reference` (matches the `iron-law.md` /
`bindings-contract.md` shape: `kind, id, title, description, status` — no `edges`, no `primitive`).

**Content — the delta-only field form:**

```
GOAL: <imperative, one line>
WHERE: <repo>@<branch> — paths, file:line
DO: <steps / constraints, bullets>
DONE-WHEN: <acceptance + verify command>
POL: <on-disk policy refs by path only>
EPH(<date>): <expiring facts: PR#s, untracked files, concurrent-session state>
```

**Rules** (verbatim from the issue, the proven be-civic convention):
- delta only, ≤150 words; paths over prose;
- **policy by pointer never by copy** (copies stale; hooks enforce anyway; the cold session auto-loads
  the repo CLAUDE.md);
- `POL:` refs must resolve **cold** — on-disk only, never project memory (a chip-spawned worktree may
  not key the same memory dir; if a fact's only home is memory, that's a routing gap to fix first);
- `EPH(<date>)` so expiring facts are visibly dated at execution time.

**Cross-reference (light):** note that the same convention covers loop-runner dispatch prompts and
return envelopes (already field-shaped) — this reference is the single home for cold-handoff doctrine.
A worked example (a ~417-word chip → ~60 words, the dropped 350 being push-policy the pre-push hook
teaches at violation) anchors it.

**Scaffold pointer.** `harness-init scaffold` (the org-root CLAUDE.md write step) emits **one line**
pointing at the vendored reference (e.g. `@.claude/plugins/.../references/handoff-prompt-convention.md`
or the resolved vendored path) — keeping the always-on cost to a single pointer, not the body.

**Vendoring.** A `kind: reference` file is copied into a consumer bundle only when a node declares a
`references` edge to it. To get it vendored, **`harness-init` (and `harness-update`) declare a
`references` edge** to `handoff-prompt-convention` (`load: on-demand` — it's reference doctrine the
scaffold points at, not always-imported into the skill body). The vendor pipeline then places it at
`skills/harness-init/references/handoff-prompt-convention.md`.

**Acceptance:** the reference exists + vendors (via the harness-init `references` edge);
`harness-init scaffold` emits the pointer line; a real chip compresses to the field form with policy
by pointer.

## Risks / edge cases

- **Edge choice for vendoring.** `harness-init` gains `references → handoff-prompt-convention
  (on-demand)`. This is the cheapest way to get the reference into the vendored bundle and is
  semantically honest (scaffold points at it on-demand). Adds one ref edge to the record (Z1).
- **Pointer path stability.** The scaffold pointer resolves to the vendored reference path inside the
  installed plugin; harness-init already writes plugin-relative pointers in scaffold, so this follows
  the established pattern (exact resolution confirmed at build against harness-init's current scaffold
  step).
- **Shares "policy by pointer" with held #24** — the `POL:` pointer-not-copy idea is the same
  durable-home principle #24's branch-policy doc will reference; no dependency, just consistency.
