# AI agent notes

Audience: AI coding assistants. Humans use [CONTRIBUTING.md](CONTRIBUTING.md).

## Project overview

A pnpm workspace of TypeScript packages for generating Root: The Tabletop RPG
resources.

- `packages/core` (`@woodland-generators/core`): the library implementing the
  generators. Public API exported from `src/index.ts`, compiled to `dist/`.
- `packages/foundry-module` (`@woodland-generators/foundry-module`): a Foundry
  VTT module shell that loads core into a live world; entry `src/module.ts`.
- `packages/random` (`@woodland-generators/random`): seeded randomness (`Rng`,
  `hashSeed`). `core` depends on it; it depends on nothing in the workspace.

`core` is a catch-all being split; `random` is the first carve-out. Give a new
foundational capability its own package and address it by its package name. Each
package exports what it owns.

A cross-package change needs `pnpm run build` before a type-check sees it.
Packages resolve each other through `dist/`, so `tsc --noEmit` against a stale
sibling reports a missing export rather than a real error.

No CLI binary is wired up at HEAD despite the `woodland-gen` framing in the
README: there is no `bin`, `cli.ts`, or `cli` script, so don't reach for
`pnpm run cli`.

## Common commands

Run `corepack enable` once, then:

- `pnpm run build`: build every package (`pnpm -r build`).
- `pnpm --filter @woodland-generators/core build:watch`: `tsc --watch` for
  incremental core development.
- `pnpm test`: Jest suite (root configuration runs the `core` project only).
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
  `actionlint`, `tombi` for TOML, Vale prose (`.vale.ini`, `.vale/`), `lychee`
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
the `pr-title.yml` workflow. `release-please` bumps the version from `feat`,
`fix`, `perf`, and `revert`; the other prefixes cut no release.

Type and scope rules with examples:
[CONTRIBUTING.md](CONTRIBUTING.md#commit-messages).

## Scope discipline

When working a numbered issue:

- Keep the change within that issue's scope; don't bleed into sibling or linked
  issues, and revert incidental out-of-scope edits before requesting review.
- If an issue depends on prerequisite work that hasn't shipped, propose deferral
  with a `blocked-by` edge instead of writing premature code.
- File unrelated problems found mid-task as separate issues by default.

## GitHub Actions

Name a workflow for when it runs and a job for what it produces:

- Workflow `name:` is the trigger or cadence (`CI`, `Daily`, `Weekly`,
  `Release`), and the filename is that name, kebab-cased. A single-purpose
  workflow may take its subject instead until a sibling joins it (`PR Title`).
- Job `name:` is a verb phrase naming the outcome, read in the checks list:
  `Check external links`, `Build every package`. Give the verb a concrete object
  rather than an article and an abstract noun (`Run the test suite`).
- Job `id:` is the kebab identifier `needs:` and reuse refer to
  (`external-links`). It need not match the name.

Branch protection matches the job `name:` alone as the status-check context, not
`Workflow / Job`, so job names must be unique repo-wide and legible standing
alone. A matrix emits one context per cell, so a matrix that must be required
gets a stable aggregator job to target instead: `ci.yml`'s `all-tests`.

Give a workflow its own file only when its `on:` differs. `permissions`,
`concurrency`, `env`, and `defaults` all scope per job, so set them on a job
inside an existing file.

Rationale and examples:
[CONTRIBUTING.md](CONTRIBUTING.md#workflow-and-job-names).

## Releases

[docs/explanation/releases.md](docs/explanation/releases.md) covers the
pipeline: what release-please tags, what the workflow attaches, and what the
manifest URL commits the project to.

Don't hand-edit released CHANGELOG sections. Root `CHANGELOG.md` is frozen as
historical record of the pre-workspace era; don't append to it.

[conventional-commits]: https://www.conventionalcommits.org/en/v1.0.0/
