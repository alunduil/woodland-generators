#!/bin/bash

# SPDX-FileCopyrightText: 2025-2026 Alex Brandt
#
# SPDX-License-Identifier: MIT

set -e

echo "🚀 Setting up Woodland Generators development environment..."

# Activate pnpm via corepack (version pinned by package.json#packageManager)
echo "📦 Activating pnpm via corepack..."
corepack enable
corepack prepare --activate

# Install project dependencies
echo "📦 Installing project dependencies..."
pnpm install --frozen-lockfile

# Install lychee for link checking, at the version and checksum in mise.lock
echo "🔗 Installing lychee via mise..."
mise trust
mise install github:lycheeverse/lychee

# Configure git safe directory
echo "🔧 Configuring git safe directory..."
git config --global --add safe.directory /workspace

# Set up pre-commit hooks
echo "🪝 Setting up pre-commit hooks..."
pre-commit install

echo "✅ Development environment setup complete!"
echo "🎯 You can now start developing your CLI tool."
