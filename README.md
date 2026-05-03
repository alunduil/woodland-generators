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

See the [Roadmap](#roadmap) for the remaining generators and export formats.
Each item there links to the milestone tracking it; none of them ship today.

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

## Roadmap

Current status: **Early Development**. The character generator with JSON output
is the only shipped capability. Everything below is planned but not yet
implemented; each item links to the milestone tracking it:

- [ ] [NPC generator (v1.1.0)](https://github.com/alunduil/woodland-generators/milestone/4)
- [ ] [Clearing generator (v1.2.0)](https://github.com/alunduil/woodland-generators/milestone/5)
- [ ] [Adventure plot generator (v1.3.0)](https://github.com/alunduil/woodland-generators/milestone/6)
- [ ] [Markdown export (v1.4.0)](https://github.com/alunduil/woodland-generators/milestone/7)
- [ ] [HTML export (v1.5.0)](https://github.com/alunduil/woodland-generators/milestone/8)
- [ ] [PDF export (v1.6.0)](https://github.com/alunduil/woodland-generators/milestone/9)
- [ ] [Custom settings (v1.7.0)](https://github.com/alunduil/woodland-generators/milestone/10)
- [ ] [Template system for custom generators (v1.8.0)](https://github.com/alunduil/woodland-generators/milestone/11)

See [Issues](https://github.com/alunduil/woodland-generators/issues) for
detailed feature tracking.

## License

You may copy, change, and share Woodland Generators with credit under the MIT
License. See the [LICENSE](LICENSE) file for details.

Root: The Tabletop RPG belongs to Leder Games.
