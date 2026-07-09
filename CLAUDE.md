# AI agent notes

Audience: AI coding assistants. Humans use [CONTRIBUTING.md](CONTRIBUTING.md).

## Project overview

A pnpm workspace of TypeScript packages for generating Root: The Tabletop RPG
resources.

- `packages/core` (`@woodland-generators/core`): the library implementing the
  generators. Public API exported from `src/index.ts`, compiled to `dist/`.
- `packages/foundry-module` (`@woodland-generators/foundry-module`): a Foundry
  VTT module shell that loads core into a live world; entry `src/module.ts`.

No CLI binary is wired up at HEAD despite the `woodland-gen` framing in the
README: there is no `bin`, `cli.ts`, or `cli` script, so don't reach for
`pnpm run cli`.

## Common commands

Run `corepack enable` once, then:

- `pnpm run build`: build every package (`pnpm -r build`).
- `pnpm --filter @woodland-generators/core build:watch`: `tsc --watch` for
  incremental core development.
- `pnpm test`: Jest suite (root configuration runs the `core` project only).
- `pnpm run bench`: benchmark suite.
- `pre-commit run --all-files`: gates every PR. Authoritative hook list:
  `.pre-commit-config.yaml`.

## Tooling inventory

Prefer these over `curl`, manual API calls, or first-principles scripts.
Configuration file shown in parentheses.

- Package manager: pnpm, workspace pinned via `packageManager`
  (`pnpm-workspace.yaml`); `corepack enable` once.
- Test / coverage: Jest (`jest.config.json`, per-package
  `packages/*/jest.config.json`); coverage configuration `codecov.yml`.
- Lint / format, all via `pre-commit` (`.pre-commit-config.yaml`): `eslint`
  (`eslint.config.cjs`), `prettier` (`.prettierrc`), `markdownlint`
  (`.markdownlint.json`), `yamllint` (`.yamllint.yaml`), `shellcheck`,
  `actionlint`, `taplo` for TOML, Vale prose (`.vale.ini`, `.vale/`), `lychee`
  link check (`lychee.toml`), `depcheck` (`.depcheckrc.json`), `reuse`
  licensing, `tsc` type-checking, and workspace/ADR validation (`scripts/`).
- Development environment: `.devcontainer/`.
- Dependency updates: Renovate (`renovate.json`); locally
  `pnpm run check:outdated` and `pnpm run update:deps`.

## Tests

Test files mirror the module under test within each package: tests for
`packages/core/src/foo/bar.ts` live at `packages/core/test/foo/bar.test.ts`.
Don't split tests by feature or scenario.

## Commits

Subjects must follow [Conventional Commits][conventional-commits]. The
`commit-msg` git hook (`compilerla/conventional-pre-commit`) rejects
non-conventional subjects at `git commit` time. The active type list lives in
the `pr-title.yml` workflow.

Type and scope rules with examples:
[CONTRIBUTING.md](CONTRIBUTING.md#commit-messages).

## Scope discipline

When working a numbered issue:

- Keep the change within that issue's scope; don't bleed into sibling or linked
  issues, and revert incidental out-of-scope edits before requesting review.
- If an issue depends on prerequisite work that hasn't shipped, propose deferral
  with a `blocked-by` edge instead of writing premature code.
- File unrelated problems found mid-task as separate issues by default.

## Releases

No automated release tooling is wired up right now. Both packages sit at `0.0.0`
and nothing publishes from `master`. `CHANGELOG.md` is frozen as historical
record of the pre-workspace era; don't append to it until a release process
returns.

[conventional-commits]: https://www.conventionalcommits.org/en/v1.0.0/
