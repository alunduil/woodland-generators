# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- DevContainer configuration for consistent development environment
- Complete development toolchain setup (TypeScript, ESLint, Prettier)
- CI/CD pipeline with GitHub Actions for linting, building, and testing
- VS Code workspace configuration with recommended extensions
- Basic FoundryVTT type definitions for development
- Node.js test runner setup with example tests
- Comprehensive project structure with TypeScript compilation
- Enhanced Dependabot configuration with npm ecosystem support and grouped
  development dependencies
- Module icons in multiple resolutions (128x128, 256x256, 2048x2048) for better
  display across different contexts

### Changed

- Updated module manifest to use compiled TypeScript output from `dist/`
  directory
- Configured build pipeline to compile TypeScript from `scripts/` to `dist/`
- Configured module.json relationships to declare Root TTRPG system
  compatibility and PbtA system dependency

### Deprecated

### Removed

### Fixed

### Security
