# Woodland Generators

![FoundryVTT v10+](https://img.shields.io/badge/FoundryVTT-v10+-informational)
[![GitHub release](https://img.shields.io/github/release/alunduil/woodland-generators)](https://github.com/alunduil/woodland-generators/releases)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A FoundryVTT module that provides random generators for characters, NPCs, and
clearings specifically designed for Root: The RPG.

## Table of Contents

- [Woodland Generators](#woodland-generators)
  - [Table of Contents](#table-of-contents)
  - [What does this module do?](#what-does-this-module-do)
  - [Installation](#installation)
    - [Method 1: FoundryVTT Module Browser (Recommended)](#method-1-foundryvtt-module-browser-recommended)
    - [Method 2: Manual Installation](#method-2-manual-installation)
    - [Method 3: Direct Download](#method-3-direct-download)
  - [System Requirements](#system-requirements)
  - [Usage](#usage)
  - [Development](#development)
  - [Code Quality](#code-quality)
  - [Contributing](#contributing)
  - [Support](#support)
  - [Roadmap](#roadmap)
  - [License](#license)
  - [Acknowledgments](#acknowledgments)
  - [Changelog](#changelog)

## What does this module do?

Woodland Generators enhances your Root: The RPG sessions by providing:

- **Character Generator**: Create randomized woodland animal characters with
  traits, drives, and backgrounds
- **NPC Generator**: Generate non-player characters for your woodland adventures
- **Clearing Generator**: Create diverse clearings with unique features,
  inhabitants, and conflicts

Perfect for Game Masters who want to quickly populate their woodland with
interesting characters and locations, or for players seeking inspiration for
character creation.

## Installation

### Method 1: FoundryVTT Module Browser (Recommended)

1. Open FoundryVTT and navigate to the "Add-on Modules" tab
2. Click "Install Module"
3. Search for "Woodland Generators"
4. Click "Install" next to the module

### Method 2: Manual Installation

1. Copy this manifest URL:
   `https://github.com/alunduil/woodland-generators/releases/latest/download/module.json`
2. In FoundryVTT, go to "Add-on Modules" → "Install Module"
3. Paste the URL in the "Manifest URL" field
4. Click "Install"

### Method 3: Direct Download

1. Download the latest release from
   [GitHub Releases](https://github.com/alunduil/woodland-generators/releases)
2. Extract the zip file to your FoundryVTT modules directory
3. Restart FoundryVTT

## System Requirements

- **FoundryVTT**: Version 10 or higher (tested up to v11)
- **Game System**: Root: The RPG
- **Dependencies**: PbtA System (v0.9.0+)

## Usage

After installation and activation:

1. The module will automatically integrate with your Root: The RPG game
2. Access generators through the module's interface (specific UI details coming
   soon)
3. Generated content will be compatible with Root: The RPG character sheets and
   mechanics

_Note: Detailed usage instructions will be added as features are implemented._

## Development

This project uses TypeScript and modern development practices:

```bash
# Install dependencies
npm install

# Build the module
npm run build

# Run in watch mode during development
npm run build:watch

# Run tests
npm test

# Validate everything (formatting, linting, building, testing)
npm run validate
```

## Code Quality

This project uses pre-commit hooks to maintain code quality. They are
automatically installed in the dev container. To install manually:
`npm run pre-commit:install`. See [pre-commit.com](https://pre-commit.com/) for
more information.

For detailed development information, see the [documentation](docs/), which
includes:

- **How-to guides**: Step-by-step instructions for creating releases and
  submitting to the FoundryVTT package repository
- **Development practices**: TypeScript setup, testing approach, and code
  quality tools

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add or update tests as needed
5. Ensure all checks pass with `npm run validate`
6. Submit a pull request

See [CONTRIBUTING.md](CONTRIBUTING.md) if available, or open an issue to discuss
proposed changes.

## Support

- **Issues**: Report bugs or request features on
  [GitHub Issues](https://github.com/alunduil/woodland-generators/issues)
- **Discussions**: Ask questions in
  [GitHub Discussions](https://github.com/alunduil/woodland-generators/discussions)
- **Discord**: Find me as `alunduil` on the FoundryVTT Discord server

## Roadmap

Current development status: **Early Development**

Planned features:

- [ ] Character generator with Root-specific traits
- [ ] NPC generator with faction affiliations
- [ ] Clearing generator with Root-appropriate conflicts
- [ ] Integration with Root: The RPG character sheets
- [ ] Customizable generation parameters
- [ ] Export functionality for generated content

See [Issues](https://github.com/alunduil/woodland-generators/issues) for
detailed feature tracking.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file
for details.

## Acknowledgments

- Built using the
  [League of Extraordinary FoundryVTT Developers](https://github.com/League-of-Foundry-Developers)
  module template
- Inspired by the rich world and mechanics of Root: The RPG by Leder Games
- Thanks to the FoundryVTT community for their development resources and support

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for a detailed history of changes and releases.
