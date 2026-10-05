// SPDX-FileCopyrightText: 2025-2026 Alex Brandt
//
// SPDX-License-Identifier: MIT

import manifest from "../module.json";

/**
 * Foundry's types accept anything its list fields cast, a keyed object or a bare
 * string included, so they let a malformed list through.
 */
type ArrayIfList<V> = [Extract<V, readonly unknown[]>] extends [never]
  ? V
  : Extract<V, readonly unknown[] | null | undefined>;

/** A module without a `license` installs cleanly and tells the player nothing. */
type Manifest = {
  [K in keyof foundry.packages.Module.CreateData]: ArrayIfList<
    foundry.packages.Module.CreateData[K]
  >;
} & {
  license: string;
};

/**
 * Rejects keys outside Foundry's schema, which `satisfies` misses on an imported
 * binding.
 */
export function checkManifest<M>(
  candidate: M & Manifest & Record<Exclude<keyof M, keyof Manifest>, never>,
): M {
  return candidate;
}

/**
 * The bundle never imports this file; `tsc` checks module.json through it.
 *
 * A JSON import widens `license` to `string`, so test/manifest.test.ts checks it
 * is an https URL and the weekly lychee run checks it resolves.
 */
export default checkManifest(manifest);
