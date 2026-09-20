# How to withdraw a broken release

Foundry only updates upward. It compares the version at the manifest URL against
the installed one and downloads when the manifest names a higher version.
Nothing tells a world that the version it holds was withdrawn. None of the steps
below reach a world that already updated. Publishing a higher version is what
reaches those; stopping the spread only buys time.

## Prerequisites

- A published release carrying a broken module.
- `gh` authenticated with write access to the repository.
- The SHA of the commit that introduced the breakage.

## Stop new installs

1. Name the release you're withdrawing:

   ```bash
   export BAD_RELEASE=foundry-module@0.4.1
   export LAST_GOOD_RELEASE=foundry-module@0.4.0
   ```

2. Mark it a prerelease:

   ```bash
   gh release edit "$BAD_RELEASE" --prerelease
   ```

3. Point Latest back at the previous release:

   ```bash
   gh release edit "$LAST_GOOD_RELEASE" --latest
   ```

4. Confirm the manifest URL serves the previous version:

   ```bash
   curl -sL https://github.com/alunduil/woodland-generators/releases/latest/download/module.json |
     jq -r .version
   ```

   New installs, and worlds that haven't taken the update yet, now get the
   previous version.

## Ship the fix

Only a higher version reaches a world already running the broken one.

1. Revert the commit without committing:

   ```bash
   git revert --no-commit <sha>
   ```

2. Commit with a conventional subject. The `Revert "..."` subject `git revert`
   writes on its own fails the `commit-msg` hook:

   ```bash
   git commit -m 'revert: <what the reverted commit did>'
   ```

3. Open a pull request and merge it into `main`.

4. Merge the release pull request release-please opens. Worlds pick the new
   version up on their next update check.

Cut a new version rather than reissuing the withdrawn one.
`.release-please-manifest.json` on `main` records the withdrawn number, and
release-please counts forward from there.

## Move one world back before the fix ships

Have the affected user uninstall the module, then install it from the previous
release's manifest asset, which pins its own download to that release:

```text
https://github.com/alunduil/woodland-generators/releases/download/foundry-module@0.4.0/module.json
```
