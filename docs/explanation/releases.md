# How a release happens

Woodland Generators releases one artifact: the Foundry module. Merging the
release pull request does the rest. This covers what that merge sets off and
why. For a release that shipped broken, see
[Withdraw a broken release](../how-to/withdraw-a-broken-release.md).

## One releasable package

`release-please-config.json` lists one package, `packages/foundry-module`.
`core` and `random` stay workspace-internal. The module bundles their compiled
output, so neither needs a version of its own, and nothing publishes to npm.

## The release pull request

Every push to `main` runs the `Release` workflow. release-please reads the
commit subjects since the last release and keeps a pull request open with the
bump they imply. It accumulates until someone merges it. No other action cuts a
release.

Before 1.0 the arithmetic is compressed: a breaking change bumps the minor
version, and so does a `feat`.
[CONTRIBUTING](../../CONTRIBUTING.md#commit-messages) lists which subjects cut a
release at all.

Merging produces one commit. That commit:

- writes the new version into `package.json`, and into `module.json` through the
  `extra-files` entry
- updates `packages/foundry-module/CHANGELOG.md`
- records the version in `.release-please-manifest.json`, release-please's
  memory of what it last released

release-please then tags the commit `foundry-module@x.y.z` and opens a GitHub
Release against it.

The workflow gives release-please a personal access token rather than the
default `GITHUB_TOKEN`. Tags and releases created with the default token trigger
no further workflow runs, which would leave the release with nothing to fill it.

## Two assets, because Foundry installs from a URL

release-please opens the release empty. Foundry installs from a manifest URL
rather than from a repository: it fetches that JSON, then downloads the zip the
JSON names. Both files have to hang off the release.

The `publish-module` job attaches them. It builds every package before running
`package-release.ts`, because esbuild resolves the sibling packages through
their `dist/`. The zip's contents come from the `files` array in `package.json`,
flattened to the zip root, because Foundry unpacks the archive straight into
`Data/modules/woodland-generators`.

## The tag and the payload have to agree

`package-release.ts` checks the version in `module.json` against the tag being
released and fails the job on a mismatch. The script runs on any checkout, so
without that check a stale working tree could ship a zip labelled with the wrong
version.

## Checked where Foundry reads it

Both checks so far run against a working tree. The `verify-release` job runs
against the published release instead, reading it the way a world does: it
fetches the manifest at the latest-release URL, downloads the zip that manifest
names, unpacks it, and fails when the two disagree or when a file the manifest
declares is absent.

The release is already published by the time it runs, so a red run is a signal
to [withdraw](../how-to/withdraw-a-broken-release.md), not a gate that held
anything back. Loading the module in a world stays manual, because Foundry needs
a license:
[Verify a published release installs](../how-to/verify-a-published-release-installs.md).

## What the manifest URL promises

The `module.json` inside a release isn't the one in the repository. The
packaging script rewrites two fields:

- `download` names this release's zip. It never changes, so any given version
  stays installable.
- `manifest` names `releases/latest/download/module.json`. Every installed world
  polls it for updates.

Installs therefore follow the latest-release pointer, not the newest tag.
Cutting a release publishes to every world that already has the module.

Moving the pointer back doesn't retract anything, because Foundry only updates
upward. It offers an update when the manifest names a higher version than the
installed one, and it has no notion of a version being withdrawn. A world that
took a bad version keeps it until a higher one ships.
