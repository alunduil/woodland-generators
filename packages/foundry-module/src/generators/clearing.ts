// SPDX-FileCopyrightText: 2025-2026 Alex Brandt
//
// SPDX-License-Identifier: MIT

import { Rng } from "@woodland-generators/random";

import {
  CLEARING_FEATURES,
  CLEARING_NAMES,
  CONFLICT_SUBJECTS,
  DENIZEN_SPECIES,
  LOCAL_CHALLENGERS,
  type Challenger,
  type ClearingFeature,
  type ClearingName,
  type ConflictSubject,
  type DenizenSpecies,
  type Faction,
} from "./clearing-tables.js";
import { factionsInPlay } from "./factions-in-play.js";

/** The trouble the clearing is in. */
interface Conflict {
  challenger: Challenger;
  over: ConflictSubject;
}

export interface Clearing {
  name: ClearingName;
  features: ClearingFeature[];
  inhabitants: DenizenSpecies[];
  ruler: Faction;
  conflict: Conflict;
}

export interface ClearingGeneratorOptions {
  seed: string;
  /** The factions in play in this Woodland; defaults to all of them. */
  factions?: Faction[];
  /** Overrides the ruler draw. */
  ruler?: Faction;
}

const MAX_FEATURES = 3;

const MAX_INHABITANTS = 2;

/** Draw one to `most` distinct entries from `table`. */
function drawAtLeastOne<T>(rng: Rng, table: readonly T[], most: number): T[] {
  return rng.selectRandomSample(table, rng.getRandomIntInclusive(1, most));
}

function drawConflict(rng: Rng, inPlay: Faction[], ruler: Faction): Conflict {
  const challengers: Challenger[] = [
    ...inPlay.filter((faction) => faction !== ruler),
    ...LOCAL_CHALLENGERS,
  ];

  return {
    challenger: rng.selectRandomElement(challengers),
    over: rng.selectRandomElement(CONFLICT_SUBJECTS),
  };
}

/**
 * Generate a Woodland clearing, deterministically on `options.seed`.
 *
 * Supplying `ruler` skips that draw, so the rest of the clearing differs from
 * what the same seed produces without it.
 *
 * Throws when no factions are in play, or when `ruler` is not among them.
 */
export function generateClearing(options: ClearingGeneratorOptions): Clearing {
  const inPlay = factionsInPlay(options.factions);

  if (options.ruler && !inPlay.includes(options.ruler)) {
    throw new Error(
      `Invalid ruler provided: "${options.ruler}". Available choices: ${inPlay.join(", ")}.`,
    );
  }

  const rng = new Rng(options.seed);
  const ruler = options.ruler ?? rng.selectRandomElement(inPlay);

  return {
    features: drawAtLeastOne(rng, CLEARING_FEATURES, MAX_FEATURES),
    inhabitants: drawAtLeastOne(rng, DENIZEN_SPECIES, MAX_INHABITANTS),
    ruler,
    conflict: drawConflict(rng, inPlay, ruler),
    name: rng.selectRandomElement(CLEARING_NAMES),
  };
}

interface ClearingBatchOptions extends ClearingGeneratorOptions {
  count: number;
}

/**
 * Generate `count` clearings, deterministically on `options.seed`.
 *
 * Clearing `n`, counting from one, is `generateClearing` on the seed
 * `${seed}-${n}`, so any one clearing in a batch redraws on its own. For the
 * same reason, two clearings in a batch can share a name.
 */
export function generateClearings({ count, seed, ...options }: ClearingBatchOptions): Clearing[] {
  return Array.from({ length: count }, (_, index) =>
    generateClearing({ ...options, seed: `${seed}-${index + 1}` }),
  );
}
