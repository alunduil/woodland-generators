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

### Changed

- Character command now requires a playbook PDF path as an argument
- Character generation output is now structured JSON format
- Removed generic `--format` and `--count` options in favor of PDF-specific
  functionality
- Improved deterministic random generation for more consistent character
  creation across multiple runs with the same seed
- Enhanced species generation reliability with improved random selection
  algorithm for more consistent results
- When playbooks specify "other" as a species option, characters now receive
  species from an extensive Root-appropriate woodland creatures list instead of
  literally being assigned "other" as their species

### Deprecated

### Removed

### Fixed

### Security
