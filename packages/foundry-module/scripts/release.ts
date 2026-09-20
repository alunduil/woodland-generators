// SPDX-FileCopyrightText: 2025-2026 Alex Brandt
//
// SPDX-License-Identifier: MIT

// Vocabulary shared by package-release.ts, which writes a release, and
// verify-release.ts, which reads the same release back off the network.

import { readFile } from "node:fs/promises";

export const MANIFEST = "module.json";

// release-please composes the tag from `component` and `tag-separator` in
// release-please-config.json; this literal has to track both.
const TAG_PREFIX = "foundry-module@";

/** The subset of Foundry's manifest schema these scripts read or write. */
export interface ModuleManifest {
  version: string;
  url: string;
  [field: string]: unknown;
}

export const readJson = async <T>(path: string): Promise<T> =>
  JSON.parse(await readFile(path, "utf8")) as T;

/** The tag release-please pushes for a module version. */
export const tagFor = (version: string): string => `${TAG_PREFIX}${version}`;

export const versionIn = (tag: string): string => {
  if (!tag.startsWith(TAG_PREFIX)) {
    throw new Error(`${tag} is not a ${TAG_PREFIX} tag.`);
  }

  return tag.slice(TAG_PREFIX.length);
};
