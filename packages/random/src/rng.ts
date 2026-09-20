// SPDX-FileCopyrightText: 2025-2026 Alex Brandt
//
// SPDX-License-Identifier: MIT

import { uniformInt } from "pure-rand/distribution/uniformInt";
import { xoroshiro128plus } from "pure-rand/generator/xoroshiro128plus";
import type { RandomGenerator } from "pure-rand/types/RandomGenerator";

import { hashSeed } from "./hash";

/**
 * Seedable random helper over pure-rand.
 *
 * Wraps the handful of operations the generators need behind a stable API so
 * the underlying PRNG stays swappable.
 */
export class Rng {
  private readonly generator: RandomGenerator;

  constructor(seed: string) {
    this.generator = xoroshiro128plus(hashSeed(seed));
  }

  /**
   * Random integer in the inclusive range [min, max].
   *
   * pure-rand answers an inverted range with a value outside it rather than
   * failing, so the bounds are checked here.
   */
  getRandomIntInclusive(min: number, max: number): number {
    if (min > max) {
      throw new Error(`Cannot draw from the empty range [${min}, ${max}]`);
    }

    return uniformInt(this.generator, min, max);
  }

  /** Pick a single element uniformly at random. */
  selectRandomElement<T>(elements: T[]): T {
    if (elements.length === 0) {
      throw new Error("Cannot select an element from an empty array");
    }

    return elements[this.getRandomIntInclusive(0, elements.length - 1)]!;
  }

  /**
   * Sample `count` elements without replacement, via a partial Fisher-Yates
   * shuffle. Returns fewer than `count` only when the pool is smaller.
   *
   * Positions are sampled rather than values, so a pool holding the same value
   * twice can yield that value twice.
   */
  selectRandomSample<T>(elements: T[], count: number): T[] {
    if (count < 0) {
      throw new Error(`Cannot sample a negative number of elements: ${count}`);
    }

    const pool = [...elements];
    const take = Math.min(count, pool.length);

    for (let i = 0; i < take; i++) {
      const j = this.getRandomIntInclusive(i, pool.length - 1);
      [pool[i], pool[j]] = [pool[j]!, pool[i]!];
    }

    return pool.slice(0, take);
  }
}
