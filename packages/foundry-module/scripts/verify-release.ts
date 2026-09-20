// SPDX-FileCopyrightText: 2025-2026 Alex Brandt
//
// SPDX-License-Identifier: MIT

// Walks the path a world takes to install the module: fetch the manifest URL,
// download the zip that manifest names, unpack it, and confirm every file the
// manifest promises is there. A release that fails here is one no world can
// install, whatever the packaging step produced locally.
//
// Foundry needs a license, so the last step -- the module loading in a running
// world -- stays manual:
// docs/how-to/verify-a-published-release-installs.md.
//
// RELEASE_TAG, when set, is the version expected at the latest-release
// pointer. Left unset, the checkout's own version is the subject.

import { readFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { unzipSync } from "fflate";

const MANIFEST = "module.json";

// Tracks the same release-please settings as package-release.ts.
const TAG_PREFIX = "foundry-module@";

/** The subset of Foundry's manifest schema this script reads. */
interface ModuleManifest {
  version: string;
  url: string;
  manifest: string;
  download: string;
  esmodules?: string[];
  styles?: string[];
  languages?: { path: string }[];
}

const readJson = async <T>(path: string): Promise<T> =>
  JSON.parse(await readFile(path, "utf8")) as T;

const fetchOk = async (url: string, subject: string): Promise<Response> => {
  // A transport-level failure throws a bare "fetch failed" naming nothing.
  const response = await fetch(url).catch((error: unknown) => {
    throw new Error(`${subject} at ${url} is unreachable: ${String(error)}`, { cause: error });
  });

  if (!response.ok) {
    throw new Error(`${subject} at ${url} returned ${response.status} ${response.statusText}.`);
  }

  return response;
};

const expectedVersion = (fallback: string): string => {
  const tag = process.env.RELEASE_TAG;

  if (tag === undefined) return fallback;

  if (!tag.startsWith(TAG_PREFIX)) {
    throw new Error(`RELEASE_TAG is ${tag}, which is not a ${TAG_PREFIX} tag.`);
  }

  return tag.slice(TAG_PREFIX.length);
};

/** Every path the manifest promises Foundry will find after unpacking. */
const declaredPaths = (manifest: ModuleManifest): string[] => [
  ...(manifest.esmodules ?? []),
  ...(manifest.styles ?? []),
  ...(manifest.languages ?? []).map((language) => language.path),
];

const main = async (): Promise<void> => {
  const packageDir = resolve(fileURLToPath(import.meta.url), "../..");

  // The checkout supplies the repository URL only. Everything asserted below
  // comes off the network, so a wrong answer cannot pass by agreeing with the
  // working tree.
  const { url, version } = await readJson<ModuleManifest>(join(packageDir, MANIFEST));

  const expected = expectedVersion(version);
  const manifestUrl = `${url}/releases/latest/download/${MANIFEST}`;

  const servedText = await (await fetchOk(manifestUrl, "The manifest")).text();
  const served = JSON.parse(servedText) as ModuleManifest;

  if (served.version !== expected) {
    throw new Error(`The latest release serves ${served.version}, but ${expected} was released.`);
  }

  // Installed worlds poll this field forever. A release that names anything
  // else strands every world that takes it.
  if (served.manifest !== manifestUrl) {
    throw new Error(
      `The served manifest points updates at ${served.manifest}, not ${manifestUrl}.`,
    );
  }

  const download = await fetchOk(served.download, "The module archive");
  const archive = unzipSync(new Uint8Array(await download.arrayBuffer()));

  const packaged = archive[MANIFEST];

  if (packaged === undefined) {
    throw new Error(`${served.download} unpacks without a ${MANIFEST} at its root.`);
  }

  // Both assets are uploaded separately, so a stale one can land beside a
  // fresh one. Foundry reads the served copy to decide and the packaged copy
  // to run.
  if (Buffer.from(packaged).toString("utf8") !== servedText) {
    throw new Error(
      `The ${MANIFEST} in ${served.download} differs from the one at ${manifestUrl}.`,
    );
  }

  const missing = declaredPaths(served).filter((path) => !(path in archive));

  if (missing.length > 0) {
    throw new Error(`${MANIFEST} declares ${missing.join(", ")}, absent from ${served.download}.`);
  }

  console.log(`${expected} installs from ${manifestUrl}`);
};

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
