# How to verify the Foundry module loads with `docker compose`

## Prerequisites

- Docker (or Podman with the compose plugin) on the host.
- A Foundry account that owns at least one Foundry license.
- Optionally, the 1Password CLI (`op`), to keep Foundry credentials off disk.

## Steps

1. Build the module bundle:

   ```bash
   pnpm --filter @woodland-generators/foundry-module build
   ```

2. Check whether the `foundry-data` volume already holds the build the pinned
   image wants. The image tag in `docker-compose.yml` sets the version, and the
   cache is keyed to it by filename:

   ```bash
   docker run --rm -v "$(basename "$PWD")_foundry-data:/data" \
     --entrypoint sh felddy/foundryvtt -c 'ls /data/container_cache'
   ```

   A matching `foundryvtt-<version>.zip` means you need nothing from your
   Foundry account. Start Foundry and skip to step 5:

   ```bash
   docker compose up
   ```

3. Otherwise, give the container your Foundry credentials so it downloads the
   build and applies the license itself. Create `foundry.env` in the shared git
   directory from the
   [credentials template](../reference/compose-harness-variables.md#credentials).
   With 1Password, set each value to an `op://` reference and start Foundry:

   ```bash
   op run --env-file "$(git rev-parse --git-common-dir)/foundry.env" -- \
     docker compose up
   ```

   Without 1Password, set the values themselves, make the file readable only by
   you, and start Foundry:

   ```bash
   docker compose --env-file "$(git rev-parse --git-common-dir)/foundry.env" up
   ```

   Skip to step 5. If the account requires two-factor sign-in and the download
   fails, use step 4 instead.

4. Without credentials, place the build into the cache by hand. From your
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

   To place a build of another version, or download with a timed link instead,
   set the matching
   [override](../reference/compose-harness-variables.md#overrides) in `.env`.
   Then start Foundry:

   ```bash
   docker compose up
   ```

5. Open <http://localhost:30000>. On a fresh volume, accept the license
   agreement, and enter the license key if prompted. The module declares no
   system dependency, so any game system works; if you have none installed, go
   to **Game Systems → Install System**, search for **Worldbuilding** (Foundry's
   free, minimal system), install it, then create a world with it.

6. Open or launch the world and enable **Woodland Generators** under _Manage
   Modules_.

7. Open the browser console. The line `woodland-generators | initialized` on
   world load confirms the module loaded.

8. Stop the harness, keeping the volume so the next run skips the download and
   licensing:

   ```bash
   docker compose down
   ```

   Use `docker compose down -v` only to start fresh; it deletes the cached build
   and license, so the next run needs credentials or a placed build again.
