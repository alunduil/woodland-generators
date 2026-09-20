#!/usr/bin/env bash

# SPDX-FileCopyrightText: 2025-2026 Alex Brandt
#
# SPDX-License-Identifier: MIT

# Assembles the two assets a GitHub Release has to carry for Foundry to install
# the module: module.json, served at the manifest URL players paste, and the zip
# that manifest points at.
#
# Foundry unpacks the zip into Data/modules/<id>, so every entry sits at the zip
# root.
#
# RELEASE_TAG, when set, is checked against module.json. Left unset, the tag is
# derived from it, so CI can run this on a branch.

set -euo pipefail

readonly MANIFEST=module.json
readonly ARCHIVE=module.zip

readonly OUT_DIR=release
readonly PAYLOAD_DIR="${OUT_DIR}/payload"

# release-please composes the tag from `component` and `tag-separator` in
# release-please-config.json; this literal has to track both.
readonly TAG_PREFIX=foundry-module@

die() {
  echo "$*" >&2
  exit 1
}

# `zip -sf` indents each entry under an "Archive contains:" header and prints an
# unindented total after them.
archive_entries() {
  zip -sf "$1" | sed -n 's/^  //p'
}

# release-please bumps module.json in the commit it tags. A disagreement means
# the checkout is not the commit being released.
assert_tag_names_this_payload() {
  local tag=$1

  [[ -z ${RELEASE_TAG:-} || ${RELEASE_TAG:-} == "$tag" ]] ||
    die "module.json packages ${tag}, but the release tag is ${RELEASE_TAG}."
}

# The package is `private: true`, so npm never reads `files` and this script is
# its only consumer. An entry added there lands in the zip.
stage_declared_files() {
  local entry

  while IFS= read -r entry; do
    [[ -e $entry ]] ||
      die "package.json lists ${entry}, which is missing. Run the package build first."
    cp -R "$entry" "${PAYLOAD_DIR}/"
  done < <(jq -r '.files[]' package.json)
}

# Foundry fetches `manifest` to decide whether a newer version exists, so it
# names the latest release. It installs `download` from the manifest it just
# fetched, so that names this release alone.
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
