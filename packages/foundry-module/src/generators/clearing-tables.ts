// SPDX-FileCopyrightText: 2025-2026 Alex Brandt
//
// SPDX-License-Identifier: MIT

/**
 * The content a clearing is drawn from. Each table states the rule an entry
 * has to satisfy.
 */

/**
 * The factions contesting the Woodland.
 *
 * The seven the roleplaying game supports: three in the Core Book and four
 * more in Travelers & Outsiders.
 */
export const FACTIONS = [
  "Marquisate",
  "Eyrie Dynasties",
  "Woodland Alliance",
  "Riverfolk Company",
  "Corvid Conspiracy",
  "Lizard Cult",
  "Grand Duchy",
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

export type ClearingFeature = (typeof CLEARING_FEATURES)[number];

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

export type DenizenSpecies = (typeof DENIZEN_SPECIES)[number];

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
export type Challenger = Faction | LocalChallenger;

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

export type ConflictSubject = (typeof CONFLICT_SUBJECTS)[number];
