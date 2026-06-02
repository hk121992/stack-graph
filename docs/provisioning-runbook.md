---
title: be-civic product user — provisioning runbook (Phase B)
status: working draft — 2026-06-02
audience: operator (run as the `claude` sudo user)
---

# Provisioning runbook — the clean `be-civic` product user

Stands up a **clean, separate OS user `be-civic`** that runs the stack-graph dev-sprint
loop against the migrated Be Civic product, via a **vendored, read-only** plugin — with a
**security boundary** that keeps the factory source, the Bitwarden broker, and admin out
of that user's reach. Develops in parallel with the live `gstack` env until cutover.

> **Placement note (operator):** this runbook is be-civic-specific. It lives in `docs/`
> alongside `be-civic-design.md` + `workspace-portal-deploy.md` for now; if you want
> `stack-graph` kept open-source-clean, move these three to a gitignored `docs/private/`
> or to `~/notes/`. Flag your preference.

## The security boundary (the spine — why this user exists)

| | `gstack` (tooling / admin) | `be-civic` (product) |
|---|---|---|
| Owns | stack-graph **source**, factory dev, **builds + vendors** | migrated product content + the **vendored plugin** |
| Secrets | the **Bitwarden broker** (issuer token = admin) | **static, product-scoped** secrets only — no issuer token, no `agent-run`; broker port closed by iptables (see B6) |
| Plugin | the source graph (`graph/`) + the build | a **read-only vendored copy** (built skills/agents/refs) — *not* source |
| Reach | full admin | **cannot** read `~gstack`, edit factory source, or reach admin |

**Invariants** (verify at B6): (1) `be-civic` cannot read `/home/gstack`; (2) the vendored
plugin under `~be-civic` is **not writable** by `be-civic` (re-vendoring is a privileged
action, and the plugins parent dir is root-owned so be-civic cannot remove it either);
(3) no issuer token, no `agent-run`; broker TCP port closed by iptables (the broker binds
host-wide loopback — be-civic can reach it unless explicitly blocked; see B6);
(4) the stack-graph **dev-tooling** (`tooling/sg-*`) is **not** installed in `be-civic` —
it runs the loop, it does not author the graph.

## Actors & conventions

- **`# [root]`** — run with sudo (you, as the `claude` sudo user: `sudo …`).
- **`# [be-civic]`** — run as the new user: `sudo -iu be-civic …` (or a login shell).
- **`# [gstack]`** — run as the current dev user (the vendor source side).
- Target: Ubuntu 24.04.4 LTS. Mirror these verified `gstack` versions: bun 1.3.13, node
  v22 (system apt), gbrain 0.27.0 (bun-global), claude 2.1.132, Ollama (system, shared)
  with `qwen3-embedding:0.6b` (1024-dim).

## Prerequisites (run as `gstack` first)

```bash
# [gstack] the plugin must be built (A2) and the portal must assemble.
cd ~/projects/stack-graph
bun run vendor            # refresh skills/ + agents/ + references/ + .claude-plugin/
bash workspace/build.sh   # confirm the portal assembles (needs `dot`, `wrangler`)
git -C ~/projects/be-civic/bc-workspace status   # confirm be-civic working tree is clean to migrate
```

---

## B1 — Create the user

```bash
# [root]
sudo adduser --gecos "" --disabled-password be-civic        # no password; key/sudo-su access only
sudo loginctl enable-linger be-civic                         # only needed if be-civic runs persistent user services; Ollama is shared loopback, independent of linger
# Lock the home so be-civic's tree is private and gstack's stays unreachable from it:
sudo chmod 750 /home/be-civic
# /home/gstack is already 0750 (others=---); be-civic is "other" so has no access.
# The real invariant is others=--- — the line below makes it explicit, but is typically a no-op:
sudo chmod 700 /home/gstack                                  # invariant: others=--- on gstack home; be-civic cannot traverse it
```

> **Decision (operator): how `be-civic` authenticates to GitHub.** Either (a) generate a
> dedicated SSH key for `be-civic` and add it to the GitHub account (recommended — scoped,
> revocable), or (b) clone as `gstack`/operator and `chown -R be-civic` the result. The
> repos use `git@github.com:` SSH remotes. (a) keeps the user self-sufficient; (b) avoids
> giving the product user any GitHub credential at all (more locked-down). Pick per how
> much autonomy you want the user's agents to have.

```bash
# [be-civic] — option (a): a dedicated key (then add ~/.ssh/id_ed25519.pub to GitHub)
sudo -iu be-civic ssh-keygen -t ed25519 -C "be-civic@$(hostname)" -N "" -f /home/be-civic/.ssh/id_ed25519
```

## B2 — Toolchain + static secrets

```bash
# [be-civic] bun (per-user), + gbrain as a bun-global (mirror gstack: 0.27.0)
sudo -iu be-civic bash -lc 'curl -fsSL https://bun.sh/install | bash'   # installs to ~/.bun
# PATH for bun goes in ~/.profile (NOT ~/.bashrc — Ubuntu's .bashrc has an early non-interactive
# guard that causes .bashrc appends to silently no-op for `bash -lc` / Claude / daemons):
sudo -iu be-civic bash -lc 'echo "export BUN_INSTALL=\$HOME/.bun; export PATH=\$BUN_INSTALL/bin:\$PATH" >> ~/.profile'
# Install gbrain with bun explicitly on PATH in the SAME invocation (do NOT rely on a prior .bashrc append):
sudo -iu be-civic bash -lc 'export PATH="$HOME/.bun/bin:$PATH" && bun install -g gbrain@0.27.0'   # pin to the gstack version

# NOTE: Claude Code does not read .bashrc or .profile at runtime. Secrets and env vars that
# agents need at runtime must go in the relevant systemd unit EnvironmentFile= or in
# ~/.claude settings env: — not only in shell rc files.

# claude CLI — gstack's claude is installed globally at /usr/bin/claude (on every user's
# default PATH). be-civic uses the shared system install directly — no per-user npm install,
# no system symlink needed (which would shadow gstack's binary globally).
# NOTE: confirm the global /usr/bin/claude is intended to be shared. If user-level isolation
# is required, install per-user to ~/.npm-global/bin via ~/.profile PATH — never a system symlink.
```

`node`, `git`, `gh`, `dot` (Graphviz), `wrangler`, and **Ollama** are **system** packages
(shared, already present) — confirm, don't reinstall:

```bash
# [be-civic] confirm shared tools resolve + the embedding model is reachable
sudo -iu be-civic bash -lc 'node -v && git --version && command -v dot wrangler && ollama list | grep qwen3-embedding'
```

**Static secrets (NO broker).** The broker stays in `gstack`. Provision only the
product-scoped secrets `be-civic` actually needs, as a root-owned, be-civic-readable env
file sourced at login — never a dotfile in git, never the issuer token.

```bash
# [root] create the secrets file (populate values manually, one-time, from BW by hand — not the broker)
sudo install -m 700 -o be-civic -g be-civic -d /home/be-civic/.config/be-civic
sudo install -m 600 -o be-civic -g be-civic /dev/null /home/be-civic/.config/be-civic/secrets.env
# Edit /home/be-civic/.config/be-civic/secrets.env to add ONLY what the product needs, e.g.:
#   CLOUDFLARE_API_TOKEN=...   (portal + be-civic deploys; scoped, read/deploy only)
#   GH_TOKEN=...               (if using HTTPS git instead of SSH)
#   <be-civic product API keys, scoped>
# [be-civic] source it at login — use ~/.profile (read by login shells; ~/.bashrc has an
# early non-interactive guard that silently skips these lines for `bash -lc` and Claude):
sudo -iu be-civic bash -lc 'echo "[ -f ~/.config/be-civic/secrets.env ] && set -a && . ~/.config/be-civic/secrets.env && set +a" >> ~/.profile'
# For secrets agents need at runtime (not just interactive shells), also add them via
# systemd unit EnvironmentFile= or ~/.claude settings env:.
```

> **Decision (operator): which static secrets.** List the exact product-scoped tokens
> `be-civic` needs (deploy + product APIs). Keep them minimal and scoped — no admin/issuer
> tokens. The scoped-broker solution (a separate machine account) is a **later, flagged
> phase**; static is deliberate for now.

## B3 — Vendor the plugin (read-only) + clone/migrate (Phase 1)

**Vendor the built plugin** — a privileged copy from `gstack`'s build output into
`be-civic`, owned `root`, **read-only for `be-civic`** (so the user's agents cannot edit
the vendored graph; re-vendoring is a root action). The user never reads `~gstack`.

```bash
# [root] copy the BUILT plugin surface (not the source graph/, not tooling/)
SRC=/home/gstack/projects/stack-graph
DST=/home/be-civic/.claude/plugins/stack-graph
# The plugins PARENT is root-owned so be-civic cannot remove/replace the vendored plugin dir:
sudo install -d -o root -g be-civic -m 755 /home/be-civic/.claude/plugins
# Sanity gate before rm -rf — refuse if DST is not under the expected path:
case "$DST" in /home/be-civic/.claude/plugins/*) : ;; *) echo "refusing: unexpected DST=$DST"; exit 1;; esac
sudo rm -rf -- "$DST" && sudo mkdir -p "$DST"
sudo cp -r "$SRC/.claude-plugin" "$SRC/skills" "$SRC/agents" "$SRC/references" "$DST/"
# read-only for be-civic: root owns, group can read/traverse, no write
sudo chown -R root:be-civic "$DST"
sudo find "$DST" -type d -exec chmod 755 {} \; && sudo find "$DST" -type f -exec chmod 644 {} \;
# (re-vendor on plugin updates = re-run this block; it's a root action by design)
# NOTE: if be-civic must add its OWN plugins, give it a separate writable plugin root and
# keep this vendored dir under the root-owned path above.
```

> The stack-graph **dev-tooling** (`tooling/sg-graph-maintainer` etc.) is intentionally
> **not** vendored — `be-civic` runs the loop, it does not author the graph.

**Clone the Phase-1 product repos** (the minimum to exercise the loop + render the
workspace). Sizes/remotes verified:

```bash
# [be-civic]
mkdir -p ~/projects/be-civic && cd ~/projects/be-civic
git clone git@github.com:hk121992/bc-workspace.git              # 260M — handbook + roadmap + portal + render machinery
git clone git@github.com:hk121992/be-civic-operations.git bc-operations   # 87M — product skills/agents (note: remote name differs)
git clone git@github.com:hk121992/bc-knowledge-graph.git        # 759M — the graph product (large; the long pole)
git clone git@github.com:Be-Civic/be-civic-plugin.git           # 23M
git clone git@github.com:hk121992/bc-renderer-core.git          # 544K — the renderer the portal/handbook reuse
```

(Phase 2 / Phase D adds the rest — see "Phase split" below.)

## B4 — gbrain (copy + reconfigure; no schema change)

The brain is binary-compatible (same gbrain 0.27.0 + `qwen3-embedding:0.6b`, 1024-dim,
shared Ollama). **Only paths change** — copy the store, rewrite `database_path`, re-point
the sources. Not a re-index.

```bash
# [gstack/root] QUIESCE gbrain writers before copying — never copy a running database;
# prefer gbrain export/import if available. Stop gstack's gbrain daemons first:
sudo -u gstack bash -lc 'systemctl --user stop gbrain-autopilot.service 2>/dev/null; pkill -u gstack -f "gbrain serve" 2>/dev/null; true'
# Preferred alternative: use `gbrain export` (as gstack) then `gbrain import` (as be-civic).
# If export/import is not available in your gbrain version, the cp -a below is the fallback:
# [root] copy gstack's brain into be-civic, then hand ownership over
sudo cp -a /home/gstack/.gbrain /home/be-civic/.gbrain     # cp -a preserves timestamps/perms; use ONLY after quiescing writers
sudo chown -R be-civic:be-civic /home/be-civic/.gbrain
sudo chmod 700 /home/be-civic/.gbrain
# [gstack/root] restart gstack's gbrain daemons:
sudo -u gstack bash -lc 'systemctl --user start gbrain-autopilot.service 2>/dev/null; true'
# [be-civic] rewrite ONLY the database_path using the gbrain-native config command:
sudo -iu be-civic bash -lc 'export PATH="$HOME/.bun/bin:$PATH" && gbrain config set database_path "$HOME/.gbrain/brain.pglite"'
# expected: database_path=/home/be-civic/.gbrain/brain.pglite ; embedding_model=ollama:qwen3-embedding:0.6b ; dimensions=1024
sudo -iu be-civic bash -lc 'export PATH="$HOME/.bun/bin:$PATH" && gbrain config show'
# [be-civic] register the MCP server + sanity-check (apply-migrations is a no-op on a copied store)
# `gbrain serve` is the stdio MCP subcommand (confirmed — `gbrain mcp` is not a valid subcommand):
sudo -iu be-civic bash -lc 'export PATH="$HOME/.bun/bin:$PATH" && claude mcp add gbrain -- gbrain serve'
# Confirm against gstack's actual MCP registration: `claude mcp list` as gstack, verify the server command matches.
sudo -iu be-civic bash -lc 'export PATH="$HOME/.bun/bin:$PATH" && gbrain doctor'
# Re-register sources and resync — sources live in the pglite DB, not just config.json.
# `--full` is not a flag; let failures surface loudly (no || true):
sudo -iu be-civic bash -lc 'export PATH="$HOME/.bun/bin:$PATH" && for r in bc-workspace bc-operations bc-knowledge-graph; do gbrain sync --repo "$HOME/projects/be-civic/$r"; done'
# Confirm sources resolve to be-civic paths (not gstack paths) after re-registration:
sudo -iu be-civic bash -lc 'export PATH="$HOME/.bun/bin:$PATH" && gbrain config show && gbrain stats'
```

> **Decision answered (from the plan):** the migration is **as-is, no schema change** —
> same engine/model/dimensions, copy `brain.pglite` verbatim; only config/paths and the
> source registrations change. If the embedding model or dimensions ever differ between
> users, that *would* force a re-index — not the case here.

## B5 — Wire `.claude` (loop + product skills; NOT the dev-tooling)

```bash
# [be-civic] be-civic's OWN product skills (from bc-operations) — symlinked so they load
mkdir -p ~/.claude/skills
for d in ~/projects/be-civic/bc-operations/*-skills/*/; do
  [ -d "$d" ] && ln -sfn "$d" ~/.claude/skills/"$(basename "$d")"
done
# org-root CLAUDE.md + settings + memory: copy/adapt the be-civic ones from bc-operations/bc-workspace
#   (thin, pointer-based; per the harness directory topology — one .claude at the org root).
# Do NOT symlink stack-graph/tooling/sg-* here — that dev-tooling stays in gstack.
```

> Per the harness topology (`04-harness-spec/01-directory-topology`): one `.claude` at the
> org root, always launch Claude there. The **vendored plugin** (B3) provides the dev-sprint
> loop globally; **bc-operations skills** are the product's own; **bindings.yaml** (Phase C)
> is a reference nodes read on-demand, not an auto-loaded slot.

## B6 — Env-completeness checks (THE GATE → pass before Phase C/D)

```bash
# [be-civic] run each; all must pass.
sudo -iu be-civic bash -lc '
  set -e
  export PATH="$HOME/.bun/bin:$PATH"
  echo "1. claude launches:";        claude --version
  echo "2. gbrain healthy:";         gbrain doctor && gbrain search "civic" --source bc-workspace --limit 3 >/dev/null && echo "   hybrid search OK"
  echo "3. product skills load:";    ls ~/.claude/skills | head
  echo "4. vendored plugin present + READ-ONLY:"; ls ~/.claude/plugins/stack-graph/skills | head; \
       ( touch ~/.claude/plugins/stack-graph/_wtest 2>/dev/null && echo "   FAIL: plugin is writable" && rm -f ~/.claude/plugins/stack-graph/_wtest ) || echo "   OK: plugin not writable"
  echo "5. portal build check:";     cd ~/projects/be-civic/bc-workspace && ( command -v dot && bash workspace/build.sh 2>/dev/null || echo "   (portal build deferred — wire bindings in Phase C first)" )
'
# SECURITY-BOUNDARY checks (must ALL report OK):

# gstack source unreachable:
sudo -iu be-civic bash -lc 'cat /home/gstack/.bashrc >/dev/null 2>&1 && echo "FAIL: be-civic can read ~gstack" || echo "OK: ~gstack unreadable"'
# gstack source dir not traversable:
sudo -iu be-civic bash -lc 'ls /home/gstack/projects >/dev/null 2>&1 && echo "FAIL: gstack source reachable" || echo "OK: source unreachable"'

# No broker/agent-run wrapper:
sudo -iu be-civic bash -lc 'command -v agent-run >/dev/null 2>&1 && echo "FAIL: broker wrapper present" || echo "OK: no broker/agent-run"'

# Broker TCP port: the broker listens on 127.0.0.1:7393 (host-wide loopback — all local UIDs
# can connect by default). Apply the iptables rule below BEFORE running this check:
# [root] close the network boundary:
sudo iptables -A OUTPUT -p tcp --dport 7393 -d 127.0.0.1 -m owner --uid-owner be-civic -j REJECT
# NOTE: the cleaner long-term alternative is to bind the broker to a gstack-owned unix socket
# (chmod 0700) — that is a gstack-side change to make when migrating the broker config.
# The broker also enforces server-side auth (issuer token + Slack-gated approval), but the
# network boundary should still be closed — defence in depth.
sudo -iu be-civic bash -lc 'curl -s --max-time 2 http://127.0.0.1:7393/ >/dev/null 2>&1 && echo "FAIL: broker port reachable" || echo "OK: broker unreachable"'

# Vendored plugin dir cannot be removed by be-civic (plugins parent is root-owned):
sudo -iu be-civic bash -lc 'rmdir --ignore-fail-on-non-empty ~/.claude/plugins/stack-graph 2>/dev/null && echo "FAIL: can remove vendored plugin" || echo "OK: cannot remove vendored plugin"'
```

**Gate:** all of (1)–(5) pass + all security-boundary checks report `OK` → proceed to
Phase C. Any failure → fix before continuing.

## Phase split (what's in B vs deferred to D)

- **Phase 1 (this runbook):** the 5 repos above + gbrain + the vendored plugin + checks.
  Enough to exercise the loop and render the workspace.
- **Phase 2 / Phase D (after the B6 gate):** clone `bc-landing`, `bc-taxcalc`,
  `be-civic-plugin-dev`; **copy** (no remote) `bc-chatgpt-app`, `corpus`, `fixtures`,
  `migration-snapshot`, `bc-workspace-devops-stubs-beta`. Re-run the checks. **Cutover** is
  a separate, later step.

## Phase C preview (after the gate — Claude@be-civic, separate session)

**The harness ships via the plugin — do not hand-assemble it.** After re-vendoring the updated
plugin (now carrying `harness-init` + `bindings-contract`; the B3 vendor step), in a be-civic
Claude session launched at the org root:

1. **`harness-init scaffold`** — writes `<org-root>/.claude/bindings.yaml` from the bindings
   contract (inferring + confirming the migrated paths) and scaffolds the bound surface skeleton
   (`strategy.md`; `objectives.md` per `okr-schema` — this fills the OKR gap; `items/` +
   `manifest.json`; `sprints/`). Then **`harness-init validate`** — the gate: every required
   binding resolves and the surface exists before the loop runs.
2. **`product-dashboard-curator add-item`** — add one verification work-item (the curator authors
   the `work-item-schema` content; `harness-init` only created the empty bound surface).
3. **Exercise the loop** — run `align-context`→`design` via the vendored plugin on that item;
   confirm carrier-tagged events land in `.stack-graph/`, `current_stage` projects from the log,
   and the portal joins the dashboard from the bound surfaces (`DASHBOARD_ROOT=<surface-root> bash
   workspace/build.sh`).

## Open decisions for the operator (recap)

1. **GitHub auth for `be-civic`** — dedicated SSH key vs operator-cloned-and-chowned (B1).
2. **The exact static secrets** to provision (B2) — minimal, product-scoped, no admin.
3. **Runbook placement** — keep in `docs/` or move the be-civic-specific docs out to keep
   `stack-graph` open-source-clean (top note).
4. **Confirm the `claude` install method** matches `gstack`'s exact setup (B2) — the
   default is to use the shared `/usr/bin/claude`; if user-level isolation is needed,
   install per-user via `~/.npm-global` and keep it ONLY on be-civic's own PATH.
5. **Confirm `gbrain serve` MCP registration** matches gstack's actual `claude mcp list`
   output (B4) — `gbrain serve` is the verified stdio MCP subcommand.
6. **Broker socket binding** — consider migrating gstack's broker to a unix socket (0700)
   owned by gstack; until then the iptables rule in B6 is the network boundary.
7. **linger** — `enable-linger` is only needed if be-civic runs persistent user services;
   the current runbook installs none. Revisit if a be-civic gbrain autopilot unit is added.
