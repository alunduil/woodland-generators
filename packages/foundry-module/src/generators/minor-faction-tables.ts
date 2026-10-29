// SPDX-FileCopyrightText: 2026 Alex Brandt
//
// SPDX-License-Identifier: MIT

/**
 * The content a minor faction is drawn from. Each table states the rule an
 * entry has to satisfy.
 */

/**
 * What sort of outfit it is.
 *
 * An entry qualifies when it names a group that operates at clearing scale and
 * reads as a title, since it closes the faction's name.
 */
export const MINOR_FACTION_KINDS = ["guild", "gang", "cult", "company", "crew"] as const;

export type MinorFactionKind = (typeof MINOR_FACTION_KINDS)[number];

/**
 * The adjective opening a faction's name.
 *
 * An entry qualifies when it shares no word with a great power's name, so a
 * minor faction never reads as one.
 */
export const NAME_DESCRIPTORS = [
  "Crooked",
  "Gilded",
  "Hollow",
  "Ashen",
  "Silent",
  "Thorned",
  "Mossy",
  "Lantern-lit",
  "Copper",
  "Tallow",
  "Muddy",
  "Bramble",
  "Pale",
  "Last",
] as const;

/**
 * The emblem a faction's name is built around.
 *
 * An entry qualifies when it is an everyday Woodland object or creature and
 * shares no word with a great power's name.
 */
export const NAME_EMBLEMS = [
  "Acorn",
  "Lantern",
  "Millstone",
  "Thimble",
  "Hook",
  "Kettle",
  "Moth",
  "Spindle",
  "Key",
  "Wheel",
  "Candle",
  "Feather",
  "Bell",
  "Root",
] as const;

/**
 * What the faction is after in its clearing.
 *
 * An entry qualifies when a table can tell whether it has been achieved.
 */
export const MINOR_FACTION_AIMS = [
  "control the toll at the crossing",
  "drive a rival outfit out of the clearing",
  "corner the market in salt",
  "free a member held in the ruler's cells",
  "reopen the shrine the ruler sealed",
  "buy the watermill outright",
  "collect on a debt the clearing owes",
  "put their own voice on the clearing's council",
  "smuggle a cargo through before the thaw",
  "recover a relic stolen from their founder",
] as const;

export type MinorFactionAim = (typeof MINOR_FACTION_AIMS)[number];

/**
 * How the faction pursues its aim.
 *
 * An entry qualifies when it suggests a scene the vagabonds can walk into.
 */
export const MINOR_FACTION_METHODS = [
  "bribery",
  "blackmail",
  "sabotage at night",
  "petitions and public shaming",
  "price-fixing",
  "kidnapping",
  "sermons in the square",
  "forged papers",
  "hired muscle",
  "patient favour-trading",
] as const;

export type MinorFactionMethod = (typeof MINOR_FACTION_METHODS)[number];

/**
 * What gives the faction its grip on the clearing.
 *
 * An entry qualifies when taking it away would break the faction's hold.
 */
export const MINOR_FACTION_LEVERAGE = [
  "the only ferry across the river",
  "the ledger of every debt in the clearing",
  "the granary keys",
  "a garrison officer in their pocket",
  "the loyalty of the dockworkers",
  "a secret about the ruler's family",
  "the clearing's only healer",
  "a cache of weapons beneath the chapel",
  "the trade route's maps",
  "the denizens' faith",
] as const;

export type MinorFactionLeverage = (typeof MINOR_FACTION_LEVERAGE)[number];

/**
 * How the faction stands toward a great power.
 *
 * An entry qualifies when it implies what the faction does when that power's
 * soldiers walk into the clearing.
 */
export const MINOR_FACTION_POSTURES = [
  "openly allied with",
  "secretly paid by",
  "openly defiant of",
  "informing on",
  "hiding from",
  "trading with",
  "owed a favour by",
  "sworn to undermine",
] as const;

export type MinorFactionPosture = (typeof MINOR_FACTION_POSTURES)[number];
