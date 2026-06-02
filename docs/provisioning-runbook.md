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
| Secrets | the **Bitwarden broker** (issuer token = admin) | **static, product-scoped** secrets only — no broker, no issuer |
| Plugin | the source graph (`graph/`) + the build | a **read-only vendored copy** (built skills/agents/refs) — *not* source |
| Reach | full admin | **cannot** read `~gstack`, edit factory source, or reach admin |

**Invariants** (verify at B6): (1) `be-civic` cannot read `/home/gstack`; (2) the vendored
plugin under `~be-civic` is **not writable** by `be-civic` (re-vendoring is a privileged
action); (3) no broker/issuer token, no `agent-run`, no admin path exists in `be-civic`;
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
sudo loginctl enable-linger be-civic                         # allow user services (Ollama is shared; gbrain autopilot is per-user)
# Lock the home so be-civic's tree is private and gstack's stays unreachable from it:
sudo chmod 750 /home/be-civic
sudo chmod 750 /home/gstack                                  # belt-and-braces: be-civic cannot read gstack's home
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
sudo -iu be-civic bash -lc 'echo "export BUN_INSTALL=\$HOME/.bun; export PATH=\$BUN_INSTALL/bin:\$PATH" >> ~/.bashrc'
sudo -iu be-civic bash -lc 'bun install -g gbrain@0.27.0'              # pin to the gstack version

# claude CLI — system-symlinked (mirror gstack: /usr/bin/claude). Install under be-civic's
# npm prefix, then root-symlink so it's on PATH for the user.
sudo -iu be-civic bash -lc 'npm config set prefix ~/.npm-global && npm i -g @anthropic-ai/claude-code'   # operator: confirm the package/install method matches gstack
# [root] symlink onto PATH (gstack has /usr/bin/claude):
sudo ln -sf /home/be-civic/.npm-global/bin/claude /usr/local/bin/claude   # per-user PATH alt: ~/.npm-global/bin
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
# [be-civic] source it at login:
sudo -iu be-civic bash -lc 'echo "[ -f ~/.config/be-civic/secrets.env ] && set -a && . ~/.config/be-civic/secrets.env && set +a" >> ~/.bashrc'
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
sudo install -d -o be-civic -g be-civic -m 755 /home/be-civic/.claude/plugins
sudo rm -rf "$DST" && sudo mkdir -p "$DST"
sudo cp -r "$SRC/.claude-plugin" "$SRC/skills" "$SRC/agents" "$SRC/references" "$DST/"
# read-only for be-civic: root owns, group can read/traverse, no write
sudo chown -R root:be-civic "$DST"
sudo find "$DST" -type d -exec chmod 755 {} \; && sudo find "$DST" -type f -exec chmod 644 {} \;
# (re-vendor on plugin updates = re-run this block; it's a root action by design)
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
# [root] copy gstack's brain into be-civic, then hand ownership over
sudo cp -r /home/gstack/.gbrain /home/be-civic/.gbrain
sudo chown -R be-civic:be-civic /home/be-civic/.gbrain
sudo chmod 700 /home/be-civic/.gbrain
# [be-civic] rewrite ONLY the database_path (engine/model/dimensions stay identical → schema unchanged)
sudo -iu be-civic bash -lc 'cd ~/.gbrain && \
  tmp=$(mktemp) && sed "s#/home/gstack/.gbrain#/home/be-civic/.gbrain#g" config.json > "$tmp" && mv "$tmp" config.json && chmod 600 config.json && cat config.json'
# expected: database_path=/home/be-civic/.gbrain/brain.pglite ; embedding_model=ollama:qwen3-embedding:0.6b ; dimensions=1024
# [be-civic] register the MCP server + sanity-check (apply-migrations is a no-op on a copied store)
sudo -iu be-civic bash -lc 'claude mcp add gbrain -- gbrain mcp'   # operator: confirm the exact `gbrain mcp` invocation matches gstack's
sudo -iu be-civic bash -lc 'gbrain doctor'
# Re-register source local_paths from gstack paths → be-civic paths, then resync:
sudo -iu be-civic bash -lc 'cd ~/projects/be-civic && for r in bc-workspace bc-operations bc-knowledge-graph; do gbrain sync "$r" --full || true; done'
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
  echo "1. claude launches:";        claude --version
  echo "2. gbrain healthy:";         gbrain doctor && gbrain search "civic" --source bc-workspace --limit 3 >/dev/null && echo "   hybrid search OK"
  echo "3. product skills load:";    ls ~/.claude/skills | head
  echo "4. vendored plugin present + READ-ONLY:"; ls ~/.claude/plugins/stack-graph/skills | head; \
       ( touch ~/.claude/plugins/stack-graph/_wtest 2>/dev/null && echo "   FAIL: plugin is writable" && rm -f ~/.claude/plugins/stack-graph/_wtest ) || echo "   OK: plugin not writable"
  echo "5. portal builds the migrated workspace:"; cd ~/projects/be-civic/bc-workspace && ( command -v dot && bash ../stack-graph-portal-build.sh 2>/dev/null || echo "   (portal build wired in Phase C against bindings)" )
'
# SECURITY-BOUNDARY checks (must behave as stated):
sudo -iu be-civic bash -lc 'cat /home/gstack/.bashrc >/dev/null 2>&1 && echo "FAIL: be-civic can read ~gstack" || echo "OK: ~gstack unreadable"'
sudo -iu be-civic bash -lc 'command -v agent-run >/dev/null 2>&1 && echo "FAIL: broker wrapper present" || echo "OK: no broker/agent-run"'
```

**Gate:** all of (1)–(5) pass + both security-boundary checks report `OK` → proceed to
Phase C. Any failure → fix before continuing.

## Phase split (what's in B vs deferred to D)

- **Phase 1 (this runbook):** the 5 repos above + gbrain + the vendored plugin + checks.
  Enough to exercise the loop and render the workspace.
- **Phase 2 / Phase D (after the B6 gate):** clone `bc-landing`, `bc-taxcalc`,
  `be-civic-plugin-dev`; **copy** (no remote) `bc-chatgpt-app`, `corpus`, `fixtures`,
  `migration-snapshot`, `bc-workspace-devops-stubs-beta`. Re-run the checks. **Cutover** is
  a separate, later step.

## Phase C preview (after the gate — Claude@be-civic, separate session)

`~/projects/be-civic/.claude/bindings.yaml` mapping each logical key → the migrated paths;
fill the OKR gap (`bc-workspace/roadmap/objectives.md` per `okr-schema`); author one
verification work-item in `work-item-schema` shape. Then **exercise**: run
`align-context`→`design` via the vendored plugin on the item; confirm carrier-tagged events
in `.stack-graph/`, `current_stage` projecting from the log, and the portal rendering the
dashboard from the bound surfaces (`DASHBOARD_ROOT=<ledger> bash workspace/build.sh`).

## Open decisions for the operator (recap)

1. **GitHub auth for `be-civic`** — dedicated SSH key vs operator-cloned-and-chowned (B1).
2. **The exact static secrets** to provision (B2) — minimal, product-scoped, no admin.
3. **Runbook placement** — keep in `docs/` or move the be-civic-specific docs out to keep
   `stack-graph` open-source-clean (top note).
4. **Confirm the `claude` install method + `gbrain mcp` invocation** match `gstack`'s exact
   setup (B2/B4) — these mirror gstack but verify against your actual install.
