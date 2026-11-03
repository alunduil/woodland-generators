// SPDX-FileCopyrightText: 2026 Alex Brandt
//
// SPDX-License-Identifier: MIT

import { HarmInflicted, HarmTracks, Mob, MobMember, MobSize } from "./types";

interface Band {
  size: MobSize;
  minimum: number;
  boxes: number;
  multiplier: number;
}

/** Largest first, so the first band a count reaches is its own. */
const BANDS: readonly Band[] = [
  { size: "large", minimum: 21, boxes: 6, multiplier: 4 },
  { size: "medium", minimum: 11, boxes: 4, multiplier: 3 },
  { size: "small", minimum: 5, boxes: 2, multiplier: 2 },
];

const SMALLEST_MOB = Math.min(...BANDS.map((b) => b.minimum));

function bandFor(count: number): Band {
  const band = Number.isInteger(count) ? BANDS.find((b) => count >= b.minimum) : undefined;
  if (band === undefined) {
    throw new RangeError(
      `A mob needs a whole number of at least ${SMALLEST_MOB} members, got ${count}`,
    );
  }
  return band;
}

function addBoxes(tracks: HarmTracks, boxes: number): HarmTracks {
  return {
    injury: tracks.injury + boxes,
    exhaustion: tracks.exhaustion + boxes,
    wear: tracks.wear + boxes,
    morale: tracks.morale + boxes,
  };
}

function multiplyHarm(harm: HarmInflicted, multiplier: number): HarmInflicted {
  return Object.fromEntries(
    Object.entries(harm).map(([type, amount]) => [type, amount * multiplier]),
  );
}

/**
 * Scale an average `member` into a mob of `count` NPCs by the Core Book's
 * size bands (ch. 8, "NPC Groups").
 *
 * @throws {RangeError} When `count` is not a whole number of at least 5.
 */
export function scaleMob(member: MobMember, count: number): Mob {
  const band = bandFor(count);
  return {
    size: band.size,
    harmTracks: addBoxes(member.harmTracks, band.boxes),
    harmInflicted: multiplyHarm(member.harmInflicted, band.multiplier),
  };
}
