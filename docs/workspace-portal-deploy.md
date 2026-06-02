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
default**. Provision this **before** the Worker route is live:

1. **Cloudflare Access (Zero Trust)** — create a *self-hosted application* covering the
   Worker's route/hostname. Policy: **allow = the single operator identity only** (email
   allowlist or the operator's IdP); default **deny**. No anonymous access, no public
   bypass.
2. **The Worker serves no anonymous traffic** — Access sits in front; a request without a
   valid Access JWT never reaches the assets.
3. **The projection snapshot store** (if a KV/R2 bucket is used instead of a build
   artifact) must **not** be publicly readable — the build/Worker reads it server-side.
4. No write/command surface is exposed (the portal is read-only; the operator acts in
   Claude).

This is a release gate, not a nice-to-have: the portal must be incapable of serving
anonymously.

## 3. Deploy

Cloudflare Worker with **Workers Static Assets** (`workspace/wrangler.jsonc`, no worker
code). Two options:

- **CF Workers Builds (recommended)** — connect the repo in the Cloudflare dashboard;
  build command `bash workspace/build.sh`, output dir `workspace/dist`. Deploys on push
  to `main`. No repo secret needed.
- **`wrangler deploy`** — from `workspace/`, with a scoped `CLOUDFLARE_API_TOKEN` pulled
  from the Bitwarden secrets broker at job runtime (never a dotfile).

The CI workflow (`.github/workflows/portal.yml`) builds + checks on PR/push (path-filtered)
with **full git history** (`fetch-depth: 0`) so the graph's *last-updated* badges resolve.

## 4. The projection snapshot (freshness model, design §"data model")

The deployed build is from git, but the live projection (`current_stage`, `last_used`,
AX) lives only in the **local, gitignored `.stack-graph/`**. So a **local operator job**
publishes a sanitized snapshot on rebuild:

```bash
bun run workspace/renderer/publish-projection.ts --out <deploy-store-path>
```

keyed by commit SHA, to the deploy store (CF KV/R2 or a build artifact joined at build).
**Raw events never leave the workspace** — only derived/aggregate values. In CI there is
no `.stack-graph/`, so the CI build is authored-only and the portal **degrades loudly**
(stale/unknown + a provenance banner) until the operator publishes a snapshot. Every
surface renders its authored layer in full regardless.

## 5. Two-tier merge governance (design §2)

- **Auto-merge** the operational ledger only behind the classifier + CI invariants
  (path/field allowlist, schema-valid, `gate_decisions` append-only, the gate-token rule,
  manifest stale-check).
- **PR-approval** for canon / sprint-plan / objectives / strategy / graph + anything the
  classifier rejects.

(Enforcement — the classifier + invariant checks as CI — is a follow-on; the policy is
fixed here.)
