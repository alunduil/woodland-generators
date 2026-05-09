# AI agent notes

Audience: AI coding assistants. Humans use [CONTRIBUTING.md](CONTRIBUTING.md).

## Project overview

A pnpm monorepo of TypeScript packages for generating Root: The Tabletop RPG
resources. `packages/core/` holds the shared generator algorithms; the
FoundryVTT module that consumes them is the headline surface.

## Common commands

The repository runs as a pnpm workspace (`packageManager` pins the version);
activate with `corepack enable` once. Commands:

- `pnpm -r build`: build every package.
- `pnpm -r test`: run the Jest suite across packages.
- `pre-commit run --all-files`: gates every PR. Authoritative hook list:
  `.pre-commit-config.yaml`.

## Tests

Test files mirror the module under test: tests for `src/foo/bar.ts` live at
`test/foo/bar.test.ts`. Don't split tests by feature or scenario.

## Commits

Subjects must follow [Conventional Commits][conventional-commits]. The
`commit-msg` git hook (`compilerla/conventional-pre-commit`) rejects
non-conventional subjects at `git commit` time. `release-please` reads commit
prefixes to populate `CHANGELOG.md` and to bump the version on merge to
`master`, so a non-conventional subject drops out of the released CHANGELOG.

Type and scope rules with examples:
[CONTRIBUTING.md](CONTRIBUTING.md#commit-messages). The active type list lives
in `release-please-config.json`.

## Releases

`release-please` opens a release PR from conventional commits, bumps the
version, regenerates the released sections of `CHANGELOG.md`, and tags the
release on merge. Don't hand-edit released sections. Only the `[Unreleased]`
block accepts manual entries.

[conventional-commits]: https://www.conventionalcommits.org/en/v1.0.0/
