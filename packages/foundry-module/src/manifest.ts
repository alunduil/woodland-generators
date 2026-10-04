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
type ListsAsArrays<T> = {
  [K in keyof T]: [Extract<T[K], readonly unknown[]>] extends [never]
    ? T[K]
    : Extract<T[K], readonly unknown[] | null | undefined>;
};

/**
 * `license` is optional in Foundry's schema and required here, since a module
 * installs cleanly without one and tells the player nothing.
 */
type Manifest = ListsAsArrays<foundry.packages.Module.CreateData> & { license: string };

/**
 * `satisfies` checks excess properties only on a fresh object literal, and an
 * imported binding isn't one, so a misspelt key would otherwise pass silently.
 */
export type ExactManifest<M> = Manifest & Record<Exclude<keyof M, keyof Manifest>, never>;

/**
 * Type-only gate: the bundle never imports this, `tsc` just checks module.json
 * against Foundry's own schema.
 *
 * Narrowing `license` to `https://${string}` does not work -- a JSON import
 * widens values to `string` -- so test/manifest.test.ts checks its form.
 * Whether the URL resolves is the weekly lychee run's job.
 */
export default manifest satisfies ExactManifest<typeof manifest>;
