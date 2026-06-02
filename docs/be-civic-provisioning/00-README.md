# be-civic provisioning scripts

Runnable adaptation of `../provisioning-runbook.md` (Phase B / Phase 1) with the
operator's decisions applied. **Review each script, then run as root/sudo** (the
`claude` sudo user). These are deliverables to be executed by you — not run
automatically.

## Decisions applied (vs the runbook)

| Area | Runbook | Here |
|---|---|---|
| GitHub auth (B1) | option (a) or (b) | **(a) dedicated SSH key on Henry's personal account** `hk121992` (no bot/org account). Key is independently revocable. `Be-Civic/be-civic-plugin` is public; the 4 personal repos are Henry's — the key reaches all 5. |
| Secrets (B2) | hand-authored `secrets.env` | **No hand-authoring.** Tier-A operational set **vendored** from the broker (interim: gstack-side) and **root-installed** into be-civic's `~/.config/bw/shell.env`. |
| Secret set | — | `GITHUB_TOKEN`, `CLOUDFLARE_API_TOKEN` (dev), `CLOUDFLARE_ACCOUNT_ID`. LLM = **subscription login** (mirror gstack), not a vendored key. |
| Deploy token | — | `bc-cf-wrangler-token` stays **Tier B**; deploys run via **CI** (GH Actions sm-action), so it is *not* vendored to the box. |
| Broker reach (B6) | block via iptables | **NOT blocked** (operator decision 2026-06-02) — broker reach allowed; the real boundary is issuer-token isolation (be-civic can't read `~gstack`) + broker policy/Slack, not the network path. |

## Run order (each as root)

1. `b1-create-user.sh`  → then **add the printed SSH pubkey to Henry's GitHub account**
2. `b2-toolchain-secrets.sh`  → then **`sudo -iu be-civic claude` and `/login` once**
3. `b3-vendor-plugin-clone.sh`  (PREREQ: `bun run vendor` has been run in gstack's stack-graph)
4. `b4-gbrain.sh`  (briefly stops gstack's gbrain daemons — run when gstack is idle)
5. `b5-wire-claude.sh`  (has manual review steps — author be-civic's `~/.claude` config)
6. `b6-gate-checks.sh`  → **all checks must pass / report OK** before Phase C/D

## Interim note (broker relocation is a separate track)

The broker currently lives in **gstack**, so B2 vendors gstack-side then installs as
root. When the broker moves to the dedicated **admin sudo user** (separate track, not
in these scripts), that user owns the vendor + rotation step instead. be-civic's posture
does not change — it never reaches the broker either way.

## What is NOT here (deferred)

Phase 2/D repos, cutover, the admin-user + broker relocation, and the unix-socket broker
rework. See the runbook's "Phase split" and the project memory note.
