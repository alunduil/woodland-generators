# AI agent notes

Audience: AI coding assistants. Humans use [CONTRIBUTING.md](CONTRIBUTING.md).

## Project overview

A TypeScript CLI (`woodland-gen`) for generating Root: The Tabletop RPG
resources. Source in `src/`, compiled output in `dist/`. Entry points:
`src/cli.ts` (CLI binary) and `src/index.ts` (library export).

## Common commands

- `npm run cli -- <args>`: build and run the CLI (for example,
  `npm run cli -- character --help`).
- `npm run build:watch`: `tsc` in watch mode for incremental development.
- `npm test`: Jest suite.
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
