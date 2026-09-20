// SPDX-FileCopyrightText: 2025-2026 Alex Brandt
//
// SPDX-License-Identifier: MIT

import { Rng } from "@woodland-generators/random";

/**
 * The factions contesting the Woodland.
 *
 * Stays fixed while the tables in this file stay swappable: a clearing's
 * ruler has to be a name the rest of the module recognises.
 */
export const FACTIONS = [
  "Marquisate",
  "Eyrie Dynasties",
  "Woodland Alliance",
  "Riverfolk Company",
  "Corvid Conspiracy",
  "Lizard Cult",
  "Grand Duchy",
  "Lord of the Hundreds",
  "Keepers in Iron",
] as const;

export type Faction = (typeof FACTIONS)[number];

/**
 * What a clearing is known for.
 *
 * An entry qualifies when it is somewhere a scene can happen and something a
 * faction can take, so a feature can feed the conflict drawn beside it.
 */
export const CLEARING_FEATURES = [
  "watermill",
  "stone granary",
  "hilltop shrine",
  "weekly market",
  "timber yard",
  "river ford",
  "slate quarry",
  "tannery",
  "brewery",
  "burnt-out keep",
  "wayhouse and stable",
  "smithy",
  "root cellars beneath the square",
  "rope bridge to the far bank",
  "apple orchard",
  "fishing weirs",
  "clay pits",
  "bell tower",
] as const;

type ClearingFeature = (typeof CLEARING_FEATURES)[number];

/**
 * Species that hold a clearing in numbers.
 *
 * An entry qualifies when it settles and defends ground, which leaves out the
 * solitary hunters and canopy specialists a single character may still be.
 */
export const DENIZEN_SPECIES = [
  "mice",
  "rabbits",
  "foxes",
  "hedgehogs",
  "moles",
  "squirrels",
  "badgers",
  "otters",
  "beavers",
  "voles",
  "shrews",
  "magpies",
] as const;

type DenizenSpecies = (typeof DENIZEN_SPECIES)[number];

/**
 * Parties that contest a clearing without flying a faction's banner.
 *
 * Keeps the challenger pool populated when the ruler is the only faction in
 * play.
 */
export const LOCAL_CHALLENGERS = [
  "the clearing's own denizens",
  "a smugglers' ring",
  "a band of vagabonds",
  "the craftsfolk guild",
  "an exiled noble's retinue",
  "a company of unpaid mercenaries",
  "the wayhouse keeper and her creditors",
] as const;

type LocalChallenger = (typeof LOCAL_CHALLENGERS)[number];

/** Who the ruling faction is up against. */
type Challenger = Faction | LocalChallenger;

/**
 * What the two sides want that only one can have.
 *
 * An entry qualifies when it names something concrete a table can act on: a
 * resource, an obligation, a person.
 */
export const CONFLICT_SUBJECTS = [
  "a levy the clearing cannot pay",
  "conscription into the ruler's ranks",
  "the harvest stored against winter",
  "a prisoner held without charge",
  "the tolls taken at the crossing",
  "who speaks for the clearing in council",
  "a shrine both sides claim",
  "the road the trade caravans take",
  "timber rights in the surrounding wood",
  "a murder no one will answer for",
  "the garrison quartered in denizens' homes",
  "a debt owed to someone now dead",
] as const;

type ConflictSubject = (typeof CONFLICT_SUBJECTS)[number];

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
