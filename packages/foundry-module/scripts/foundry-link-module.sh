#!/usr/bin/env sh

# SPDX-FileCopyrightText: 2025-2026 Alex Brandt
#
# SPDX-License-Identifier: MIT

# felddy container patch: link the dev module into Foundry's modules directory.
#
# The package is bind-mounted read-only at /srv/module (outside /data) and
# linked in here rather than mounted straight onto
# /data/Data/modules/woodland-generators. Mounting into /data makes Docker
# pre-create the mount's parent dirs (/data/Data, /data/Data/modules) as root.
# The image runs Foundry as the non-root user foundry (uid 421) and never
# chowns /data, so Foundry then can't create /data/Data/systems and aborts
# with EACCES at startup.
#
# The entrypoint sources patches only on the install path (a fresh or
# version-changed volume); the symlink it creates persists in the volume, so
# later restarts that skip patching still find the module linked.
#
# No `set -e`/`set -u`: container patches are sourced into the entrypoint, and
# toggling shell options would leak into it. Each step guards the next instead.

dest="/data/Data/modules/woodland-generators"
mkdir -p "$(dirname "$dest")" &&
  ln -sfn /srv/module "$dest" &&
  echo "linked ${dest} -> /srv/module"
