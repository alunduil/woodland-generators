// SPDX-FileCopyrightText: 2025-2026 Alex Brandt
//
// SPDX-License-Identifier: MIT

// Assembles the two assets a GitHub Release has to carry for Foundry to install
// the module: module.json, served at the manifest URL players paste, and the zip
// that manifest points at.
//
// Foundry unpacks the zip into Data/modules/<id>, so every entry sits at the zip
// root.
//
// RELEASE_TAG, when set, is checked against module.json. Left unset, the tag is
// derived from it, so CI can run this on a branch.

import { mkdir, readdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import { join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

import { zipSync } from "fflate";

const MANIFEST = "module.json";
const ARCHIVE = "module.zip";
const OUT_DIR = "release";

// release-please composes the tag from `component` and `tag-separator` in
// release-please-config.json; this literal has to track both.
const TAG_PREFIX = "foundry-module@";

/** The subset of Foundry's manifest schema this script reads or writes. */
interface ModuleManifest {
  version: string;
  url: string;
  [field: string]: unknown;
}

/**
 * Foundry fetches `manifest` to decide whether a newer version exists, so it
 * names the latest release. It installs `download` from the manifest it just
 * fetched, so that names this release alone.
 */
const releaseManifest = (manifest: ModuleManifest, tag: string): ModuleManifest => ({
  ...manifest,
  manifest: `${manifest.url}/releases/latest/download/${MANIFEST}`,
  download: `${manifest.url}/releases/download/${tag}/${ARCHIVE}`,
});

/**
 * Reads the declared entries into the path-to-bytes map the zip is written
 * from. Zip paths are `/`-separated on every platform, hence the rewrite of
 * whatever separator the host uses.
 */
const readPayload = async (
  packageDir: string,
  entries: string[],
): Promise<Record<string, Uint8Array>> => {
  const payload: Record<string, Uint8Array> = {};

  const add = async (file: string): Promise<void> => {
    payload[relative(packageDir, file).split(sep).join("/")] = await readFile(file);
  };

  for (const entry of entries) {
    const absolute = resolve(packageDir, entry);
    const stats = await stat(absolute).catch(() => undefined);

    if (!stats) {
      throw new Error(
        `package.json lists ${entry}, which is missing. Run the package build first.`,
      );
    }

    if (!stats.isDirectory()) {
      await add(absolute);
      continue;
    }

    for (const dirent of await readdir(absolute, { recursive: true, withFileTypes: true })) {
      if (dirent.isFile()) await add(join(dirent.parentPath, dirent.name));
    }
  }

  return payload;
};

const readJson = async <T>(path: string): Promise<T> =>
  JSON.parse(await readFile(path, "utf8")) as T;

const main = async (): Promise<void> => {
  const packageDir = resolve(fileURLToPath(import.meta.url), "../..");

  const manifest = await readJson<ModuleManifest>(join(packageDir, MANIFEST));
  const tag = `${TAG_PREFIX}${manifest.version}`;

  // release-please bumps module.json in the commit it tags. A disagreement
  // means the checkout is not the commit being released.
  const expected = process.env.RELEASE_TAG;
  if (expected !== undefined && expected !== tag) {
    throw new Error(`module.json packages ${tag}, but the release tag is ${expected}.`);
  }

  // The package is `private: true`, so npm never reads `files` and this script
  // is its only consumer. An entry added there lands in the zip.
  const { files } = await readJson<{ files: string[] }>(join(packageDir, "package.json"));
  const payload = await readPayload(packageDir, files);

  // Keyed at the zip root, which is the placement Foundry requires and the
  // reason the payload is keyed by path rather than zipped from a directory.
  const released = Buffer.from(`${JSON.stringify(releaseManifest(manifest, tag), undefined, 2)}\n`);
  payload[MANIFEST] = released;

  const outDir = join(packageDir, OUT_DIR);
  await rm(outDir, { recursive: true, force: true });
  await mkdir(outDir, { recursive: true });

  await writeFile(join(outDir, MANIFEST), released);
  await writeFile(join(outDir, ARCHIVE), zipSync(payload));

  console.log(`Packaged ${tag} into ${outDir}`);
};

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
