// SPDX-FileCopyrightText: 2025-2026 Alex Brandt
//
// SPDX-License-Identifier: MIT

import { Rng } from "@woodland-generators/random";

import {
  CLEARING_FEATURES,
  CONFLICT_SUBJECTS,
  DENIZEN_SPECIES,
  FACTIONS,
  LOCAL_CHALLENGERS,
  type Challenger,
  type ClearingFeature,
  type ConflictSubject,
  type DenizenSpecies,
  type Faction,
} from "./clearing-tables.js";

/** The trouble the clearing is in. */
interface Conflict {
  challenger: Challenger;
  over: ConflictSubject;
}

export interface Clearing {
  features: ClearingFeature[];
  inhabitants: DenizenSpecies[];
  ruler: Faction;
  conflict: Conflict;
}

export interface ClearingGeneratorOptions {
  seed: string;
  /** The factions this woodland has in it; defaults to all of them. */
  factions?: Faction[];
  /** Overrides the ruler draw. */
  ruler?: Faction;
}

const MAX_FEATURES = 3;

const MAX_INHABITANTS = 2;

/**
 * Every faction unless `factions` narrows the roster.
 *
 * Throws when the roster is empty, or when it has no room for the ruler the
 * caller chose.
 */
function factionsInPlay({ factions, ruler }: ClearingGeneratorOptions): Faction[] {
  const inPlay = factions ?? [...FACTIONS];

  if (inPlay.length === 0) {
    throw new Error("No factions available to rule the clearing");
  }

  if (ruler && !inPlay.includes(ruler)) {
    throw new Error(`Invalid ruler provided: "${ruler}". Available choices: ${inPlay.join(", ")}.`);
  }

  return inPlay;
}

/** Draw one to `most` distinct entries from `table`. */
function drawAtLeastOne<T>(rng: Rng, table: readonly T[], most: number): T[] {
  return rng.selectRandomSample([...table], rng.getRandomIntInclusive(1, most));
}

/** Draw the trouble the clearing is in. */
function drawConflict(rng: Rng, inPlay: Faction[], ruler: Faction): Conflict {
  const challengers: Challenger[] = [
    ...inPlay.filter((faction) => faction !== ruler),
    ...LOCAL_CHALLENGERS,
  ];

  return {
    challenger: rng.selectRandomElement(challengers),
    over: rng.selectRandomElement([...CONFLICT_SUBJECTS]),
  };
}

/**
 * Generate a Woodland clearing, deterministically on `options.seed`.
 *
 * Supplying `ruler` skips that draw, so the rest of the clearing differs from
 * what the same seed produces without it.
 */
export function generateClearing(options: ClearingGeneratorOptions): Clearing {
  const inPlay = factionsInPlay(options);
  const rng = new Rng(options.seed);
  const ruler = options.ruler ?? rng.selectRandomElement(inPlay);

  return {
    features: drawAtLeastOne(rng, CLEARING_FEATURES, MAX_FEATURES),
    inhabitants: drawAtLeastOne(rng, DENIZEN_SPECIES, MAX_INHABITANTS),
    ruler,
    conflict: drawConflict(rng, inPlay, ruler),
  };
}
