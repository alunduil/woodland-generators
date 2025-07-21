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
- Documentation structure following Diátaxis framework
- How-to guide for creating and managing GitHub releases
- How-to guide for submitting modules to FoundryVTT package repository
- Pre-commit hooks integration with comprehensive code quality checks:
  - Code formatting with Prettier
  - TypeScript/JavaScript linting with ESLint
  - TypeScript compilation and type checking
  - Markdown linting with markdownlint
  - YAML validation and linting
  - JSON formatting and validation
  - Shell script linting with ShellCheck
  - Git hooks for trailing whitespace, end-of-file fixes, and merge conflicts
  - Large file detection and case conflict prevention
- Pre-commit configuration files for markdown and YAML linting customization

### Changed

- Updated module manifest to use compiled TypeScript output from `dist/`
  directory
- Configured build pipeline to compile TypeScript from `scripts/` to `dist/`
- Configured module.json relationships to declare Root TTRPG system
  compatibility and PbtA system dependency
- Complete rewrite of README.md from template placeholder to professional
  project documentation with proper description, installation methods, roadmap,
  and badges

### Deprecated

### Removed

### Fixed

### Security
