#!/bin/bash
set -e

echo "🚀 Setting up Woodland Generators development environment..."

# Update npm to latest version
echo "📦 Updating npm to latest version..."
npm install -g npm@latest

# Install global npm packages
echo "📦 Installing global npm packages..."
npm install -g \
  typescript \
  @typescript-eslint/parser \
  @typescript-eslint/eslint-plugin \
  prettier \
  eslint \
  @foundryvtt/foundryvtt-cli

# Install lychee for link checking
echo "🔗 Installing lychee link checker..."
LYCHEE_VERSION="v0.15.1"
LYCHEE_ARCHIVE="lychee-${LYCHEE_VERSION}-x86_64-unknown-linux-gnu.tar.gz"
LYCHEE_URL="https://github.com/lycheeverse/lychee/releases/download/${LYCHEE_VERSION}/${LYCHEE_ARCHIVE}"

# Download and extract lychee
curl -sSfL "${LYCHEE_URL}" -o "/tmp/${LYCHEE_ARCHIVE}"
tar -xzf "/tmp/${LYCHEE_ARCHIVE}" -C /tmp
sudo mv /tmp/lychee /usr/local/bin/
rm -f "/tmp/${LYCHEE_ARCHIVE}"

# Configure git safe directory
echo "🔧 Configuring git safe directory..."
git config --global --add safe.directory /workspace

# Set up pre-commit hooks
echo "🪝 Setting up pre-commit hooks..."
pre-commit install

echo "✅ Development environment setup complete!"
echo "🎯 You can now start developing your FoundryVTT module."
