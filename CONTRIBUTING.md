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
- **Use pnpm** - the repository runs as a pnpm workspace; npm and yarn won't
  produce a working install. Run `corepack enable` once on Node 20 or newer; the
  pinned pnpm version comes from `package.json#packageManager`.
- **Run checks** before submitting: `pre-commit run --all-files`
- **Test your changes** with `pnpm run cli`
- **Keep PRs focused** - one feature or fix per PR
- **Stay patient** - reviews may take a few days

## Commit messages

This repository follows [Conventional Commits][conventional-commits]. Commit
prefixes drive the automated `CHANGELOG.md` entries and version bumps managed by
[release-please][release-please].

Common prefixes:

- `feat:` - new user-facing feature (minor version bump)
- `fix:` - bug fix (patch version bump)
- `docs:` - documentation only
- `refactor:` - code change that neither fixes a bug nor adds a feature
- `perf:` - performance improvement
- `chore:` - tooling, build, or maintenance work

Append `!` after the type (for example, `feat!:`) or include a
`BREAKING CHANGE:` footer for changes that bump the major version (or minor,
while pre-1.0).

Examples:

```text
feat: add character demeanor generation
fix(cli): respect --seed flag in name generation
chore(deps): bump typescript to 5.9.3
```

## Quick start

1. **Install dependencies**:

   ```bash
   corepack enable
   pnpm install
   ```

2. **Test the CLI**:

   ```bash
   pnpm run cli -- character --help
   ```

3. **Development workflow**:

   ```bash
   pnpm run build:watch         # Watch mode dev
   pre-commit run --all-files   # Check everything (auto-fixes)
   ```

## How to submit changes

### For big changes

1. **Open an issue first** to discuss the approach
2. Fork the repository and create a feature branch
3. Make your changes following the code standards
4. Run `pre-commit run --all-files` to check everything works
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
[conventional-commits]: https://www.conventionalcommits.org/en/v1.0.0/
[discussions]: https://github.com/alunduil/woodland-generators/discussions
[feature-template]:
  https://github.com/alunduil/woodland-generators/issues/new?template=feature_request.yml
[release-please]: https://github.com/googleapis/release-please
