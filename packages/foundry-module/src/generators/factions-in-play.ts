// SPDX-FileCopyrightText: 2026 Alex Brandt
//
// SPDX-License-Identifier: MIT

import { FACTIONS, type Faction } from "./clearing-tables.js";

/**
 * The factions in play, every faction unless `factions` narrows them.
 *
 * Throws when none are, because every generator that takes them draws at
 * least one.
 */
export function factionsInPlay(factions?: Faction[]): Faction[] {
  const inPlay = factions ?? [...FACTIONS];

  if (inPlay.length === 0) {
    throw new Error("No factions in play");
  }

  return inPlay;
}
