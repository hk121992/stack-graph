#!/usr/bin/env bash
# B2 — toolchain + Tier-A secrets.  Run as root / sudo.
# Decision: NO hand-authored secrets. Tier-A set vendored (gstack broker, INTERIM)
#           then root-installed. be-civic stays broker-isolated.
set -euo pipefail
[[ $EUID -eq 0 ]] || { echo "run as root (sudo)"; exit 1; }

# ---- Toolchain (mirror gstack: bun, gbrain 0.27.0) ----
sudo -iu be-civic bash -lc 'command -v bun >/dev/null 2>&1' || sudo -iu be-civic bash -lc 'curl -fsSL https://bun.sh/install | bash'
# PATH in ~/.profile (NOT ~/.bashrc — its non-interactive guard no-ops bash -lc / Claude / daemons).
# Write as root via a QUOTED heredoc so $HOME/$PATH stay literal. Do NOT route a literal '$' through
# `sudo -i ... bash -lc` — the login-shell rebuild mangles \$ and corrupts the PATH line.
grep -q BUN_INSTALL /home/be-civic/.profile || cat >> /home/be-civic/.profile <<'PROFILE'
export BUN_INSTALL="$HOME/.bun"
export PATH="$BUN_INSTALL/bin:$PATH"
PROFILE
# gbrain 0.27.0 is NOT the public npm `gbrain` — it's github.com/garrytan/gbrain, and gstack's
# checkout carries LOAD-BEARING local patches (ollama recipe -> qwen3-embedding @ 1024-dim, to match
# the copied 1024-dim brain; + be-civic frontmatter rules). Mirror gstack's working tool, trimmed to
# runtime essentials (drop git history / tests / docs / admin UI / CI). No fork or build needed;
# updating later = re-run this copy (same re-vendor model as the plugin).
if ! sudo -iu be-civic bash -lc 'export PATH="$HOME/.bun/bin:$PATH"; command -v gbrain >/dev/null 2>&1 && gbrain --version 2>/dev/null | grep -q 0.27.0'; then
  rm -rf /home/be-civic/gbrain
  cp -a /home/gstack/gbrain /home/be-civic/gbrain
  rm -rf /home/be-civic/gbrain/.git /home/be-civic/gbrain/test /home/be-civic/gbrain/tests \
         /home/be-civic/gbrain/docs /home/be-civic/gbrain/admin /home/be-civic/gbrain/.github
  chown -R be-civic:be-civic /home/be-civic/gbrain
  # Mirror gstack's global layout (bin -> source cli.ts). sudo -u + absolute paths, no login shell.
  sudo -u be-civic mkdir -p /home/be-civic/.bun/install/global/node_modules
  sudo -u be-civic ln -sfn /home/be-civic/gbrain /home/be-civic/.bun/install/global/node_modules/gbrain
  sudo -u be-civic ln -sfn ../install/global/node_modules/gbrain/src/cli.ts /home/be-civic/.bun/bin/gbrain
fi

# Confirm toolchain + embedding model resolve (do NOT reinstall the shared system tools).
# claude = shared /usr/bin/claude (no per-user install, no system symlink).
sudo -iu be-civic bash -lc 'export PATH="$HOME/.bun/bin:$PATH" && node -v && bun --version && gbrain --version && git --version && command -v dot wrangler claude && ollama list | grep qwen3-embedding'

# ---- Tier-A secrets: vendor via gstack broker -> install into be-civic (INTERIM) ----
# be-civic CANNOT reach the broker (invariant 3 / B6 iptables). Vendor gstack-side, install as root.
# When the broker moves to the admin user, that user runs this step instead.
STAGE="$(sudo -u gstack mktemp -d)"
sudo -u gstack tee "$STAGE/.bw.yaml" >/dev/null <<'YAML'
version: 1
vendor:                            # Tier A only — auto-approved, no Slack prompt
  - workstation/ws-gh-pat          # -> GITHUB_TOKEN  (gh CLI / API, as Henry)
  - workstation/ws-cf-api-dev-token# -> CLOUDFLARE_API_TOKEN (local wrangler dev; DROP if all CF work is CI)
  - be-civic/bc-cf-account-id      # -> CLOUDFLARE_ACCOUNT_ID (non-sensitive id)
YAML
sudo -iu gstack bash -lc "export PATH=\$HOME/.bun/bin:\$PATH:\$HOME/.local/bin && bw-vendor '$STAGE'"

# Install the vendored env into be-civic (root-owned write, be-civic-owned result, 0600).
install -o be-civic -g be-civic -m 755 -d /home/be-civic/.config   # ~/.config must be be-civic-owned (else wrangler/tools hit EACCES)
install -o be-civic -g be-civic -m 700 -d /home/be-civic/.config/bw
install -o be-civic -g be-civic -m 600 "$STAGE/.env" /home/be-civic/.config/bw/shell.env
( sudo -u gstack shred -u "$STAGE/.env" 2>/dev/null || rm -f "$STAGE/.env" ); rm -rf "$STAGE"

# Source at login (~/.profile). gh reads GITHUB_TOKEN from env in login shells.
grep -q 'config/bw/shell.env' /home/be-civic/.profile || cat >> /home/be-civic/.profile <<'PROFILE'
[ -f ~/.config/bw/shell.env ] && set -a && . ~/.config/bw/shell.env && set +a
PROFILE

cat <<'EOF'

NOTE: Claude Code does not read ~/.profile at runtime. Tokens reach Claude's Bash
tool only when `claude` is launched from a login shell that sourced shell.env. For
any headless/systemd use, put the needed vars in ~/.claude settings env: or an
EnvironmentFile (see B5).

=================== OPERATOR ACTION (LLM auth) ===================
Mirror gstack: subscription login, not an API key.
  sudo -iu be-civic claude        # then run /login once, interactively
=================================================================
EOF
