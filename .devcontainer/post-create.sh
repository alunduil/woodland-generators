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
"$(dirname "${BASH_SOURCE[0]}")/../tools/install-lychee.sh"

# Configure git safe directory
echo "🔧 Configuring git safe directory..."
git config --global --add safe.directory /workspace

# Set up pre-commit hooks
echo "🪝 Setting up pre-commit hooks..."
pre-commit install

echo "✅ Development environment setup complete!"
echo "🎯 You can now start developing your FoundryVTT module."
