# AI agent notes

Audience: AI coding assistants. Read [CONTRIBUTING.md](CONTRIBUTING.md) first;
this file adds only what an agent needs beyond it.

Every agent reads this file. A tool that ignores `AGENTS.md` gets its own file
that imports this one and holds only rules specific to that tool.
[CLAUDE.md](CLAUDE.md) is that file for Claude Code.

## Module constraints

Bundled code can't import the character generators: they import `src/logging`,
which runs only under Node.

The README's `woodland-gen` CLI doesn't exist. There's no `bin`, `cli.ts`, or
`cli` script, so `pnpm run cli` fails.

## Tools

Use the tools pinned in `mise.toml` and `.pre-commit-config.yaml` over `curl`,
manual API calls, or one-off scripts.

## Tests

- Name a non-test file under `test/` for what it holds, never `support/`,
  `utils/`, or `helpers/`.
- Extend the `game` and `Hooks` stubs in
  `packages/foundry-module/test/foundry-globals.ts` rather than stubbing inside
  a suite.
- Type a narrowed `game` parameter as `InitGame`, `I18nInitGame`, `SetupGame`,
  or `ReadyGame` from fvtt-types, matching the lifecycle hook that has run. The
  type removes a guard the tests would otherwise cover.

## Commits

To add or change a commit type, edit `changelog-sections` in
`release-please-config.json`. The `commit-msg` hook and the `PR Title` check
both read their types from it.

## Scope discipline

When working a numbered issue:

- Keep the change within that issue's scope. Revert incidental edits outside it
  before requesting review.
- If the issue depends on work that hasn't merged, propose deferral with a
  `blocked-by` edge instead of writing the code.
- File unrelated problems found mid-task as separate issues.

## CHANGELOG

Don't hand-edit released CHANGELOG sections. Root `CHANGELOG.md` holds only
pre-workspace releases; don't append to it.
