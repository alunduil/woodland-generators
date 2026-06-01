# How to verify the Foundry module loads with `docker compose`

## Prerequisites

- Docker (or Podman with the compose plugin) on the host.
- A Foundry account that owns at least one Foundry license.

## Steps

1. On the first run only, create `.env` with a download link for the Foundry
   build:

   ```bash
   cp .env.example .env
   ```

   Set `FOUNDRY_RELEASE_URL` to a timed link from your Foundry account
   (Purchased Software Licenses, OS set to "Node.js", timed URL button). It
   expires, so generate it just before starting the container. Later runs reuse
   the cached build and license from the `foundry-data` volume and need no
   `.env`.

2. Build the module bundle:

   ```bash
   pnpm --filter @woodland-generators/foundry-module build
   ```

3. Start Foundry:

   ```bash
   docker compose up
   ```

4. Open <http://localhost:30000>. Enter the license key if prompted, then create
   or open a world and enable **Woodland Generators** under _Manage Modules_.

5. Open the browser console. The line `woodland-generators | initialized` on
   world load confirms the module loaded.

6. Stop the harness, keeping the volume so the next run skips the download and
   licensing:

   ```bash
   docker compose down
   ```

   Use `docker compose down -v` only to start fresh; it deletes the cached build
   and license, so the next run needs `.env` again.

For the full set of environment variables the image accepts, see the
[image's reference](https://github.com/felddy/foundryvtt-docker#environment-variables).
