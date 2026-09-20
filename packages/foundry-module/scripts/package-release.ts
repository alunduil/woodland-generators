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

import { MANIFEST, type ModuleManifest, readJson, tagFor } from "./release";

const ARCHIVE = "module.zip";
const PACKAGE = "package.json";
const OUT_DIR = "release";

/** Zip entries, keyed by the path each one lands at inside the archive. */
type Payload = Record<string, Uint8Array>;

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

const serialize = (manifest: ModuleManifest): Uint8Array =>
  Buffer.from(`${JSON.stringify(manifest, undefined, 2)}\n`);

/**
 * release-please bumps module.json in the commit it tags. A disagreement means
 * the checkout is not the commit being released.
 */
const assertTagNamesPayload = (tag: string): void => {
  const expected = process.env.RELEASE_TAG;

  if (expected !== undefined && expected !== tag) {
    throw new Error(`module.json packages ${tag}, but the release tag is ${expected}.`);
  }
};

const declaredFiles = async (packageDir: string, entries: string[]): Promise<string[]> => {
  const files: string[] = [];

  for (const entry of entries) {
    const absolute = resolve(packageDir, entry);
    const stats = await stat(absolute).catch(() => undefined);

    if (!stats) {
      throw new Error(`${PACKAGE} lists ${entry}, which is missing. Run the package build first.`);
    }

    if (!stats.isDirectory()) {
      files.push(absolute);
      continue;
    }

    for (const dirent of await readdir(absolute, { recursive: true, withFileTypes: true })) {
      if (dirent.isFile()) files.push(join(dirent.parentPath, dirent.name));
    }
  }

  return files;
};

/** Zip paths are `/`-separated on every platform, whatever the host uses. */
const readFiles = async (packageDir: string, files: string[]): Promise<Payload> => {
  const payload: Payload = {};

  for (const file of files) {
    payload[relative(packageDir, file).split(sep).join("/")] = await readFile(file);
  }

  return payload;
};

const releasePayload = async (
  packageDir: string,
  entries: string[],
  manifest: Uint8Array,
): Promise<Payload> => ({
  ...(await readFiles(packageDir, await declaredFiles(packageDir, entries))),
  [MANIFEST]: manifest,
});

const writeAssets = async (
  outDir: string,
  manifest: Uint8Array,
  archive: Uint8Array,
): Promise<void> => {
  await rm(outDir, { recursive: true, force: true });
  await mkdir(outDir, { recursive: true });

  await writeFile(join(outDir, MANIFEST), manifest);
  await writeFile(join(outDir, ARCHIVE), archive);
};

const main = async (): Promise<void> => {
  const packageDir = resolve(fileURLToPath(import.meta.url), "../..");

  const manifest = await readJson<ModuleManifest>(join(packageDir, MANIFEST));
  const tag = tagFor(manifest.version);
  assertTagNamesPayload(tag);

  // The package is `private: true`, so npm never reads `files` and this script
  // is its only consumer. An entry added there lands in the zip.
  const { files } = await readJson<{ files: string[] }>(join(packageDir, PACKAGE));

  const released = serialize(releaseManifest(manifest, tag));
  const payload = await releasePayload(packageDir, files, released);

  const outDir = join(packageDir, OUT_DIR);
  await writeAssets(outDir, released, zipSync(payload));

  console.log(`Packaged ${tag} into ${outDir}`);
};

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
