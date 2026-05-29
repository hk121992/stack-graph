---
title: Plugin specification
type: spec
read-when: Packaging stack-graph as a plugin or building the handbook→plugin pipeline.
related: [graph-spec, harness-spec, overview]
status: v0.0.0 — 2026-05-29
---

# Plugin specification

**Status: scaffold — spec to be authored.**

## Will cover

- **Packaging** — `.claude-plugin/{plugin.json, marketplace.json}`, `skills/`, `agents/`,
  `hooks/`, `lib/` — mirroring the Be Civic plugin shape.
- **Public + dev-wrapper** — a ship-clean public plugin + a private dev-wrapper (git
  submodule) holding tests/CI (added when there's code to test).
- **The build/vendor pipeline (NEW)** — node files → valid `.claude` primitives baked
  into the plugin. Required because Claude Code loads skills from disk (they can't be
  fetched). Be Civic has no such pipeline; this is net-new infra, mirroring the
  bc-renderer-core "shared substrate, multiple consumers" pattern.
- **Install / vendoring** into a consuming workspace.

## Open questions this section owns

- **Q3 — the dual-consumer node schema** (plugin-builder side): how graph frontmatter
  maps to Claude-compatible `SKILL.md` frontmatter.
- **Q5 — the build/vendor pipeline:** node files → SKILL.md / agents / hooks; what's
  stripped, what's mapped, and how output is verified (Claude actually loads it).
