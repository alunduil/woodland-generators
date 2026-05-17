# Foundry module shell

Foundry VTT module package for Woodland Generators. Registers as
`woodland-generators` and logs an init-hook heartbeat at world load.

## Verifying the module in Foundry (`docker compose`)

A `docker-compose.yml` at the repository root runs Foundry locally with this
package mounted as a module. Contributors with a Foundry account can confirm the
module loads end-to-end without installing Foundry on the host.

The image, `felddy/foundryvtt`, is community-maintained, not published by
Foundry. The license you supply is your own; nothing distributable lives in the
repository.

### Prerequisites

- Docker (or Podman with the compose plugin) on the host.
- A Foundry account that owns at least one Foundry license. The license is
  per-developer; the repository does not provide one.

### One-time setup

```bash
cp .env.example .env
# Edit .env with your Foundry account credentials and an admin key.
```

`.env` is listed in `.gitignore`. See the image's
[environment-variable reference](https://github.com/felddy/foundryvtt-docker#environment-variables)
for the full contract.

### Run

```bash
pnpm --filter @woodland-generators/foundry-module build
docker compose up
```

Then browse to <http://localhost:30000>, create or open a world, and enable
**Woodland Generators** under _Manage Modules_. The init hook logs
`woodland-generators | initialized` to the browser console when the world loads.

### Iterate

Rebuild the module bundle (in another terminal) and reload the Foundry tab:

```bash
pnpm --filter @woodland-generators/foundry-module build:watch
```

The compose mounts the package's `dist/` and `module.json` read-only into the
container, so each rebuild is visible on the next world reload.

### Stop and clean up

```bash
docker compose down       # keep license cache for next run
docker compose down -v    # also drop the foundry-data volume
```

## See also

- [Root `CONTRIBUTING.md`](../../CONTRIBUTING.md): repository setup, commit
  conventions, and PR flow.
