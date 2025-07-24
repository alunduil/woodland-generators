# Contributing to Woodland Generators

Thank you for your interest in contributing! This CLI tool generates resources
for Root: The Tabletop RPG.

These guidelines help maintainers review your work. Following them shows respect
for their time.

## What you can contribute

The project welcomes help that improves the tool's usefulness for Root RPG
players:

- **New generators** (NPCs, settlements, adventures)
- **Output format improvements** (better PDF files, new formats)
- **Bug fixes** and **performance improvements**
- **Doc updates** and **examples**

## Ground rules

- **TypeScript with strict typing** - Type safety stays important
- **Run checks** before submitting: `npm run check:all`
- **Test your changes** with `npm run cli`
- **Keep PRs focused** - one feature or fix per PR
- **Stay patient** - reviews may take a few days

## Quick start

1. **Install dependencies**:

   ```bash
   npm install
   ```

2. **Test the CLI**:

   ```bash
   npm run cli -- character --help
   ```

3. **Development workflow**:

   ```bash
   npm run build:watch    # Watch mode dev
   npm run check:all      # Check everything
   npm run fix:lint       # Auto-fix code issues
   npm run fix:format     # Auto-format code
   ```

## How to submit changes

### For big changes

1. **Open an issue first** to discuss the approach
2. Fork the repository and create a feature branch
3. Make your changes following the code standards
4. Run `npm run check:all` to check everything works
5. Submit a pull request with a clear description

### For small fixes (typos, formatting)

- Feel free to submit directly without opening an issue first

## How to report bugs or suggest features

- **Bugs**: Use the [bug report template][bug-template] and include what command
  you ran, what you expected, what happened, and your OS/Node.js version
- **Feature ideas**: Use the [feature request template][feature-template] and
  tell what you want to build, why users need it, and how it works
- **Questions and chat**: Use [GitHub Discussions][discussions] for general
  questions, ideas, or community chat

## Code review process

- The project team reviews PRs on a regular basis, typically within a week
- Reviewers provide feedback through GitHub review comments
- Maintainers may request changes before merging
- Once approved, maintainers will merge your PR

[bug-template]:
  https://github.com/alunduil/woodland-generators/issues/new?template=bug_report.yml
[feature-template]:
  https://github.com/alunduil/woodland-generators/issues/new?template=feature_request.yml
[discussions]: https://github.com/alunduil/woodland-generators/discussions
