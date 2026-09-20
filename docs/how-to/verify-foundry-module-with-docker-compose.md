# How to verify the Foundry module loads with `docker compose`

## Prerequisites

- Docker (or Podman with the compose plugin) on the host.
- A Foundry account that owns at least one Foundry license.

## Steps

1. Check whether the `foundry-data` volume already holds the build the pinned
   image wants. The image tag in `docker-compose.yml` sets the version, and the
   cache is keyed to it by filename:

   ```bash
   docker run --rm -v "$(basename "$PWD")_foundry-data:/data" \
     --entrypoint sh felddy/foundryvtt -c 'ls /data/container_cache'
   ```

   A matching `foundryvtt-<version>.zip` means you need nothing from your
   Foundry account. Skip to step 3.

2. Otherwise, get that build into the cache. From your Foundry account under
   Purchased Software Licenses, set **Operating System to "Node.js"** and
   download the zip. Then copy it in under the name the container expects:

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
   `FOUNDRY_VERSION=<version>` in `.env`. The container warns about the mismatch
   and proceeds.

   Instead of the download, you can set `FOUNDRY_RELEASE_URL` in `.env` to a
   timed link from the same page. It expires, so generate it immediately before
   starting the container.

3. Build the module bundle:

   ```bash
   pnpm --filter @woodland-generators/foundry-module build
   ```

4. Start Foundry:

   ```bash
   docker compose up
   ```

5. Open <http://localhost:30000> and enter the license key if prompted. The
   module declares no system dependency, so any game system works; if you have
   none installed, go to **Game Systems → Install System**, search for
   **Worldbuilding** (Foundry's free, minimal system), install it, then create a
   world with it.

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
   and license, so the next run needs `.env` again.

For the full set of environment variables the image accepts, see the
[image's reference](https://github.com/felddy/foundryvtt-docker#environment-variables).
