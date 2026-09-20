# How to roll back a released module version

## Prerequisites

- A published release carrying a broken module.
- `gh` authenticated with write access to the repository.
- The SHA of the commit that introduced the breakage.

## Withdraw the release

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

   Worlds that already installed the withdrawn version stay on it until a higher
   version publishes.

## Publish a replacement

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

4. Merge the release pull request release-please opens. The new release becomes
   Latest, and worlds pick it up on their next update check.

Cut a new version rather than reissuing the withdrawn one.
`.release-please-manifest.json` on `main` records the withdrawn number, and
release-please counts forward from there.
