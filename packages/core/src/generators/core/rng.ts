// SPDX-FileCopyrightText: 2025-2026 Alex Brandt
//
// SPDX-License-Identifier: MIT

import { uniformInt } from "pure-rand/distribution/uniformInt";
import { xoroshiro128plus } from "pure-rand/generator/xoroshiro128plus";
import type { RandomGenerator } from "pure-rand/types/RandomGenerator";

/**
 * Derive a 32-bit seed from a string via cyrb53.
 *
 * pure-rand generators take a numeric seed, but every generator is seeded from
 * a user-facing string. cyrb53 gives well-dispersed output so distinct seed
 * strings produce distinct random streams.
 */
function hashSeed(seed: string): number {
  let h1 = 0xdeadbeef;
  let h2 = 0x41c6ce57;

  for (let i = 0; i < seed.length; i++) {
    const ch = seed.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }

  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
  h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507);
  h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909);

  return (h1 ^ h2) >>> 0;
}

/**
 * Seedable random helper over pure-rand.
 *
 * Wraps the handful of operations the generators need behind a stable API so
 * the underlying PRNG stays swappable.
 */
export class Rng {
  private readonly generator: RandomGenerator;

  constructor(seed: string | number) {
    this.generator = xoroshiro128plus(typeof seed === "number" ? seed : hashSeed(seed));
  }

  /** Random integer in the inclusive range [min, max]. */
  getRandomIntInclusive(min: number, max: number): number {
    return uniformInt(this.generator, min, max);
  }

  /** Pick a single element uniformly at random. */
  selectRandomElement<T>(elements: T[]): T {
    return elements[this.getRandomIntInclusive(0, elements.length - 1)]!;
  }

  /**
   * Pick `count` distinct elements via a partial Fisher-Yates shuffle. Returns
   * fewer than `count` only when the pool is smaller than requested.
   */
  selectUniqueRandomElements<T>(elements: T[], count: number): T[] {
    const pool = [...elements];
    const take = Math.min(count, pool.length);

    for (let i = 0; i < take; i++) {
      const j = this.getRandomIntInclusive(i, pool.length - 1);
      [pool[i], pool[j]] = [pool[j]!, pool[i]!];
    }

    return pool.slice(0, take);
  }
}
