# Compose harness variables

The variables `docker-compose.yml` reads to download and license Foundry. Every
variable is optional: a `foundry-data` volume that already holds the pinned
build and its license runs with none of them. For variables the image accepts
beyond these, see the
[image's reference](https://github.com/felddy/foundryvtt-docker#environment-variables).

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

Each value is the secret itself or an `op://` reference for `op run` to resolve.
A value containing `"` or `\` breaks the JSON these become in the container.

Compose reads them from, in order of precedence:

1. The shell environment, including values `op run` resolves.
2. The file passed with `docker compose --env-file <path>`, or else `.env` in
   the checkout.

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

Read only from `.env` in the checkout, which git ignores, whatever `--env-file`
names.

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
