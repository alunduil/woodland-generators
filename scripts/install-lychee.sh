#!/bin/bash

# SPDX-FileCopyrightText: 2025-2026 Alex Brandt
#
# SPDX-License-Identifier: MIT

# Install lychee link checker
#
# Downloads and installs a pre-built lychee binary (much faster than compiling from source).
# Used by both development containers (.devcontainer/post-create.sh) and CI/CD (.github/workflows/pre-commit.yml).
#
# Environments:
# - GitHub Actions: installs to ~/.local/bin and updates $GITHUB_PATH
# - Development containers: installs to /usr/local/bin with sudo

set -e

# Upstream tags releases as "lychee-vX.Y.Z" and ships assets without the
# version in the filename. Renovate strips the prefix via extractVersion so
# the bare semver lives in LYCHEE_VERSION here.
# renovate: datasource=github-releases depName=lycheeverse/lychee extractVersion=^lychee-(?<version>v.+)$
LYCHEE_VERSION="v0.24.2"
# Pull the statically linked musl build so the same binary runs on
# ubuntu-latest CI runners and on Debian 12 devcontainers (whose GLIBC
# 2.36 cannot satisfy the GNU build's GLIBC 2.38+ requirement).
LYCHEE_ARCHIVE="lychee-x86_64-unknown-linux-musl.tar.gz"
LYCHEE_URL="https://github.com/lycheeverse/lychee/releases/download/lychee-${LYCHEE_VERSION}/${LYCHEE_ARCHIVE}"

echo "🔗 Installing lychee link checker (${LYCHEE_VERSION})..."

# Create a temporary directory for downloads
TEMP_DIR=$(mktemp -d)
trap 'rm -rf "${TEMP_DIR}"' EXIT

# Download and extract lychee
echo "  📥 Downloading from ${LYCHEE_URL}..."
curl -sSfL "${LYCHEE_URL}" -o "${TEMP_DIR}/${LYCHEE_ARCHIVE}"

echo "  📦 Extracting archive..."
# Modern lychee tarballs wrap their contents in a target-named top-level
# directory; strip it so the binary lands at ${TEMP_DIR}/lychee for the mv
# below.
tar -xzf "${TEMP_DIR}/${LYCHEE_ARCHIVE}" -C "${TEMP_DIR}" --strip-components=1

# Install to appropriate location
if [[ -n "${GITHUB_ACTIONS}" ]]; then
    # GitHub Actions environment
    echo "  🚀 Installing to ${HOME}/.local/bin/lychee..."
    mkdir -p "${HOME}/.local/bin"
    mv "${TEMP_DIR}/lychee" "${HOME}/.local/bin/"
    echo "${HOME}/.local/bin" >> "${GITHUB_PATH}"
else
    # Development container environment (has sudo access)
    echo "  🚀 Installing to /usr/local/bin/lychee..."
    sudo mv "${TEMP_DIR}/lychee" /usr/local/bin/
fi

echo "  ✅ lychee installed successfully!"

# Verify installation
INSTALLED_VERSION=$(lychee --version | head -n1)
echo "  🎯 Verification: ${INSTALLED_VERSION}"
