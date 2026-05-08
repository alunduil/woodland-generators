# AI agent notes

Audience: AI coding assistants. Humans use [CONTRIBUTING.md](CONTRIBUTING.md).

## Commits

Subjects must follow [Conventional Commits][conventional-commits]. The
`commit-msg` git hook (`compilerla/conventional-pre-commit`) rejects
non-conventional subjects at `git commit` time. `release-please` reads commit
prefixes to populate `CHANGELOG.md` and to bump the version on merge to
`master`, so a non-conventional subject drops out of the released CHANGELOG.

Type and scope rules with examples:
[CONTRIBUTING.md](CONTRIBUTING.md#commit-messages). The active type list lives
in `release-please-config.json`.

## Checks

`pre-commit run --all-files` gates every PR. The authoritative hook list lives
in `.pre-commit-config.yaml`; its header documents the install command (both
`pre-commit` and `commit-msg` stages).

## Releases

`release-please` opens a release PR from conventional commits, bumps the
version, regenerates the released sections of `CHANGELOG.md`, and tags the
release on merge. Don't hand-edit released sections; only the `[Unreleased]`
section above accepts manual entries.

[conventional-commits]: https://www.conventionalcommits.org/en/v1.0.0/
