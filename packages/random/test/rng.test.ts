// SPDX-FileCopyrightText: 2025-2026 Alex Brandt
//
// SPDX-License-Identifier: MIT

import { Rng } from "../src/rng";

const POOL = ["ash", "birch", "cedar", "dogwood", "elm", "fir"];

describe("Rng", () => {
  it("replays the same draws for the same seed", () => {
    const draws = (): number[] => {
      const rng = new Rng("woodland");
      return [0, 1, 2, 3, 4].map(() => rng.getRandomIntInclusive(0, 1000));
    };

    expect(draws()).toEqual(draws());
  });

  it("draws differently for different seeds", () => {
    const draws = (seed: string): number[] => {
      const rng = new Rng(seed);
      return [0, 1, 2, 3, 4].map(() => rng.getRandomIntInclusive(0, 1000));
    };

    expect(draws("woodland")).not.toEqual(draws("marshland"));
  });
});

describe("getRandomIntInclusive", () => {
  it("draws within the inclusive bounds", () => {
    const rng = new Rng("woodland");

    for (let i = 0; i < 100; i++) {
      const drawn = rng.getRandomIntInclusive(3, 5);

      expect(drawn).toBeGreaterThanOrEqual(3);
      expect(drawn).toBeLessThanOrEqual(5);
    }
  });

  it("draws the bound itself when the range holds one value", () => {
    expect(new Rng("woodland").getRandomIntInclusive(7, 7)).toBe(7);
  });
});

describe("selectRandomElement", () => {
  it("returns an element of the array", () => {
    expect(POOL).toContain(new Rng("woodland").selectRandomElement(POOL));
  });
});

describe("selectRandomSample", () => {
  it("returns elements drawn from distinct positions", () => {
    const selected = new Rng("woodland").selectRandomSample(POOL, 4);

    expect(selected).toHaveLength(4);
    expect(new Set(selected).size).toBe(4);
    expect(POOL).toEqual(expect.arrayContaining(selected));
  });

  it("truncates to the pool when asked for more than it holds", () => {
    const selected = new Rng("woodland").selectRandomSample(POOL, POOL.length + 3);

    expect([...selected].sort()).toEqual([...POOL].sort());
  });

  it("returns nothing when asked for nothing", () => {
    expect(new Rng("woodland").selectRandomSample(POOL, 0)).toEqual([]);
  });

  it("leaves the caller's pool untouched", () => {
    const pool = [...POOL];

    new Rng("woodland").selectRandomSample(pool, 3);

    expect(pool).toEqual(POOL);
  });

  // Positions are sampled, not values, so the name promises no more than that.
  it("can repeat a value the pool holds twice", () => {
    const drawn = new Set<string>();

    for (let i = 0; i < 40; i++) {
      drawn.add(new Rng(`seed-${i}`).selectRandomSample(["ash", "ash", "birch"], 2).join());
    }

    expect(drawn).toContain("ash,ash");
  });
});
