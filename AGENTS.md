# AI agent notes

Audience: AI coding assistants. Humans use [CONTRIBUTING.md](CONTRIBUTING.md),
and so do you: read it first. This file adds only what an agent needs beyond it.

This file holds the notes for every agent. A tool that reads `AGENTS.md` needs
no file of its own. A tool that reads only its own path gets a file that imports
or points at this one and adds only what's true of that tool alone:
[CLAUDE.md](CLAUDE.md) is that file for Claude Code. A rule holding for more
than one tool belongs here.

## Project overview

[CONTRIBUTING.md](CONTRIBUTING.md#project-layout) covers the layout and where
new code goes. The package is `@woodland-generators/foundry-module`, and its
entry is `src/module.ts`.

`src/logging` is Node-only: it runs `pino` through a worker transport and reads
`__dirname` at import. The character generators import it, so bundled code can't
import them.

No CLI binary is wired up at HEAD despite the `woodland-gen` framing in the
README: there is no `bin`, `cli.ts`, or `cli` script, so don't reach for
`pnpm run cli`.

## Commands

[Quick start](CONTRIBUTING.md#quick-start) and [Checks](CONTRIBUTING.md#checks)
list the build, test, and check commands. The authoritative hook list is
`.pre-commit-config.yaml`.

## Tooling inventory

Prefer these over `curl`, manual API calls, or first-principles scripts.
Configuration file shown in parentheses.

- Package manager: pnpm, pinned in `packageManager` and `mise.toml`
  (`pnpm-workspace.yaml`); `corepack enable` or `mise install` once.
- Pinned CLI tools: mise (`mise.toml`, `mise.lock`).
- Test / coverage: Jest (`jest.config.json`,
  `packages/foundry-module/jest.config.json`); coverage configuration
  `codecov.yml`.
- Lint / format, all via `pre-commit` (`.pre-commit-config.yaml`): `eslint`
  (`eslint.config.cjs`), `prettier` (`.prettierrc`), `stylelint`
  (`.stylelintrc.json`), `markdownlint` (`.markdownlint.yaml`), `yamllint`
  (`.yamllint.yaml`), `shellcheck`, `actionlint`, `tombi` for TOML, Vale prose
  (`.vale.ini`, `.vale/`), `lychee` link check (`lychee.toml`), `depcheck`
  (`.depcheckrc.json`), `reuse` licensing, `tsc` type-checking, and
  workspace/ADR validation (`scripts/`).
- Development environment: `.devcontainer/`.
- Dependency updates: Renovate (`renovate.json`); locally
  `pnpm run check:outdated` and `pnpm run update:deps`.

## Tests

[CONTRIBUTING.md](CONTRIBUTING.md#tests) sets where tests live and how they
reach Foundry's globals. The specifics:

- A file under `test/` that isn't a test doesn't go in a `support/`, `utils/`,
  or `helpers/` bucket.
- The `foundry` global comes from
  `packages/foundry-module/test/setup/foundry.ts`. The `game` and `Hooks` stubs
  to extend live in `packages/foundry-module/test/foundry-globals.ts`.
- To name the narrowed `game` a function takes, use the type fvtt-types ships
  for the lifecycle point reached: `InitGame`, `I18nInitGame`, `SetupGame`, or
  `ReadyGame`. Naming it removes a guard the tests would otherwise have to
  cover.
- #657 converts the manual scenarios to Playwright specs.

## Commits

[CONTRIBUTING.md](CONTRIBUTING.md#commit-messages) sets the types, scopes, and
what counts as breaking. The `commit-msg` hook
(`compilerla/conventional-pre-commit`) and the `PR Title` workflow both read
their types from `changelog-sections` in `release-please-config.json`.
`release-please` bumps the version only for types `changelog-sections` doesn't
mark `hidden`.

## Scope discipline

When working a numbered issue:

- Keep the change within that issue's scope; don't bleed into sibling or linked
  issues, and revert incidental out-of-scope edits before requesting review.
- If an issue depends on prerequisite work that hasn't shipped, propose deferral
  with a `blocked-by` edge instead of writing premature code.
- File unrelated problems found mid-task as separate issues by default.

## GitHub Actions

Name workflows and jobs by
[Workflow and job names](CONTRIBUTING.md#workflow-and-job-names).

## Releases

[docs/explanation/releases.md](docs/explanation/releases.md) covers the release
pipeline and what the manifest URL commits the project to.

Don't hand-edit released CHANGELOG sections. Root `CHANGELOG.md` is frozen as
historical record of the pre-workspace era; don't append to it.
