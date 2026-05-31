# How to verify the Foundry module loads with `docker compose`

## Prerequisites

- Docker (or Podman with the compose plugin) on the host.
- A Foundry account that owns at least one Foundry license.

## Steps

1. From the repository root, copy the environment template:

   ```bash
   cp .env.example .env
   ```

   Pick one authentication method and set `FOUNDRY_ADMIN_KEY` (any value; you
   type it into the browser when prompted):
   - Without a password on disk, set `FOUNDRY_RELEASE_URL` to a timed download
     link from your Foundry account (Purchased Software Licenses, OS set to
     "Node.js", timed URL button). It expires, so generate it just before
     starting the container.
   - Otherwise set `FOUNDRY_USERNAME` and `FOUNDRY_PASSWORD` to your account
     credentials.

2. Build the module bundle:

   ```bash
   pnpm --filter @woodland-generators/foundry-module build
   ```

3. Start Foundry:

   ```bash
   docker compose up
   ```

4. Open <http://localhost:30000>. Create or open a world, then enable **Woodland
   Generators** under _Manage Modules_.

5. Open the browser console. The line `woodland-generators | initialized` on
   world load confirms the module loaded.

6. Stop the harness:

   ```bash
   docker compose down
   ```

For the full set of environment variables the image accepts, see the
[image's reference](https://github.com/felddy/foundryvtt-docker#environment-variables).
