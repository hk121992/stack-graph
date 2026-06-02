#!/usr/bin/env bash
# B3 — vendor the BUILT plugin (read-only) + clone Phase-1 repos.  Run as root / sudo.
# PREREQ (gstack): `cd ~/projects/stack-graph && bun run vendor` has refreshed the build surface.
set -euo pipefail
[[ $EUID -eq 0 ]] || { echo "run as root (sudo)"; exit 1; }

SRC=/home/gstack/projects/stack-graph
DST=/home/be-civic/.claude/plugins/stack-graph

# ~/.claude must be be-civic-owned — Claude Code writes session state/todos/projects there.
install -d -o be-civic -g be-civic -m 755 /home/be-civic/.claude
# Plugins PARENT is root-owned so be-civic cannot remove/replace/tamper with the vendored dir.
install -d -o root -g be-civic -m 755 /home/be-civic/.claude/plugins
# Sanity gate before rm -rf.
case "$DST" in /home/be-civic/.claude/plugins/*) : ;; *) echo "refusing: unexpected DST=$DST"; exit 1;; esac
rm -rf -- "$DST" && mkdir -p "$DST"
# Copy ONLY the built surface — not source graph/, not tooling/.
cp -r "$SRC/.claude-plugin" "$SRC/skills" "$SRC/agents" "$SRC/references" "$DST/"
# Read-only for be-civic: root owns, group reads/traverses, no write.
chown -R root:be-civic "$DST"
find "$DST" -type d -exec chmod 755 {} \;
find "$DST" -type f -exec chmod 644 {} \;
# (re-vendor on plugin updates = re-run this block; root action by design)
# dev-tooling (tooling/sg-*) intentionally NOT vendored — be-civic runs the loop, not authoring.

# ---- Clone Phase-1 repos as be-civic (SSH; key on Henry's account from B1) ----
# One clone per `sudo -iu` call. Do NOT use `sudo -i ... bash -lc '<multiline>'` — sudo -i
# flattens embedded newlines and mangles the script (cd then swallows the clone lines).
P=/home/be-civic/projects/be-civic
sudo -iu be-civic mkdir -p "$P"
sudo -iu be-civic git -C "$P" clone git@github.com:hk121992/bc-workspace.git
sudo -iu be-civic git -C "$P" clone git@github.com:hk121992/be-civic-operations.git bc-operations  # remote name differs
sudo -iu be-civic git -C "$P" clone git@github.com:hk121992/bc-knowledge-graph.git                 # ~759M, the long pole
sudo -iu be-civic git -C "$P" clone git@github.com:Be-Civic/be-civic-plugin.git                    # public
sudo -iu be-civic git -C "$P" clone git@github.com:hk121992/bc-renderer-core.git
