// SPDX-FileCopyrightText: 2026 Alex Brandt
//
// SPDX-License-Identifier: MIT

import { Rng } from "@woodland-generators/random";

import { type Faction } from "./clearing-tables.js";
import { factionsInPlay } from "./factions-in-play.js";
import {
  MINOR_FACTION_AIMS,
  MINOR_FACTION_KINDS,
  MINOR_FACTION_LEVERAGE,
  MINOR_FACTION_METHODS,
  MINOR_FACTION_POSTURES,
  NAME_DESCRIPTORS,
  NAME_EMBLEMS,
  type MinorFactionAim,
  type MinorFactionKind,
  type MinorFactionLeverage,
  type MinorFactionMethod,
  type MinorFactionPosture,
} from "./minor-faction-tables.js";

/** How a minor faction stands toward one great power. */
interface Stance {
  power: Faction;
  /** What the minor faction does about that power. */
  posture: MinorFactionPosture;
}

/** An outfit operating beneath the great powers at clearing scale. */
export interface MinorFaction {
  /** What the clearing calls the outfit. */
  name: string;
  /** What sort of outfit it is. */
  kind: MinorFactionKind;
  /** What it is after in its clearing. */
  aim: MinorFactionAim;
  /** How it pursues that aim. */
  method: MinorFactionMethod;
  /** What gives it a grip on the clearing. */
  leverage: MinorFactionLeverage;
  /** Its posture toward each great power it deals with, never the same power twice. */
  stances: Stance[];
}

export interface MinorFactionGeneratorOptions {
  seed: string;
  /** The great powers in play in this Woodland; defaults to all of them. */
  factions?: Faction[];
}

const MAX_STANCES = 2;

function drawName(rng: Rng, kind: MinorFactionKind): string {
  const descriptor = rng.selectRandomElement(NAME_DESCRIPTORS);
  const emblem = rng.selectRandomElement(NAME_EMBLEMS);
  const title = kind.charAt(0).toUpperCase() + kind.slice(1);

  return `The ${descriptor} ${emblem} ${title}`;
}

function drawStances(rng: Rng, inPlay: Faction[]): Stance[] {
  const powers = rng.selectRandomSample(
    inPlay,
    rng.getRandomIntInclusive(1, Math.min(MAX_STANCES, inPlay.length)),
  );

  return powers.map((power) => ({
    power,
    posture: rng.selectRandomElement(MINOR_FACTION_POSTURES),
  }));
}

/**
 * Generate a minor faction, deterministically on `options.seed`.
 *
 * Throws when no great powers are in play, since every minor faction takes a
 * stance toward at least one.
 */
export function generateMinorFaction(options: MinorFactionGeneratorOptions): MinorFaction {
  const inPlay = factionsInPlay(options.factions);
  const rng = new Rng(options.seed);
  const kind = rng.selectRandomElement(MINOR_FACTION_KINDS);

  return {
    name: drawName(rng, kind),
    kind,
    aim: rng.selectRandomElement(MINOR_FACTION_AIMS),
    method: rng.selectRandomElement(MINOR_FACTION_METHODS),
    leverage: rng.selectRandomElement(MINOR_FACTION_LEVERAGE),
    stances: drawStances(rng, inPlay),
  };
}
