# Woodland Generators

[![GitHub release](https://img.shields.io/github/release/alunduil/woodland-generators)](https://github.com/alunduil/woodland-generators/releases)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![codecov](https://codecov.io/github/alunduil/woodland-generators/graph/badge.svg?token=WR4ZQLMJMB)](https://codecov.io/github/alunduil/woodland-generators)

A CLI tool for generating resources for Root: The Tabletop RPG.

**By [Alex Brandt](https://github.com/alunduil)**

## What this tool does

Woodland Generators currently ships one capability:

- **Character generator**: Build a Root character from a playbook PDF (or
  pre-parsed JSON playbook), with optional seed, archetype, name, and species
  overrides. Writes JSON to standard output, ready to redirect to a file or pipe
  into another tool.

Other generators (NPC, clearing, adventure plot) and additional export formats
(Markdown, HTML, PDF) are planned but not yet implemented. Track progress on the
[milestones page](https://github.com/alunduil/woodland-generators/milestones).

## Installation

### Method 1 - npm (recommended)

```bash
npm install -g woodland-generators
```

### Method 2 - direct download

Get the newest version from the
[releases page](https://github.com/alunduil/woodland-generators/releases) and
run the file.

## Requirements

- Node.js 18.0.0 or later (for npm installation)

## Usage

### Quick start

```bash
# Generate a character from a Root playbook PDF
woodland-gen character path/to/playbook.pdf

# Reproduce the same character later via seed
woodland-gen character path/to/playbook.pdf --seed abc123

# Get help for any command
woodland-gen --help
woodland-gen character --help
```

The generated character prints as JSON. Redirect to a file or pipe into another
tool as needed.

## Contributing

Help welcome! You can help by:

- Reporting bugs or asking for features in GitHub Issues
- Adding code via pull requests
- Making docs better
- Testing the tool and giving feedback
- Sharing the project with other Root RPG fans

For setup help and detailed guides, see [CONTRIBUTING.md](CONTRIBUTING.md).

## Documentation

- **README.md** (this file): Project overview, setup, and basic use
- **[CONTRIBUTING.md](CONTRIBUTING.md)**: Setup help and guide for helpers
- **[CHANGELOG.md](CHANGELOG.md)**: Project history and version changes
- **[LICENSE](LICENSE)**: MIT License terms
- **docs/**: Extra docs for helpers and maintainers

For help with commands, use `woodland-gen [command] --help`.

## Support

Need help using Woodland Generators? Get help from:

- **Questions about use**: Ask in
  [GitHub Discussions](https://github.com/alunduil/woodland-generators/discussions)
  for community help
- **Bug reports**: File detailed bug reports on
  [GitHub Issues](https://github.com/alunduil/woodland-generators/issues)
- **Feature requests**: Ask for new features on
  [GitHub Issues](https://github.com/alunduil/woodland-generators/issues)
- **General Root RPG questions**: Check the
  [Leder Games Discord server](https://discord.gg/YDkRn9v47v) or other Root RPG
  forums

Please search existing issues and discussions before making new ones.

## License

You may copy, change, and share Woodland Generators with credit under the MIT
License. See the [LICENSE](LICENSE) file for details.

Root: The Tabletop RPG belongs to Leder Games.
