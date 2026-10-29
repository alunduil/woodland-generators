# How to verify the Foundry module loads with `docker compose`

## Prerequisites

- Docker (or Podman with the compose plugin) on the host.
- A Foundry account that owns at least one Foundry license.
- Optionally, the 1Password CLI (`op`), to keep Foundry credentials off disk.

## Steps

1. Check whether the `foundry-data` volume already holds the build the pinned
   image wants. The image tag in `docker-compose.yml` sets the version, and the
   cache is keyed to it by filename:

   ```bash
   docker run --rm -v "$(basename "$PWD")_foundry-data:/data" \
     --entrypoint sh felddy/foundryvtt -c 'ls /data/container_cache'
   ```

   A matching `foundryvtt-<version>.zip` means you need nothing from your
   Foundry account. Skip to step 4.

2. Otherwise, give the container your Foundry credentials so it downloads the
   build and applies the license itself. Create `foundry.env` in the
   repository's shared git directory, `git rev-parse --git-common-dir`, so every
   worktree uses it and git never tracks it. Define:
   - `FOUNDRY_USERNAME`
   - `FOUNDRY_PASSWORD`
   - `FOUNDRY_LICENSE_KEY`
   - `FOUNDRY_ADMIN_KEY` (optional; locks the `/setup` screens)

   With 1Password, set each value to an `op://` reference, so the file holds no
   secrets. Without it, set the values themselves and make the file readable
   only by you. A value containing `"` or `\` breaks the JSON the harness builds
   from them.

   An account that requires two-factor sign-in may not work this way. Use step 3
   instead.

3. Without credentials, place the build into the cache by hand. From your
   Foundry account under Purchased Software Licenses, set **Operating System to
   "Node.js"** and download the zip. Then copy it in under the name the
   container expects:

   ```bash
   docker run --rm -v "$(basename "$PWD")_foundry-data:/data" \
     -v /path/to/FoundryVTT-Node-<version>.zip:/src.zip:ro \
     --entrypoint sh felddy/foundryvtt -c \
     'cp /src.zip /data/container_cache/foundryvtt-<version>.zip &&
      chown node:node /data/container_cache/foundryvtt-<version>.zip'
   ```

   Take the `Node.js` build, not `Linux`. Linux is the Electron desktop app: it
   runs to roughly 240 MB and unpacks `chrome-sandbox` and `libGLESv2.so`. The
   Node.js build is around 140 MB with `main.js` at its root. The container
   accepts only the latter, and rejects the other with an obscure error.

   To use a build whose version differs from the image's, put
   `FOUNDRY_VERSION=<version>` in `.env` in the checkout. The container warns
   about the mismatch and proceeds.

   Instead of the download, you can set `FOUNDRY_RELEASE_URL` in `.env` to a
   timed link from the same page. It expires, so generate it immediately before
   starting the container.

4. Build the module bundle:

   ```bash
   pnpm --filter @woodland-generators/foundry-module build
   ```

5. Start Foundry. With a 1Password credentials file:

   ```bash
   op run --env-file "$(git rev-parse --git-common-dir)/foundry.env" -- \
     docker compose up
   ```

   With a plaintext credentials file:

   ```bash
   docker compose --env-file "$(git rev-parse --git-common-dir)/foundry.env" up
   ```

   `--env-file` replaces `.env` in the checkout as the source of these values.
   Without credentials, run `docker compose up`.

6. Open <http://localhost:30000> and enter the license key if prompted. The
   module declares no system dependency, so any game system works; if you have
   none installed, go to **Game Systems → Install System**, search for
   **Worldbuilding** (Foundry's free, minimal system), install it, then create a
   world with it.

7. Open or launch the world and enable **Woodland Generators** under _Manage
   Modules_.

8. Open the browser console. The line `woodland-generators | initialized` on
   world load confirms the module loaded.

9. Stop the harness, keeping the volume so the next run skips the download and
   licensing:

   ```bash
   docker compose down
   ```

   Use `docker compose down -v` only to start fresh; it deletes the cached build
   and license, so the next run needs credentials or a placed build again.

For the full set of environment variables the image accepts, see the
[image's reference](https://github.com/felddy/foundryvtt-docker#environment-variables).
