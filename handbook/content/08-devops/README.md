---
title: DevOps — how stack-graph develops itself
type: procedure
read-when: Working on stack-graph itself — branching, PRs, or the improvement loops.
related: [overview, overview/maintenance, analytics, maintenance-skill]
---

# DevOps — how stack-graph develops itself

stack-graph is built through the same PR-gated loop it gives its consumers. This page fixes
the branch and label model, the two improvement loops, and the bootstrap exception.

## Branch & label model

Changes land on a `<kind>/<slug>` branch and carry the matching label:

| Branch | Label | Covers | Title convention |
|---|---|---|---|
| `handbook/<slug>` | `handbook` | handbook pages (specs, concepts, procedures) | `spec(<section>):` or `docs(handbook):` |
| `tooling/<slug>` | `tooling` | `sg-*` skills, agents, scripts | `tooling:` |
| `graph/<node-id>` | `graph` | graph node files | `graph(<node-id>):` |
| `factory-loop/<slug>` | `factory-loop` | a general improvement raised from a consumer | `feat(factory):` |

The slug names the change, not what triggered it. The PR description **is** the proposal —
no separate proposal file ([`overview/maintenance`](../00-overview/02-maintenance.md)).

## The two improvement loops

The loop ([`analytics`](../06-analytics/README.md)) runs in two scopes; the discriminator is
whether an improvement is **general** or **product-specific**:

- **Factory loop.** A consuming workspace discovers a *general* improvement and raises it as
  a PR **to** stack-graph (`factory-loop` label, against `hk121992/stack-graph`). The
  workspace packages the change — a node, a spec amendment, a tooling fix — and opens the
  cross-repo PR. The factory receives only curated PRs, never raw telemetry: analytics is
  local to each workspace by construction ([`analytics`](../06-analytics/README.md)).
- **Harness loop.** A *product-specific* improvement lands **within** the consuming
  workspace and never reaches this repo.

General → factory-loop PR here; specific → harness, local. When unsure, default to the
harness loop and propose promotion only if a second consumer would want the same change.

## Steady state

Handbook changes land via labelled PRs raised by `/sg-handbook-curator raise`; graph and
tooling changes follow the same branch/label model. Direct push to `main` is not the path
for handbook content. A periodic **integrate** cadence that merges open PRs in batches is a
later addition — the curator's `integrate` mode is not yet shipped.

## CI gates

A PR runs the gates relevant to what it touches:

| Touches | Gate |
|---|---|
| Graph node files | the maintainer's `validate` (schema, `primitive`↔`mode`, edge resolution, goals) |
| The build | idempotency + load verification ([`plugin-spec`](../03-plugin-spec/README.md)) |
| Handbook pages | `index.json` freshness (refresh-index yields no diff) + cross-reference resolution |

CI lives in the private dev-wrapper ([`plugin-spec`](../03-plugin-spec/README.md)), added
once there is build code to test.

## Bootstrap exception

During bootstrap, spec and tooling changes land by **direct commit to `main`** — the
overhead of a PR per change is not yet worth it while the model is still settling. The
curator is exercised on handbook content first.

**Exit condition (met by this page):** once the branch/label model above is fixed and the
curator has been exercised, handbook changes move to labelled PRs. Tooling and graph changes
follow as the dev-wrapper and CI come online.
