# How to verify a published release installs

The `Release` workflow checks the assets a release serves. Loading them in a
running world is the step it can't reach, because Foundry needs a license.

## Prerequisites

- A release whose **Check the published release installs** job passed.
- The `docker compose` harness working:
  [Verify the Foundry module loads with `docker compose`](verify-foundry-module-with-docker-compose.md)
  covers the first-run `.env` and licensing.

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

6. Reset the harness:

   ```bash
   docker compose down -v
   ```

   The next `docker compose up` needs `.env` again and restores the link to the
   development build.
