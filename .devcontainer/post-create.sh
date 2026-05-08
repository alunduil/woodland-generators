#!/bin/bash
set -e

echo "🚀 Setting up Woodland Generators development environment..."

# Activate pnpm via corepack (version pinned by package.json#packageManager)
echo "📦 Activating pnpm via corepack..."
corepack enable
corepack prepare --activate

# Install project dependencies
echo "📦 Installing project dependencies..."
pnpm install --frozen-lockfile

# Install lychee for link checking
"$(dirname "${BASH_SOURCE[0]}")/../scripts/install-lychee.sh"

# Configure git safe directory
echo "🔧 Configuring git safe directory..."
git config --global --add safe.directory /workspace

# Set up pre-commit hooks
echo "🪝 Setting up pre-commit hooks..."
pre-commit install

echo "✅ Development environment setup complete!"
echo "🎯 You can now start developing your CLI tool."
