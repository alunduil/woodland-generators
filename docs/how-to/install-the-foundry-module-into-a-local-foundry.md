# How to install the Foundry module into a local Foundry

## Prerequisites

- Foundry VTT installed on the host. Without one, follow
  [Verify with `docker compose`](verify-foundry-module-with-docker-compose.md)
  instead.
- The repository cloned, with `corepack enable` and `pnpm install` already run.

## Steps

1. Point `FOUNDRY_USER_DATA` at your Foundry user data directory, the parent of
   `Data/`, `Config/`, and `Logs/`:

   ```bash
   export FOUNDRY_USER_DATA=~/.local/share/FoundryVTT                  # Linux
   export FOUNDRY_USER_DATA=~/Library/Application\ Support/FoundryVTT  # macOS
   ```

   On Windows:

   ```powershell
   $env:FOUNDRY_USER_DATA = "$env:LOCALAPPDATA\FoundryVTT"
   ```

   If you start Foundry with `--dataPath`, or changed **User Data Path** in the
   setup screen, use that directory instead.

2. Build the module bundle:

   ```bash
   pnpm --filter @woodland-generators/foundry-module build
   ```

3. Link the package into Foundry's modules directory:

   ```bash
   pnpm --filter @woodland-generators/foundry-module install:dev
   ```

   The command prints the link it created, and re-running it replaces the link
   rather than nesting a second one. It exits without changing anything when
   `Data/modules/woodland-generators` is a real directory; remove that directory
   first.

   On Windows, turn on Developer Mode or run the shell as Administrator.
   Creating a directory symlink fails with `EPERM` otherwise.

4. Start Foundry, open or create a world, and enable **Woodland Generators**
   under _Manage Modules_.

5. Open the browser console. The line `woodland-generators | initialized` on
   world load confirms the module loaded.

## Iterate on a change

1. Rebuild on every save:

   ```bash
   pnpm --filter @woodland-generators/foundry-module build:watch
   ```

2. Hard-reload the browser tab running the world to pick up the rebuilt bundle:
   `Ctrl+Shift+R`, or `Cmd+Shift+R` on macOS.

## Remove the link

```bash
rm "$FOUNDRY_USER_DATA/Data/modules/woodland-generators"
```
