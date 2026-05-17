# `@woodland-generators/foundry-module`

The Foundry VTT integration package for [Woodland Generators](../../README.md).
Built output is an ESM bundle that Foundry loads as a module. The loaded module
registers under the ID `woodland-generators` and logs an init-hook heartbeat to
the browser console.

## Build

```bash
pnpm --filter @woodland-generators/foundry-module build
```

esbuild emits the bundle to `dist/module.js`; `module.json` declares the load
entry.

## Verify it loads in Foundry

Without a host Foundry install:
[Verify with `docker compose`](../../docs/how-to/verify-foundry-module-with-docker-compose.md).

## See also

- [Root `CONTRIBUTING.md`](../../CONTRIBUTING.md): repository setup, commit
  conventions, and PR flow.
