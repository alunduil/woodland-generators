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

# The manifest's name is fixed three times over: Foundry looks for it at the zip
# root, the release serves it under that name, and the manifest URL ends in it.
readonly MANIFEST=module.json
readonly ARCHIVE=module.zip

readonly OUT_DIR=release
readonly PAYLOAD_DIR="${OUT_DIR}/payload"

# release-please builds the tag from `component` and `tag-separator` in
# release-please-config.json. Changing either there changes this.
readonly TAG_PREFIX=foundry-module@

die() {
  echo "$*" >&2
  exit 1
}

# `zip -sf` prints each entry indented under an "Archive contains:" header, and
# an unindented total after them. Stripping the indent selects the entries.
archive_entries() {
  zip -sf "$1" | sed -n 's/^  //p'
}

# release-please bumps package.json and module.json in the commit it tags, so
# the two agreeing is the signal that the payload is the one being released.
assert_tag_names_this_payload() {
  local tag=$1

  [[ -z ${RELEASE_TAG:-} || ${RELEASE_TAG:-} == "$tag" ]] ||
    die "module.json packages ${tag}, but the release tag is ${RELEASE_TAG}."
}

# package.json `files` is where this package declares what it ships. Reading it
# here keeps the zip from drifting from that declaration.
stage_declared_files() {
  local entry

  while IFS= read -r entry; do
    [[ -e $entry ]] ||
      die "package.json lists ${entry}, which is missing. Run the package build first."
    cp -R "$entry" "${PAYLOAD_DIR}/"
  done < <(jq -r '.files[]' package.json)
}

# Foundry fetches `manifest` to decide whether a newer version exists, so it has
# to name the latest release; it then installs `download` from the manifest it
# just fetched, so that names this release alone.
write_release_manifest() {
  local tag=$1 repository_url=$2

  jq --arg manifest "${repository_url}/releases/latest/download/${MANIFEST}" \
    --arg download "${repository_url}/releases/download/${tag}/${ARCHIVE}" \
    '.manifest = $manifest | .download = $download' \
    "$MANIFEST" >"${PAYLOAD_DIR}/${MANIFEST}"
}

archive_payload() {
  (cd "$PAYLOAD_DIR" && zip --quiet --recurse-paths "../${ARCHIVE}" .)
}

# Guards the zip being built from inside the payload rather than above it, which
# is the difference between Foundry finding the manifest and rejecting the zip.
assert_manifest_at_archive_root() {
  archive_entries "${OUT_DIR}/${ARCHIVE}" | grep -qx "$MANIFEST" ||
    die "${MANIFEST} is not at the zip root, so Foundry would reject the install."
}

cd "$(dirname "${BASH_SOURCE[0]}")/.."

repository_url="$(jq -r '.url' "$MANIFEST")"
tag="${TAG_PREFIX}$(jq -r '.version' "$MANIFEST")"
assert_tag_names_this_payload "$tag"

rm -rf "$OUT_DIR"
mkdir -p "$PAYLOAD_DIR"

stage_declared_files
write_release_manifest "$tag" "$repository_url"
cp "${PAYLOAD_DIR}/${MANIFEST}" "${OUT_DIR}/${MANIFEST}"

archive_payload
assert_manifest_at_archive_root

echo "Packaged ${tag} into $(pwd)/${OUT_DIR}"
