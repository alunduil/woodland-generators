# How a release happens

Woodland Generators releases one artifact: the Foundry module. This document
explains what merging a release pull request sets in motion and why the pipeline
is shaped the way it is. For the steps to withdraw a release that shipped
broken, see
[Roll back a released module version](../how-to/roll-back-a-released-module-version.md).

## One releasable package

`release-please-config.json` lists a single package, `packages/foundry-module`.
`core` and `random` stay workspace-internal. The module bundles their compiled
output, so neither carries a version anyone outside the repository can depend
on, and nothing publishes to npm. The module's `CHANGELOG.md` is the only
CHANGELOG release tooling writes.

## The release pull request

Every push to `main` runs the `Release` workflow. release-please reads the
conventional-commit subjects since the last release and keeps a pull request
open carrying the version bump and CHANGELOG entries those commits imply. That
pull request accumulates until someone merges it, so deciding to release is
deciding to merge.

Two settings govern the version arithmetic before 1.0. `bump-minor-pre-major`
turns a breaking change into a minor bump rather than a major one.
`bump-patch-for-minor-pre-major` stays false, so a `feat` commit still bumps the
minor version. [CONTRIBUTING](../../CONTRIBUTING.md#commit-messages) lists the
subjects that cut a release; commits of other types land without moving the
version.

Merging produces a single commit that writes the new version into the module's
`package.json` and, through the `extra-files` entry, into `module.json`. The
same commit updates `packages/foundry-module/CHANGELOG.md` and records the
version in `.release-please-manifest.json`, which is release-please's memory of
what it last released. release-please then tags that commit
`foundry-module@x.y.z`, taking the `@` from `tag-separator` and dropping the
conventional leading `v` because `include-v-in-tag` is false, and opens a GitHub
Release against the tag.

The workflow hands release-please a personal access token instead of the default
`GITHUB_TOKEN`. Tags and releases created with the default token don't trigger
further workflow runs, which would strand the release with nothing reacting to
it.

## Two assets, because Foundry installs from a URL

release-please opens the release empty. Foundry doesn't install from a
repository. A user pastes a manifest URL into the setup screen, Foundry fetches
that JSON, and Foundry installs the zip the JSON names. Both files have to hang
off the release for the URL to mean anything.

The `publish-module` job fills it in. The job checks out the tag, builds every
package, and runs `package-release.ts`, which writes `release/module.json` and
`release/module.zip` for the job to attach. Building the module alone would
yield a partial bundle, because esbuild resolves the sibling packages through
their `dist/`.

The zip's contents come from the `files` array in the module's `package.json`.
Foundry unpacks the archive straight into `Data/modules/woodland-generators`, so
every entry sits at the zip root rather than under a directory.

## The tag and the payload have to agree

`package-release.ts` derives the tag from the version in `module.json` and
checks it against the tag the workflow is releasing. A mismatch fails the job.
The check earns its place because the script runs on any checkout: a stale
working tree would otherwise produce a zip labelled with one version and
attached to the release of another.

## What the manifest URL promises

The `module.json` inside a release differs from the one checked into the
repository. The packaging script rewrites two fields. `manifest` becomes
`.../releases/latest/download/module.json`, and `download` becomes the zip
attached to this release's tag.

The two fields point at different things on purpose. `download` names one
release and never changes, so installing a given version stays reproducible.
`manifest` names whatever GitHub currently treats as the latest release, and
that URL is what every installed world polls when it checks for an update.

The latest-release pointer, not the newest tag, is therefore what existing
installs follow. Cutting a release publishes to every world that already has the
module. Moving that pointer is equally the lever for taking a release back,
which makes rollback a question of what GitHub calls latest rather than of
deleting anything.
