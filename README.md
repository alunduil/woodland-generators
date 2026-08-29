# Woodland Generators

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![codecov](https://codecov.io/github/alunduil/woodland-generators/graph/badge.svg?token=WR4ZQLMJMB)](https://codecov.io/github/alunduil/woodland-generators)

Generators for Root: The Tabletop RPG.

**By [Alex Brandt](https://github.com/alunduil)**

## What this project is

A pnpm workspace of two TypeScript packages:

- **`@woodland-generators/core`**: seeded generator functions for Root
  characters, covering name, species, details, and demeanor.
- **`@woodland-generators/foundry-module`**: a Foundry VTT module shell. It
  loads into a world and logs a startup message; nothing wires it to core.

Track progress on the
[milestones page](https://github.com/alunduil/woodland-generators/milestones).

## Installation

Neither package is published, so the workspace runs from a clone.

You need:

- Node.js 22.13.0 or later
- pnpm, provisioned by `corepack enable` from the `packageManager` pin

Then:

1. Follow [CONTRIBUTING.md](CONTRIBUTING.md) to install dependencies and build
   the workspace.
2. [Install the Foundry module into a local Foundry](docs/how-to/install-the-foundry-module-into-a-local-foundry.md)
   to load it into a world.

## Contributing

Help welcome! You can help by:

- Reporting bugs or asking for features in GitHub Issues
- Adding code via pull requests
- Making docs better
- Testing the tool and giving feedback
- Sharing the project with other Root RPG fans

For setup help and detailed guides, see [CONTRIBUTING.md](CONTRIBUTING.md).

## Documentation

- **README.md** (this file): Project overview and setup
- **[CONTRIBUTING.md](CONTRIBUTING.md)**: Setup help and guide for helpers
- **[CHANGELOG.md](CHANGELOG.md)**: Project history and version changes
- **[LICENSE](LICENSE)**: MIT License terms
- **docs/**: Extra docs for helpers and maintainers

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
