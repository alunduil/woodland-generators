// SPDX-FileCopyrightText: 2025-2026 Alex Brandt
//
// SPDX-License-Identifier: MIT

import { Rng } from "@woodland-generators/random";

/**
 * The factions contesting the Woodland.
 *
 * The setting's cast rather than table contents: a generated clearing has to
 * name a ruler that a Root table, a player, and the rest of the module all
 * recognise, so this roster is fixed where the tables below are swappable.
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
 * Every entry is somewhere a scene can happen and a reason denizens pass
 * through, so the list holds working structures rather than scenery. Each is
 * also something a faction can tax, seize, or burn, which is what lets a
 * feature feed the conflict drawn alongside it.
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
 * Narrower than the species a single character can be. A clearing is settled
 * by whoever farms it, builds it, and turns out to defend it, so solitary
 * hunters and canopy specialists are absent here even though a character can
 * be one. Mice, rabbits, and foxes lead because the Woodland's clearings are
 * theirs; the rest keep the draw from collapsing onto three outcomes.
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
 * A conflict needs a challenger the ruler cannot simply outspend or outmarch,
 * and the other factions are not always nearby. These keep a clearing's
 * trouble local when the woodland around it is quiet.
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
 * Each subject is something the table can act on in a session: it names a
 * resource, an obligation, or a person, not an abstract grievance.
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

/** The trouble the clearing is in right now. */
interface Conflict {
  /** Who is pushing back against the ruling faction. */
  challenger: Challenger;
  /** What the two sides are fighting over. */
  over: ConflictSubject;
}

/** A generated Woodland clearing. */
export interface Clearing {
  /** What the clearing is known for. */
  features: ClearingFeature[];
  /** The species living there, most numerous first. */
  inhabitants: DenizenSpecies[];
  /** The faction holding the clearing. */
  ruler: Faction;
  /** The trouble it is in. */
  conflict: Conflict;
}

/** Options for clearing generation. */
export interface ClearingGeneratorOptions {
  /** Seed for reproducible random generation. */
  seed: string;
  /** Factions in play in this woodland; defaults to every faction. */
  factions?: Faction[];
  /** Ruling faction, chosen by the user rather than drawn. */
  ruler?: Faction;
}

/** Most features one clearing is known for. */
const MAX_FEATURES = 3;

/** Most species that share one clearing. */
const MAX_INHABITANTS = 2;

/**
 * The factions this woodland has in it, every faction unless narrowed.
 *
 * Throws rather than return a roster no clearing can be drawn from: one with
 * nobody in it, or one without room for the ruler the caller chose.
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

/**
 * Draw the trouble the clearing is in.
 *
 * A ruler does not contest what it already holds, and a faction this woodland
 * has no room for cannot arrive to contest it either, so the pool is whatever
 * the roster has left plus the parties already inside the clearing.
 */
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
 * Generate a Woodland clearing.
 *
 * Deterministic on `options.seed`: the same options produce the same clearing.
 * Supplying `ruler` skips its draw rather than discarding it, so an overridden
 * clearing differs from the drawn one in more than its ruler.
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
