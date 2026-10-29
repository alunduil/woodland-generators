// SPDX-FileCopyrightText: 2026 Alex Brandt
//
// SPDX-License-Identifier: MIT

import { Rng } from "@woodland-generators/random";

import {
  CLEARING_NAMES,
  DOMINANT_COMMUNITIES,
  type ClearingName,
  type DominantCommunity,
} from "./clearing-tables.js";

interface WoodlandClearing {
  name: ClearingName;
  community: DominantCommunity;
}

/** The two clearings a path joins. */
type Path = readonly [ClearingName, ClearingName];

export interface Woodland {
  clearings: WoodlandClearing[];
  paths: Path[];
  /**
   * Paths that lead out of a clearing and reach nothing, one entry per path
   * naming the clearing it leaves.
   */
  unfinishedPaths: ClearingName[];
}

export interface WoodlandGeneratorOptions {
  seed: string;
}

const CLEARING_COUNT = 12;

const MAX_PER_COMMUNITY = 4;

/** 2d6 read against the Core Book's number-of-paths bands. */
function rollPathCount(rng: Rng): number {
  const roll = rng.getRandomIntInclusive(1, 6) + rng.getRandomIntInclusive(1, 6);

  if (roll === 2) return 1;
  if (roll <= 4) return 2;
  if (roll <= 9) return 3;
  if (roll <= 11) return 4;
  return 5;
}

/** Drawing only from communities below the cap is rerolling a full one. */
function drawCommunity(rng: Rng, placed: WoodlandClearing[]): DominantCommunity {
  const available = DOMINANT_COMMUNITIES.filter(
    (community) =>
      placed.filter((clearing) => clearing.community === community).length < MAX_PER_COMMUNITY,
  );

  return rng.selectRandomElement(available);
}

/** Remove and return a random entry of `unfinished` that `eligible` accepts. */
function takeUnfinished(
  rng: Rng,
  unfinished: ClearingName[],
  eligible: (name: ClearingName) => boolean = () => true,
): ClearingName | undefined {
  const indices = unfinished.flatMap((name, index) => (eligible(name) ? [index] : []));

  if (indices.length === 0) {
    return undefined;
  }

  return unfinished.splice(rng.selectRandomElement(indices), 1)[0];
}

/**
 * Generate a Woodland map, deterministically on `options.seed`.
 *
 * Follows the Core Book's procedure: each clearing after the first sits at the
 * end of an unfinished path, and its remaining paths join other unfinished
 * paths where they can before new ones are drawn. A clearing that would close
 * the last unfinished path before the map is full rerolls its path count, so
 * the map is always one connected graph.
 */
export function generateWoodland({ seed }: WoodlandGeneratorOptions): Woodland {
  const rng = new Rng(seed);
  const clearings: WoodlandClearing[] = [];
  const paths: Path[] = [];
  const unfinished: ClearingName[] = [];

  for (const name of rng.selectRandomSample([...CLEARING_NAMES], CLEARING_COUNT)) {
    const community = drawCommunity(rng, clearings);
    const stillToPlace = CLEARING_COUNT - clearings.length - 1;
    const neighbours = new Set<ClearingName>();

    const arrival = takeUnfinished(rng, unfinished);
    if (arrival) {
      neighbours.add(arrival);
    }

    let pathCount = rollPathCount(rng);
    while (stillToPlace > 0 && unfinished.length === 0 && pathCount === neighbours.size) {
      pathCount = rollPathCount(rng);
    }

    let newPaths = 0;
    for (let remaining = pathCount - neighbours.size; remaining > 0; remaining--) {
      // Counts every later path as drawn, since each of those may join too.
      const openIfJoined = unfinished.length - 1 + newPaths + (remaining - 1);
      const canJoin = stillToPlace === 0 || openIfJoined > 0;
      const joined = canJoin
        ? takeUnfinished(rng, unfinished, (other) => !neighbours.has(other))
        : undefined;

      if (joined) {
        neighbours.add(joined);
      } else {
        newPaths++;
      }
    }

    clearings.push({ name, community });
    paths.push(...[...neighbours].map((neighbour): Path => [neighbour, name]));
    unfinished.push(...Array<ClearingName>(newPaths).fill(name));
  }

  return { clearings, paths, unfinishedPaths: unfinished };
}
