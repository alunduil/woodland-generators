// SPDX-FileCopyrightText: 2026 Alex Brandt
//
// SPDX-License-Identifier: MIT

import { HarmInflicted, HarmTracks, Mob, MobMember, MobSize } from "./types";

const BANDS: readonly { size: MobSize; minimum: number; boxes: number; multiplier: number }[] = [
  { size: "large", minimum: 21, boxes: 6, multiplier: 4 },
  { size: "medium", minimum: 11, boxes: 4, multiplier: 3 },
  { size: "small", minimum: 5, boxes: 2, multiplier: 2 },
];

/**
 * Treat `count` NPCs who resemble `member` as a single mob: every harm track
 * gains boxes and every harm inflicted is multiplied, both by size band.
 *
 * @throws {RangeError} When `count` is not an integer of at least 5, the
 *   smallest mob.
 */
export function scaleMob(member: MobMember, count: number): Mob {
  const band = Number.isInteger(count) ? BANDS.find((b) => count >= b.minimum) : undefined;
  if (band === undefined) {
    throw new RangeError(`A mob needs a whole number of at least 5 members, got ${count}`);
  }

  const { injury, exhaustion, wear, morale } = member.harmTracks;
  const harmTracks: HarmTracks = {
    injury: injury + band.boxes,
    exhaustion: exhaustion + band.boxes,
    wear: wear + band.boxes,
    morale: morale + band.boxes,
  };

  const harmInflicted: HarmInflicted = Object.fromEntries(
    Object.entries(member.harmInflicted).map(([harm, amount]) => [harm, amount * band.multiplier]),
  );

  return { size: band.size, harmTracks, harmInflicted };
}
