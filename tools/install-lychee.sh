#!/bin/bash
# Install lychee link checker
#
# Downloads and installs a pre-built lychee binary (much faster than compiling from source).
# Used by both development containers (.devcontainer/post-create.sh) and CI/CD (.github/workflows/pre-commit.yml).
#
# Environments:
# - GitHub Actions: installs to ~/.local/bin and updates $GITHUB_PATH
# - Development containers: installs to /usr/local/bin with sudo

set -e

LYCHEE_VERSION="v0.15.1"
LYCHEE_ARCHIVE="lychee-${LYCHEE_VERSION}-x86_64-unknown-linux-gnu.tar.gz"
LYCHEE_URL="https://github.com/lycheeverse/lychee/releases/download/${LYCHEE_VERSION}/${LYCHEE_ARCHIVE}"

echo "🔗 Installing lychee link checker (${LYCHEE_VERSION})..."

# Create a temporary directory for downloads
TEMP_DIR=$(mktemp -d)
trap 'rm -rf "${TEMP_DIR}"' EXIT

# Download and extract lychee
echo "  📥 Downloading from ${LYCHEE_URL}..."
curl -sSfL "${LYCHEE_URL}" -o "${TEMP_DIR}/${LYCHEE_ARCHIVE}"

echo "  📦 Extracting archive..."
tar -xzf "${TEMP_DIR}/${LYCHEE_ARCHIVE}" -C "${TEMP_DIR}"

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
