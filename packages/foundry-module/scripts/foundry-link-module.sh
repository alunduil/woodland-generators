#!/usr/bin/env sh

# SPDX-FileCopyrightText: 2025-2026 Alex Brandt
#
# SPDX-License-Identifier: MIT

# felddy container patch: link the dev module into Foundry's modules directory.
#
# The package is bind-mounted read-only at /srv/module (outside /data) and
# linked in here rather than mounted straight onto
# /data/Data/modules/woodland-generators. Mounting into /data makes Docker
# pre-create the mount's parent dirs as root, which the image's one-shot
# `chown -R /data` cannot repair (it also aborts on the read-only mount),
# leaving Foundry (uid 421) unable to write under /data/Data.
#
# No `set -e`/`set -u`: container patches may be sourced, and toggling shell
# options would leak into the launcher. Each step guards the next instead.

dest="/data/Data/modules/woodland-generators"
mkdir -p "$(dirname "$dest")" &&
  ln -sfn /srv/module "$dest" &&
  echo "linked ${dest} -> /srv/module"
