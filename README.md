# Woodland Generators

![FoundryVTT v10+](https://img.shields.io/badge/FoundryVTT-v10+-informational)
[![GitHub release](https://img.shields.io/github/release/alunduil/woodland-generators)](https://github.com/alunduil/woodland-generators/releases)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A FoundryVTT module that provides random generators for characters, NPCs, and
clearings specifically designed for Root: The RPG.

## Table of contents

- [Woodland Generators](#woodland-generators)
  - [Table of contents](#table-of-contents)
  - [What this module does](#what-this-module-does)
  - [Installation](#installation)
    - [Method 1: FoundryVTT module browser (recommended)](#method-1-foundryvtt-module-browser-recommended)
    - [Method 2: Manual installation](#method-2-manual-installation)
    - [Method 3: Direct download](#method-3-direct-download)
  - [System requirements](#system-requirements)
  - [Usage](#usage)
  - [Contributing](#contributing)
  - [Support](#support)
  - [Roadmap](#roadmap)
  - [License](#license)
  - [Acknowledgments](#acknowledgments)
  - [CHANGELOG](#changelog)

## What this module does

Woodland Generators enhances your Root: The RPG sessions by providing:

- **Character Generator**: Create randomized woodland animal characters with
  traits, drives, and backgrounds
- **NPC Generator**: Generate non-player characters for your woodland adventures
- **Clearing Generator**: Create diverse clearings with unique features,
  inhabitants, and conflicts

Perfect for GMs who want to populate their woodland with interesting characters
and locations, or for players seeking inspiration for character creation.

## Installation

### Method 1: FoundryVTT module browser (recommended)

1. Open FoundryVTT and navigate to the "Add-on Modules" tab
2. Click "Install Module"
3. Search for "Woodland Generators"
4. Click "Install" next to the module

### Method 2: Manual installation

1. Copy this manifest URL:
   `https://github.com/alunduil/woodland-generators/releases/latest/download/module.json`
2. In FoundryVTT, go to "Add-on Modules" → "Install Module"
3. Paste the URL in the "Manifest URL" field
4. Click "Install"

### Method 3: Direct download

1. Download the latest release from
   [GitHub Releases](https://github.com/alunduil/woodland-generators/releases)
2. Extract the zip file to your FoundryVTT modules directory
3. Restart FoundryVTT

## System requirements

- **FoundryVTT**: Version 10 or higher
- **Game System**: Root: The RPG
- **Dependencies**: PbtA System (v0.9.0+)

## Usage

After installation and activation:

1. The module will automatically integrate with your Root: The RPG game
2. Access generators through the module's interface (specific UI details coming
   soon)
3. Generated content works with Root: The RPG character sheets and mechanics

_Note: The development team will add detailed usage instructions as features get
implemented._

## Contributing

This project welcomes contributions! It uses TypeScript, modern development
practices, and automated testing workflows.

### Quick start for contributors

```bash
# Install dependencies
npm install

# Build the module
npm run build

# Run tests and validation
npm run validate
```

### Testing your changes

Create a pull request - the automated workflow will provide testing instructions
and URLs to test your changes directly in FoundryVTT.

### Complete development guide

For detailed setup, development practices, code quality standards, and
contribution workflows, see the [Contributing Guide](CONTRIBUTING.md) and
[documentation](docs/).

## Support

- **Issues**: Report bugs or request features on
  [GitHub Issues](https://github.com/alunduil/woodland-generators/issues)
- **Discussions**: Ask questions in
  [GitHub Discussions](https://github.com/alunduil/woodland-generators/discussions)
- **Discord**: Contact `alunduil` on the FoundryVTT Discord server

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

This project uses the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built using the
  [League of Extraordinary FoundryVTT Developers](https://github.com/League-of-Foundry-Developers)
  module template
- Inspired by the rich world and mechanics of Root: The RPG by Leder Games
- Thanks to the FoundryVTT community for their development resources and support

## CHANGELOG

See [CHANGELOG.md](CHANGELOG.md) for a detailed history of changes and releases.
