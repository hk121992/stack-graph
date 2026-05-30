---
title: Recall substrate (gbrain)
type: spec
read-when: Specifying or implementing the gbrain recall integration — config, reads/writes, compatibility.
related: [analytics, concepts]
---

# Recall substrate (gbrain)

The **recall** half of the two-layer decisions store ([concepts](../01-concepts/), D11): the
curated *conclusion* lives in `docs/decisions.md`; the surrounding *reasoning and transcript*
live in **gbrain** — a semantic recall layer (markdown is canonical, a Postgres/PGLite index is
derived, retrieval is hybrid). Curation and recall are different jobs; both are kept.

## Optional & capability-gated

gbrain is an **enhancement, not a correctness dependency**. The curated store stands alone. A
node checks for gbrain and degrades cleanly: `explore`'s `learnings` mode queries gbrain **if
configured**, otherwise falls back to reading `docs/decisions.md` + Grep. Never instruct an
agent to use gbrain when it is absent (the gstack `sync-gbrain` pattern: strip the guidance, do
not reference a missing tool). Forcing a gbrain install on every consumer would contradict
"general and open-source-able".

## Scope — a per-workspace source (locality)

Each workspace registers **one gbrain *source*** (the standard `.gbrain-source` convention),
**not** a separate brain — reusing the host's existing brain and avoiding a second single-writer
database. **Locality is by construction** (D17): a node queries only its own workspace's source;
the factory never sees a consumer's recall. Cross-workspace learning flows only as curated
factory-loop PRs ([devops](../08-devops/)), never as shared recall.

## Reads & writes

| Op | Where | Rule |
|---|---|---|
| **read** | `explore` (learnings mode) | `mcp__gbrain__query --source <workspace>` — via **MCP, not the CLI** (the CLI races the PGLite single-writer lock) |
| **write** | `log-decision` / `reconcile` / `debrief` | **two-layer**: conclusion → `docs/decisions.md` (always); reasoning/transcript → `gbrain put` (if present) |

**Never ingest node files or the graph record** into gbrain — those are canonical `.claude`
files, searched with Grep/Read. Ingesting them would duplicate the system of record and blur the
curated/recall line.

## Compatibility with upstream gbrain

stack-graph is a **consumer** of gbrain, not a fork. **Do not vendor or modify it** — depend on
the upstream source so its updates can be relied on. Configure through gbrain's own resolution
chain (per-call flag → env → source key → brain key → project config → user config). Pin the
integration to the **installed CLI/MCP surface actually present** (e.g. `query`/`ask`/`put`/`sync`
on 0.27.0), not a newer README's verbs, and degrade gracefully when a verb is absent.
Embedding model + dimensions are fixed at `init` — treat per-workspace embedding config as
set-at-setup.
