// SPDX-FileCopyrightText: 2025-2026 Alex Brandt
//
// SPDX-License-Identifier: MIT

import manifest from "../module.json";

/**
 * Foundry's assignment types accept whatever its data fields will cast, so a
 * list field also takes a keyed object or any iterable -- including a bare
 * string. A manifest is read by more than Foundry, so hold each list field to
 * its array form.
 */
type ArrayIfList<V> = [Extract<V, readonly unknown[]>] extends [never]
  ? V
  : Extract<V, readonly unknown[] | null | undefined>;

/**
 * `license` is optional in Foundry's schema and required here, since a module
 * installs cleanly without one and tells the player nothing.
 */
type Manifest = {
  [K in keyof foundry.packages.Module.CreateData]: ArrayIfList<
    foundry.packages.Module.CreateData[K]
  >;
} & {
  license: string;
};

/**
 * Inferring `M` captures every key the argument has, so one outside the schema
 * meets `never` -- `satisfies` would skip excess-property checks on an imported
 * binding.
 */
export function checkManifest<M>(
  candidate: M & Manifest & Record<Exclude<keyof M, keyof Manifest>, never>,
): M {
  return candidate;
}

/**
 * Type-only gate: the bundle never imports this, `tsc` just checks module.json
 * against Foundry's own schema.
 *
 * Narrowing `license` to `https://${string}` does not work -- a JSON import
 * widens values to `string` -- so test/manifest.test.ts checks its form.
 * Whether the URL resolves is the weekly lychee run's job.
 */
export default checkManifest(manifest);
