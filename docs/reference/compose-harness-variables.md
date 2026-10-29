# Compose harness variables

The variables `docker-compose.yml` reads to download and license Foundry. Every
variable is optional: a `foundry-data` volume that already holds the pinned
build and its license runs with none of them. For variables the image accepts
beyond these, see the
[image's reference](https://github.com/felddy/foundryvtt-docker#environment-variables).

## Sources

Compose reads the variables from, in order of precedence:

1. The shell environment, including values `op run` resolves.
2. The file passed with `docker compose --env-file <path>`, or `.env` in the
   checkout when no `--env-file` is given.

`--env-file` replaces `.env` in the checkout; Compose doesn't read both.

## Credentials

Kept in `foundry.env` in the shared git directory,
`git rev-parse --git-common-dir`. Every worktree of a clone resolves the same
file, and git doesn't track it.

```dotenv
FOUNDRY_USERNAME=
FOUNDRY_PASSWORD=
FOUNDRY_LICENSE_KEY=
FOUNDRY_ADMIN_KEY=
```

Each value is either the secret itself or an `op://` reference for `op run` to
resolve. Compose writes the four into `/run/secrets/config.json` in the
container as JSON, so a value containing `"` or `\` breaks the file.

### `FOUNDRY_USERNAME` and `FOUNDRY_PASSWORD`

The Foundry account. With both set, the container downloads the pinned build
when the cache lacks it. Untested with an account that requires two-factor
sign-in.

### `FOUNDRY_LICENSE_KEY`

Applied on first run to a volume without a license. A license already in the
volume is left unchanged.

### `FOUNDRY_ADMIN_KEY`

Password for Foundry's `/setup` screens. Unset leaves them open.

## Overrides

Kept in `.env` in the checkout, which git ignores. The service reads this file
directly, whichever file supplies the credentials.

```dotenv
FOUNDRY_RELEASE_URL=
FOUNDRY_VERSION=
```

### `FOUNDRY_RELEASE_URL`

A time-limited download link from the Foundry account's Purchased Software
Licenses page, with the operating system set to `Node.js`. Downloads in place of
the account credentials.

### `FOUNDRY_VERSION`

The Foundry build to install. Defaults to the pinned image's version; a
different value logs a mismatch warning and proceeds. The cache holds builds as
`foundryvtt-<version>.zip`.
