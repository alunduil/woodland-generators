// SPDX-FileCopyrightText: 2025-2026 Alex Brandt
//
// SPDX-License-Identifier: MIT

import manifest from "../module.json" with { type: "json" };

/**
 * Type-only gate: nothing imports this, `tsc` just checks module.json against
 * Foundry's own schema. `license` is optional there and required here, since a
 * module installs cleanly without one and tells the player nothing.
 *
 * Narrowing it to `https://${string}` does not work -- a JSON import widens
 * values to `string`. Whether the URL resolves is the weekly lychee run's job.
 */
export default manifest satisfies foundry.packages.Module.CreateData & { license: string };
