# How to verify a published release installs

## Prerequisites

- A release whose **Check the published release installs** job passed.
- The `docker compose` harness working:
  [Verify the Foundry module loads with `docker compose`](verify-foundry-module-with-docker-compose.md)
  covers seeding the Foundry build into the cache and licensing.

## Steps

1. Start Foundry and drop the link to the development build, so the install
   lands where that link sits:

   ```bash
   docker compose up -d
   docker compose exec foundry rm -f /data/Data/modules/woodland-generators
   ```

2. Open <http://localhost:30000>, then **Add-on Modules** → **Install Module**,
   and paste into **Manifest URL**:

   ```text
   https://github.com/alunduil/woodland-generators/releases/latest/download/module.json
   ```

3. Install, and check the version listed against the release tag.

4. Launch a world and enable **Woodland Generators** under _Manage Modules_.

5. Open the browser console. The line `woodland-generators | initialized` on
   world load confirms the module loaded.

6. Replace the installed release with the link to the development build, then
   stop the harness:

   ```bash
   docker compose exec foundry rm -rf /data/Data/modules/woodland-generators
   docker compose exec foundry ln -sfn /srv/module /data/Data/modules/woodland-generators
   docker compose down
   ```
