#!/usr/bin/env bash
# B1 — create the be-civic user.  Run as root / sudo.
# Decision: dedicated SSH key, added to HENRY'S PERSONAL GitHub account (not a bot).
set -euo pipefail
[[ $EUID -eq 0 ]] || { echo "run as root (sudo)"; exit 1; }

# 1. Create the user — no password; key / sudo-su access only. (idempotent)
id be-civic >/dev/null 2>&1 || adduser --gecos "" --disabled-password be-civic

# 2. Lock homes: be-civic private; gstack unreachable from it.
chmod 750 /home/be-civic
chmod 700 /home/gstack          # invariant: others=--- on gstack home (be-civic is "other")

# linger intentionally NOT enabled — be-civic runs no persistent user services
# (Ollama is shared loopback, independent of linger). See runbook decision 7.

# 3. Dedicated SSH key for be-civic.
#    Use `sudo -u` (NOT -i): the login-shell rebuild under -i drops the empty -N '' arg.
install -d -o be-civic -g be-civic -m 700 /home/be-civic/.ssh
[ -f /home/be-civic/.ssh/id_ed25519 ] || \
  sudo -u be-civic ssh-keygen -t ed25519 -C "be-civic@$(hostname)" -N '' -f /home/be-civic/.ssh/id_ed25519
# Pre-trust github.com so the first clone does not prompt.
sudo -u be-civic bash -c 'ssh-keyscan -t ed25519 github.com >> /home/be-civic/.ssh/known_hosts 2>/dev/null; chmod 600 /home/be-civic/.ssh/known_hosts'

# Authorize INBOUND login (ssh / VS Code Remote) with the operator's key — the SAME key that logs
# into gstack. NOTE: be-civic's id_ed25519 above is its OUTBOUND identity to GitHub, NOT for login;
# without this step `ssh be-civic@host` fails with "Permission denied (publickey)".
install -o be-civic -g be-civic -m 600 /home/gstack/.ssh/authorized_keys /home/be-civic/.ssh/authorized_keys

cat <<EOF

=================== OPERATOR ACTION REQUIRED ===================
Add this PUBLIC key to YOUR PERSONAL GitHub account (hk121992):
  GitHub -> Settings -> SSH and GPG keys -> New SSH key
  (title e.g. "be-civic@$(hostname)" — revoke THIS key alone to cut be-civic off)

$(cat /home/be-civic/.ssh/id_ed25519.pub)

Henry's account owns the 4 personal repos and can read Be-Civic/be-civic-plugin
(public), so this single key reaches all 5 Phase-1 repos.
================================================================
EOF
