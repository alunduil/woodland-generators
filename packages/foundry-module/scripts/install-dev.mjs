// Symlinks this package into the local Foundry user data directory so a built
// module can be enabled in a world without copying files. Reads the user data
// path from FOUNDRY_USER_DATA — Foundry itself uses --dataPath / the in-app
// "User Data Path" setting, both of which write to that same directory.

import { mkdir, symlink, rm, lstat } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const packageDir = resolve(here, "..");

const userData = process.env.FOUNDRY_USER_DATA;
if (!userData) {
  console.error("FOUNDRY_USER_DATA is not set.");
  console.error("Point it at your Foundry user data directory (the parent of");
  console.error("Data/, Config/, and Logs/). Typical locations:");
  console.error("  Linux:   ~/.local/share/FoundryVTT");
  console.error("  macOS:   ~/Library/Application Support/FoundryVTT");
  console.error("  Windows: %LOCALAPPDATA%\\FoundryVTT");
  process.exit(1);
}

const moduleDir = resolve(userData, "Data/modules/woodland-generators");

await mkdir(dirname(moduleDir), { recursive: true });

try {
  const stats = await lstat(moduleDir);
  if (!stats.isSymbolicLink()) {
    console.error(`${moduleDir} exists and is not a symlink — refusing to overwrite.`);
    process.exit(1);
  }
  await rm(moduleDir);
} catch (err) {
  if (err.code !== "ENOENT") throw err;
}

await symlink(packageDir, moduleDir, "dir");
console.log(`Linked ${moduleDir} -> ${packageDir}`);
