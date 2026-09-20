// SPDX-FileCopyrightText: 2025-2026 Alex Brandt
//
// SPDX-License-Identifier: MIT

// Reads a published release back the way a world installs it. A release that
// fails here is one no world can install.
//
// Foundry needs a license, so the last step -- the module loading in a running
// world -- stays manual:
// docs/how-to/verify-a-published-release-installs.md.
//
// RELEASE_TAG, when set, is the version expected at the latest-release
// pointer. Left unset, the checkout's own version is the subject.

import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { type Unzipped, unzipSync } from "fflate";

import { MANIFEST, type ModuleManifest, readJson, versionIn } from "./release";

/** A manifest as published: the repository's copy plus the two URLs written into it. */
interface ServedManifest extends ModuleManifest {
  manifest?: string;
  download?: string;
  esmodules?: string[];
  styles?: string[];
  languages?: { path: string }[];
}

/** One release, as the network served it, before anything is checked. */
interface PublishedRelease {
  manifestUrl: string;
  servedText: string;
  served: ServedManifest;
  archiveUrl: string;
  archive: Unzipped;
}

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

  return tag === undefined ? fallback : versionIn(tag);
};

const archiveUrlIn = (served: ServedManifest, manifestUrl: string): string => {
  if (served.download === undefined) {
    throw new Error(`The manifest at ${manifestUrl} names no download URL.`);
  }

  return served.download;
};

const fetchRelease = async (manifestUrl: string): Promise<PublishedRelease> => {
  const servedText = await (await fetchOk(manifestUrl, "The manifest")).text();
  const served = JSON.parse(servedText) as ServedManifest;
  const archiveUrl = archiveUrlIn(served, manifestUrl);
  const download = await fetchOk(archiveUrl, "The module archive");

  return {
    manifestUrl,
    servedText,
    served,
    archiveUrl,
    archive: unzipSync(new Uint8Array(await download.arrayBuffer())),
  };
};

const assertServesVersion = ({ served }: PublishedRelease, expected: string): void => {
  if (served.version !== expected) {
    throw new Error(`The latest release serves ${served.version}, but ${expected} was released.`);
  }
};

/** Installed worlds poll this field forever; one naming anything else strands them. */
const assertPollsItself = ({ served, manifestUrl }: PublishedRelease): void => {
  if (served.manifest !== manifestUrl) {
    throw new Error(
      `The served manifest points updates at ${served.manifest}, not ${manifestUrl}.`,
    );
  }
};

/**
 * The two assets upload separately, so a stale one can land beside a fresh one.
 * Foundry reads the served copy to decide and the packaged copy to run.
 */
const assertCopiesAgree = (release: PublishedRelease): void => {
  const { archive, archiveUrl, servedText, manifestUrl } = release;
  const packaged = archive[MANIFEST];

  if (packaged === undefined) {
    throw new Error(`${archiveUrl} unpacks without a ${MANIFEST} at its root.`);
  }

  if (Buffer.from(packaged).toString("utf8") !== servedText) {
    throw new Error(`The ${MANIFEST} in ${archiveUrl} differs from the one at ${manifestUrl}.`);
  }
};

/** Every path the manifest promises Foundry will find after unpacking. */
const declaredPaths = (served: ServedManifest): string[] => [
  ...(served.esmodules ?? []),
  ...(served.styles ?? []),
  ...(served.languages ?? []).map((language) => language.path),
];

const assertDeclaredFilesPresent = ({ served, archive, archiveUrl }: PublishedRelease): void => {
  const missing = declaredPaths(served).filter((path) => !(path in archive));

  if (missing.length > 0) {
    throw new Error(`${MANIFEST} declares ${missing.join(", ")}, absent from ${archiveUrl}.`);
  }
};

const assertInstallable = (release: PublishedRelease, expected: string): void => {
  assertServesVersion(release, expected);
  assertPollsItself(release);
  assertCopiesAgree(release);
  assertDeclaredFilesPresent(release);
};

const main = async (): Promise<void> => {
  const packageDir = resolve(fileURLToPath(import.meta.url), "../..");

  // Only the repository URL comes from the checkout. Everything asserted comes
  // off the network, so a wrong answer cannot pass by agreeing with the working
  // tree.
  const { url, version } = await readJson<ModuleManifest>(join(packageDir, MANIFEST));

  const expected = expectedVersion(version);
  const manifestUrl = `${url}/releases/latest/download/${MANIFEST}`;

  assertInstallable(await fetchRelease(manifestUrl), expected);

  console.log(`${expected} installs from ${manifestUrl}`);
};

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
