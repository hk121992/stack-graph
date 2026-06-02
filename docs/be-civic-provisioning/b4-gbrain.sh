#!/usr/bin/env bash
# B4 — gbrain: copy gstack's store + reconfigure paths (no schema change, no re-index).
# Run as root / sudo.  WARNING: briefly STOPS gstack's gbrain daemons — run when gstack is idle.
# Binary-compatible: same gbrain 0.27.0 + qwen3-embedding:0.6b (1024-dim) + shared Ollama.
set -euo pipefail
[[ $EUID -eq 0 ]] || { echo "run as root (sudo)"; exit 1; }

# Quiesce gstack writers — never copy a running database.
# (Preferred if available: `gbrain export` as gstack then `gbrain import` as be-civic.
#  The cp -a below is the documented fallback and is used here.)
sudo -u gstack bash -lc 'systemctl --user stop gbrain-autopilot.service 2>/dev/null; pkill -u gstack -f "gbrain serve" 2>/dev/null; true'

# Copy + hand ownership (cp -a preserves perms/timestamps; ONLY after quiescing).
cp -a /home/gstack/.gbrain /home/be-civic/.gbrain
chown -R be-civic:be-civic /home/be-civic/.gbrain
chmod 700 /home/be-civic/.gbrain

# Restart gstack's gbrain daemons.
sudo -u gstack bash -lc 'systemctl --user start gbrain-autopilot.service 2>/dev/null; true'

# Re-point database_path. `gbrain config set` does NOT work on a freshly-copied brain — gbrain
# opens the OLD (gstack) path on startup before applying the change and dies with EACCES. Edit the
# config file directly, AS be-civic (editing as root re-owns it root:root and locks be-civic out).
sudo -u be-civic sed -i 's#/home/gstack/.gbrain#/home/be-civic/.gbrain#g' /home/be-civic/.gbrain/config.json
sudo -iu be-civic bash -lc 'export PATH="$HOME/.bun/bin:$PATH" && gbrain config show'
# Register the stdio MCP server.
sudo -iu be-civic bash -lc 'export PATH="$HOME/.bun/bin:$PATH" && claude mcp add gbrain -- gbrain serve'
# Health + a real query (warnings re: skills-dir and 1 pre-existing sync failure are non-blocking).
sudo -iu be-civic bash -lc 'export PATH="$HOME/.bun/bin:$PATH" && gbrain doctor 2>&1 | head -18'
sudo -iu be-civic bash -lc 'export PATH="$HOME/.bun/bin:$PATH" && gbrain stats && gbrain query "Belgian nationality application" --limit 3 >/dev/null && echo "query OK"'
# NOTE: the runbook's per-repo resync is intentionally SKIPPED. gstack's brain content all lives in
# the `default` source (not repo-sourced), so syncing the repos here would index DUPLICATES. Proper
# per-repo sourcing is a separate, deliberate follow-up (operator's call).
