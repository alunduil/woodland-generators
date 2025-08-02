# CHANGELOG

All notable changes to this project appear in this file.

The format follows [Keep a CHANGELOG](https://keepachangelog.com/en/1.0.0/), and
this project adheres to
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- CLI tool for generating Root: The Tabletop RPG resources (`woodland-gen`
  command)
- Character generation with `character` sub-command (alias: `char`)
- PDF playbook parsing support for Root RPG playbook files
- Comprehensive character generation from playbook PDF files including:
  - Species generation with traits and details
  - Name generation for woodland creatures
  - Background, feat, and move generation
  - Playbook-specific archetype selection
- Reproducible character generation via `--seed` option
- Custom name override via `--name` option
- Specific archetype selection via `--archetype` option
- Multi-source playbook support (PDF and JSON formats)
- Global installation support via npm
- Extended woodland species catalog (100+ species) for enhanced character
  diversity when playbooks include "other" species option
- `--log-level` option for controlling diagnostic output verbosity with support
  for standard log levels (trace, debug, info, warn, error, fatal)
- `--species` option for character command to override species selection
- Structured logging throughout generation pipeline for debugging generation
  failures

### Changed

### Deprecated

### Removed

### Fixed

### Security
