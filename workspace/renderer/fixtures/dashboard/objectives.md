---
title: "Objectives & OKRs"
description: "Outcome layer — the yardstick the product-dashboard measures against."
status: "active — 2026-Q2"
---

# Objectives & OKRs

The product-dashboard is organised around **outcomes, not output**. Every work item's `outcome_link` points to an objective here. Progress measures how far toward the vision each objective has moved.

> **North-star:** A practitioner can install the stack-graph plugin into any Claude workspace, run the full dev-sprint loop against a real work item, and observe a correctly closed record entry — *without* reading the source code.

---

## O1 — Activate the factory loop end-to-end {#obj-activate-factory}

**Statement:** An operator can exercise the complete plan → build → reconcile → land → debrief cycle using the vendored plugin, with no manual scaffolding.

**Why this, now:** Pre-launch maturity. The bottleneck is factory activation, not optimisation. Nothing else delivers value until the loop runs.

| Key result | Target | Current |
|---|---|---|
| KR1.1 — Graph nodes authored and indexed | 100% of backbone wave 1 nodes authored, validated | **done** — 28 nodes |
| KR1.2 — Loop traverses end-to-end (smoke test) | All 5 backbone stages reachable | **done** — D50 |
| KR1.3 — Plugin vendor pipeline ships nodes | `skills/` populated from `graph/` | **not started** |
| KR1.4 — Harness build (be-civic overlay) | BC harness wired + exercises loop | **not started** |

**Maturity note (pre-launch):** Measured by operator assertion + smoke test. No user signal yet — that's the input gate for the progress analytics layer.

---

## O2 — Harness-ready: a consuming workspace can install and customise {#obj-harness-ready}

**Statement:** A second workspace (be-civic) can install the stack-graph plugin, apply an additive overlay with its own bindings + surfaces, and run the loop against real work items without modifying the factory.

**Why this, now:** Validates the factory/product split (the locked design decision). Without a real consuming harness, the factory is untestable at the seam.

| Key result | Target | Current |
|---|---|---|
| KR2.1 — Plugin build ships clean | `bun run build-plugin.ts` exits 0 with all nodes vendored | **not started** |
| KR2.2 — BC bindings + surfaces wired | All required bindings keys populated | **not started** |
| KR2.3 — OKR gap filled | `objectives.md` + `strategy.md` authored for be-civic surface | **not started** |
| KR2.4 — Experience thread designed | Persona-JTBD-scenario layer spec'd and nodes authored | **in discovery** |

**Maturity note (pre-launch):** Measured by successful harness install + loop run. No external users yet.

---

## What's input-gated (not deferred, waiting on data)

The **strategic product-analytics layer** — north-star trend charts, KPI dashboards from real usage — is *not deferred*. It lights up when real user signal exists. Pre-launch, the targets + our own read of them are the honest measure.
