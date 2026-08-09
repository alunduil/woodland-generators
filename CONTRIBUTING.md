# Contributing to Woodland Generators

Thank you for your interest in contributing! Woodland Generators is a pnpm
workspace of TypeScript packages that generate resources for Root: The Tabletop
RPG.

These guidelines help get your work reviewed quickly.

## What you can contribute

The project welcomes help that improves the tool's usefulness for Root RPG
players:

- **New generators** (NPCs, clearings, adventures)
- **Foundry VTT integration** - surfacing generators inside a live world
- **Bug fixes** and **performance improvements**
- **Doc updates** and **examples**

## Your first contribution

Start with an issue labeled [good first issue][good-first-issue] or [help
wanted][help-wanted]. Both filters list work that's ready to pick up without
deep context on the codebase.

Typos and formatting fixes need no issue at all - see
[small fixes](#for-small-fixes-typos-formatting).

## Project layout

Two packages live under `packages/`:

- **`@woodland-generators/core`** - the generator algorithms. No user interface,
  no input or output beyond logging. Most generator work lands here.
- **`@woodland-generators/foundry-module`** - a Foundry VTT module that loads
  core into a live world.

Repository-wide docs sit in `docs/`, organized by
[Diátaxis](https://diataxis.fr): how-to guides in `docs/how-to/`, architecture
decisions in `docs/adr/`.

## Ground rules

- **Use pnpm** - the repository runs as a pnpm workspace; npm and yarn won't
  produce a working install. Run `corepack enable` once on Node 20 or newer; the
  pinned pnpm version comes from `package.json#packageManager`.
- **Keep strict typing** - `tsc --noEmit` runs as a check and has to pass
- **Run the checks** before submitting - see [Checks](#checks) below
- **Keep PRs focused** - one feature or fix per PR

## Quick start

1. **Install dependencies**:

   ```bash
   corepack enable
   pnpm install
   ```

2. **Build both packages**:

   ```bash
   pnpm run build
   ```

3. **Run the test suite**:

   ```bash
   pnpm test
   ```

4. **Development workflow** - rebuild and retest as you edit:

   ```bash
   pnpm --filter @woodland-generators/core build:watch
   pnpm run test:watch
   ```

The repository also ships a [devcontainer](.devcontainer/devcontainer.json) with
Node, pnpm, `pre-commit`, `shellcheck`, and Vale preinstalled. Open the
repository in a supporting editor to skip the local tool setup.

## Checks

Run both before submitting. `pre-commit` doesn't run the tests:

```bash
pre-commit run --all-files   # formatting, lint, types, prose, links
pnpm test                    # Jest suite
```

Many hooks fix files in place, so re-stage anything they touch. The full hook
list lives in `.pre-commit-config.yaml`.

## Tests

Test files mirror the module under test within each package. Tests for
`packages/core/src/generators/name.ts` belong at
`packages/core/test/generators/name.test.ts`. Don't split tests by feature or
scenario.

## Commit messages

This repository follows [Conventional Commits][conventional-commits]. The
`commit-msg` git hook and the `PR Title` GitHub Actions check both enforce
conventional subjects.

Common prefixes:

- `feat:` - new user-facing feature
- `fix:` - bug fix
- `docs:` - documentation only
- `refactor:` - code change that neither fixes a bug nor adds a feature
- `perf:` - performance improvement
- `chore:` - tooling, build, or maintenance work

Append `!` after the type (for example, `feat!:`) or include a
`BREAKING CHANGE:` footer to mark a breaking change.

Examples:

```text
feat: add character demeanor generation
fix(core): respect the seed argument in name generation
chore(deps): bump typescript to 5.9.3
```

## How to submit changes

### For big changes

1. **Open an issue first** to discuss the approach
2. Fork the repository and create a feature branch
3. Make your changes following the code standards
4. Run the [checks](#checks)
5. Submit a pull request with a clear description

### For small fixes (typos, formatting)

- Feel free to submit directly without opening an issue first

## Architecture decisions

Changes that set technical direction get an Architecture Decision Record in
`docs/adr/`. [ADR-0000](docs/adr/0000-record-architecture-decisions.md) explains
the convention and doubles as the template. The `validate-adrs` hook checks
filename pattern, sequential numbering, the required Nygard sections, and the
allowed status values.

## Working on the Foundry module

Two how-to guides cover the module development loop:

- [Install the module into a local Foundry][foundry-install] - link the built
  bundle into your own Foundry user data directory and iterate on it.
- [Verify with Docker Compose][foundry-docker] - for contributors without a
  Foundry install on the host.

## How to report bugs or suggest features

- **Bugs**: Use the [bug report template][bug-template] and include the steps to
  reproduce, what you expected, what happened, and your environment
- **Feature ideas**: Use the [feature request template][feature-template] and
  tell what you want to accomplish, what you do today, and how it should work
- **Planned work**: Maintainers use the [work item template][work-item-template]
  for work that's broken down and ready to implement
- **Questions and chat**: Use GitHub Discussions - [Q&A][discussions-qa] for
  help requests, [Ideas][discussions-ideas] to float a feature before filing a
  request, and [General][discussions-general] for anything else

## Code review process

Woodland Generators has one maintainer, so expect a review within about a week.
Feedback arrives as GitHub review comments and may ask for changes. The
maintainer merges the PR once it's approved.

[bug-template]:
  https://github.com/alunduil/woodland-generators/issues/new?template=bug-report.yml
[conventional-commits]: https://www.conventionalcommits.org/en/v1.0.0/
[discussions-general]:
  https://github.com/alunduil/woodland-generators/discussions/categories/general
[discussions-ideas]:
  https://github.com/alunduil/woodland-generators/discussions/categories/ideas
[discussions-qa]:
  https://github.com/alunduil/woodland-generators/discussions/categories/q-a
[feature-template]:
  https://github.com/alunduil/woodland-generators/issues/new?template=feature-request.yml
[foundry-docker]: docs/how-to/verify-foundry-module-with-docker-compose.md
[foundry-install]:
  docs/how-to/install-the-foundry-module-into-a-local-foundry.md
[good-first-issue]:
  https://github.com/alunduil/woodland-generators/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22
[help-wanted]:
  https://github.com/alunduil/woodland-generators/issues?q=is%3Aissue+is%3Aopen+label%3A%22help+wanted%22
[work-item-template]:
  https://github.com/alunduil/woodland-generators/issues/new?template=work-item.yml
