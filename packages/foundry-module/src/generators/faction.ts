// SPDX-FileCopyrightText: 2026 Alex Brandt
//
// SPDX-License-Identifier: MIT

import { Rng } from "@woodland-generators/random";

import { FACTIONS, type Faction } from "./clearing-tables.js";
import {
  FACTION_AIMS,
  FACTION_KINDS,
  FACTION_LEVERAGE,
  FACTION_METHODS,
  FACTION_POSTURES,
  NAME_DESCRIPTORS,
  NAME_EMBLEMS,
  type FactionAim,
  type FactionKind,
  type FactionLeverage,
  type FactionMethod,
  type FactionPosture,
} from "./faction-tables.js";

/** How a minor faction stands toward one great power. */
interface Stance {
  /** The great power the stance is toward. */
  power: Faction;
  /** What the minor faction does about that power. */
  posture: FactionPosture;
}

/** An outfit operating beneath the great powers at clearing scale. */
export interface MinorFaction {
  /** What the clearing calls the outfit. */
  name: string;
  /** What sort of outfit it is. */
  kind: FactionKind;
  /** What it is after in its clearing. */
  aim: FactionAim;
  /** How it pursues that aim. */
  method: FactionMethod;
  /** What gives it a grip on the clearing. */
  leverage: FactionLeverage;
  /** Its posture toward each great power it deals with, never the same power twice. */
  stances: Stance[];
}

export interface FactionGeneratorOptions {
  seed: string;
  /** The great powers in play in this Woodland; defaults to all of them. */
  factions?: Faction[];
}

const MAX_STANCES = 2;

function drawName(rng: Rng, kind: FactionKind): string {
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
    posture: rng.selectRandomElement(FACTION_POSTURES),
  }));
}

/**
 * Generate a minor faction, deterministically on `options.seed`.
 *
 * Throws when no great powers are in play, since every minor faction takes a
 * stance toward at least one.
 */
export function generateFaction(options: FactionGeneratorOptions): MinorFaction {
  const inPlay = options.factions ?? [...FACTIONS];

  if (inPlay.length === 0) {
    throw new Error("No great powers available to take a stance toward");
  }

  const rng = new Rng(options.seed);
  const kind = rng.selectRandomElement(FACTION_KINDS);

  return {
    name: drawName(rng, kind),
    kind,
    aim: rng.selectRandomElement(FACTION_AIMS),
    method: rng.selectRandomElement(FACTION_METHODS),
    leverage: rng.selectRandomElement(FACTION_LEVERAGE),
    stances: drawStances(rng, inPlay),
  };
}
