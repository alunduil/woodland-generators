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

describe("selectUniqueRandomElements", () => {
  it("returns distinct elements drawn from the pool", () => {
    const selected = new Rng("woodland").selectUniqueRandomElements(POOL, 4);

    expect(selected).toHaveLength(4);
    expect(new Set(selected).size).toBe(4);
    expect(POOL).toEqual(expect.arrayContaining(selected));
  });

  it("truncates to the pool when asked for more than it holds", () => {
    const selected = new Rng("woodland").selectUniqueRandomElements(POOL, POOL.length + 3);

    expect([...selected].sort()).toEqual([...POOL].sort());
  });

  it("leaves the caller's pool untouched", () => {
    const pool = [...POOL];

    new Rng("woodland").selectUniqueRandomElements(pool, 3);

    expect(pool).toEqual(POOL);
  });
});
