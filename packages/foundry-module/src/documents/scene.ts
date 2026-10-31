// SPDX-FileCopyrightText: 2025-2026 Alex Brandt
//
// SPDX-License-Identifier: MIT

import type { Clearing } from "../generators/clearing.js";

/**
 * A clearing's Scene, opening its Journal entry.
 *
 * The Scene has no background image until the GM sets a map. It stays out of
 * the navigation bar so a batch doesn't crowd it.
 */
export function clearingScene(
  clearing: Clearing,
  ids: { journal: string; scene: string },
): Scene.CreateData {
  return { _id: ids.scene, name: clearing.name, journal: ids.journal, navigation: false };
}
