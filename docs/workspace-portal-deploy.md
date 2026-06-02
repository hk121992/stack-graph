---
title: Workspace portal — deploy & access (operator runbook)
status: working draft — 2026-06-02
---

# Workspace portal — deploy & access

How the assembled portal (`workspace/dist/`) is deployed and **gated fail-closed**.
Operator-run (admin lives in the tooling user); see `docs/workspace-portal-design.md`
for the design and `build.sh` for the assembly.

## 1. Build

```bash
bash workspace/build.sh          # factory fixture ledger
DASHBOARD_ROOT=/path/to/be-civic/ledger bash workspace/build.sh   # a product harness (Phase C)
```

Output: `workspace/dist/` (portal hub + handbook / graph / dashboard / analytics +
`portal-projection.json`). Requires `bun` and the `dot` (Graphviz) binary.

## 2. Access — FAIL-CLOSED, before anything is reachable (design §1)

The portal exposes the operator's whole strategic surface, so it is **private by
default**. The deployed portal is **static assets with no worker code** (Workers Static
Assets). Access control is **solely Cloudflare Access (Zero Trust)** at the edge —
there is **no application-layer second gate**. Provision CF Access **before** the Worker
route is live:

1. **Cloudflare Access (Zero Trust)** — create a *self-hosted application* covering the
   Worker's route/hostname. Policy: **allow = the single operator identity only** (email
   allowlist or the operator's IdP); default **deny**. No anonymous access, no public
   bypass.
2. **Verify the gate before going live** — because there is no app-layer fallback, a CF
   Access misconfiguration is the only failure mode. **Release gate:** after provisioning,
   confirm with `curl -I https://<your-worker-route>/` and verify the response is a CF
   Access challenge (302 to the Access login or 403), **not** 200. Do not treat the portal
   as live until this passes.
3. **The projection snapshot** (`/portal-projection.json`) is a **sanitized static asset
   behind the same CF Access gate** — not a private server-side store. It is safe to serve
   this way because the publisher emits only sanitized aggregates (ids, stages, timestamps,
   numeric metrics — no raw events or secrets).
4. No write/command surface is exposed (the portal is read-only; the operator acts in
   Claude).

This is a hard release gate, not a nice-to-have. Future hardening option (not built):
add a real Worker that validates the `Cf-Access-Jwt-Assertion` JWT on every request.

## 3. Deploy

Cloudflare Worker with **Workers Static Assets** (`workspace/wrangler.jsonc`, no worker
code). Two options:

- **CF Workers Builds (git-connected)** — connect the repo in the Cloudflare dashboard;
  build command `bash workspace/build.sh`, output dir `workspace/dist`. Deploys on push
  to `main`. No repo secret needed. **Important: this path always produces an
  authored-only / input-gated portal.** CI has no `.stack-graph/` (gitignored), so the
  publisher emits an empty snapshot → the deployed portal shows the authored layer +
  the "projection input-gated — no dev-sprint events recorded yet" notice. This is
  expected and correct for a factory or a pre-exercise deployment.
- **`wrangler deploy` (local, required for live projection)** — to surface live
  projection data on the deployed portal, run the publisher locally (where `.stack-graph/`
  exists), then `wrangler deploy` from `workspace/`. Use a scoped `CLOUDFLARE_API_TOKEN`
  pulled from the Bitwarden secrets broker at runtime (never a dotfile).

The CI workflow (`.github/workflows/portal.yml`) builds + checks on PR/push (path-filtered)
with **full git history** (`fetch-depth: 0`) so the graph's *last-updated* badges resolve.

## 4. The projection snapshot (freshness model, design §"data model")

The live projection (`current_stage`, `last_used`, AX) lives only in the **local,
gitignored `.stack-graph/`**. A **local operator job** publishes a sanitized snapshot
before `wrangler deploy`:

```bash
bun run workspace/renderer/publish-projection.ts --out workspace/dist/portal-projection.json
```

The output is a **static file in `workspace/dist/`**, served behind CF Access at
`/portal-projection.json`. **Raw events never leave the workspace** — only derived/aggregate
values (ids, stages, timestamps, numeric metrics).

**Three freshness states — not a binary:**

- **(a) Input-gated / empty** — `carriers: {}` and `nodes: {}` (no events yet, or a
  git-connected CI build where `.stack-graph/` is absent). The portal shows an explicit
  **"projection input-gated — no dev-sprint events recorded yet"** notice. Not a silent
  green. This is the expected state for any factory or pre-exercise deployment.
- **(b) Stale / SHA-mismatch** — snapshot is non-empty but `provenance.commit` ≠ the
  build's commit SHA. The portal shows a stale-snapshot banner.
- **(c) Fresh + populated** — SHA matches the current commit AND the snapshot is non-empty.
  The portal renders live projection data.

**Recency note:** SHA-match alone is not sufficient — a snapshot whose `generated_at`
predates the commit it claims is also suspect. The portal surfaces the snapshot's
`generated_at` age alongside the SHA match. The publisher already suffixes `-dirty` on
dirty trees, degrading those to state b.

Every surface renders its authored layer in full regardless of snapshot state.

## 5. Two-tier merge governance (design §2)

**Auto-merge MUST remain disabled** until the classifier + CI invariants ship as required
CI status checks. Until then, all merges are PR-reviewed. The two-tier policy below is
the target state:

- **Auto-merge (target — not active until guards ship)** — the operational ledger only,
  after the classifier + CI invariants pass (path/field allowlist, schema-valid,
  `gate_decisions` append-only, the gate-token rule, manifest stale-check). `stage_override`
  is **not** in the auto-merge allowlist — it routes to PR approval.
- **PR-approval** for canon / sprint-plan / objectives / strategy / graph,
  `stage_override`, + anything the classifier rejects.

(Classifier + invariant enforcement as CI status checks is a follow-on; the policy is
fixed here. Until those checks exist as required gates, do not enable auto-merge.)

**Markdown sanitization — Phase-C release gate** (see design §6): markdown is currently
rendered with raw-HTML passthrough. Safe for operator-authored factory content; requires
sanitization before any harness renders untrusted product ledger content.
