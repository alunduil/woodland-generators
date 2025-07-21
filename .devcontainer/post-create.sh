#!/bin/bash
set -e

echo "🚀 Setting up Woodland Generators development environment..."

# Install global npm packages
echo "📦 Installing global npm packages..."
npm install -g \
  typescript \
  @typescript-eslint/parser \
  @typescript-eslint/eslint-plugin \
  prettier \
  eslint \
  @foundryvtt/foundryvtt-cli

# Configure git safe directory
echo "🔧 Configuring git safe directory..."
git config --global --add safe.directory /workspace

echo "✅ Development environment setup complete!"
echo "🎯 You can now start developing your FoundryVTT module."
