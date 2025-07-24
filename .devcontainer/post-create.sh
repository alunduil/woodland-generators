#!/bin/bash
set -e

echo "🚀 Setting up Woodland Generators development environment..."

# Install project dependencies
echo "📦 Installing project dependencies..."
npm install

# Install lychee for link checking
"$(dirname "${BASH_SOURCE[0]}")/../tools/install-lychee.sh"

# Configure git safe directory
echo "🔧 Configuring git safe directory..."
git config --global --add safe.directory /workspace

# Set up pre-commit hooks
echo "🪝 Setting up pre-commit hooks..."
pre-commit install

echo "✅ Development environment setup complete!"
echo "🎯 You can now start developing your CLI tool."
