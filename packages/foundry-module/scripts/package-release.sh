#!/usr/bin/env bash

# SPDX-FileCopyrightText: 2025-2026 Alex Brandt
#
# SPDX-License-Identifier: MIT

# Assembles the two assets a GitHub Release has to carry for Foundry to install
# the module: module.json, served at the manifest URL players paste, and the zip
# that manifest points at. Foundry unpacks the zip straight into
# Data/modules/<id>, so every entry has to sit at the zip root.
#
# Set RELEASE_TAG to have the tag being published checked against module.json.
# Left unset, the tag is derived, which is what lets CI run this on a branch.

set -euo pipefail

package_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$package_dir"

version="$(jq -r '.version' module.json)"
repository_url="$(jq -r '.url' module.json)"
tag="foundry-module@${version}"

# release-please bumps package.json and module.json in the commit it tags, so
# the two agreeing is the signal that the payload is the one being released.
if [[ -n "${RELEASE_TAG:-}" && "${RELEASE_TAG}" != "${tag}" ]]; then
  echo "module.json is at ${version}, which packages ${tag}, but the release tag is ${RELEASE_TAG}." >&2
  exit 1
fi

out="release"
payload="${out}/payload"
rm -rf "$out"
mkdir -p "$payload"

# package.json `files` is where this package declares what it ships. Reading it
# here keeps the zip from drifting from that declaration.
while IFS= read -r entry; do
  if [[ ! -e "$entry" ]]; then
    echo "package.json lists ${entry}, which is missing. Run the package build first." >&2
    exit 1
  fi
  cp -R "$entry" "$payload/"
done < <(jq -r '.files[]' package.json)

# Foundry fetches `manifest` to decide whether a newer version exists, so it has
# to name the latest release; it then installs `download` from the manifest it
# just fetched, so that names this release alone.
jq --arg manifest "${repository_url}/releases/latest/download/module.json" \
  --arg download "${repository_url}/releases/download/${tag}/module.zip" \
  '.manifest = $manifest | .download = $download' \
  module.json >"${payload}/module.json"

(cd "$payload" && zip --quiet --recurse-paths ../module.zip .)
cp "${payload}/module.json" "${out}/module.json"

if ! zip -sf "${out}/module.zip" | grep -qx '  module.json'; then
  echo "module.json is not at the zip root, so Foundry would reject the install." >&2
  exit 1
fi

echo "Packaged ${tag} into ${package_dir}/${out}"
