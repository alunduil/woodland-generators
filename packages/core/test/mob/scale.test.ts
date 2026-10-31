// SPDX-FileCopyrightText: 2026 Alex Brandt
//
// SPDX-License-Identifier: MIT

import { scaleMob } from "../../src/mob/scale";
import { MobMember } from "../../src/mob/types";

const DENIZEN: MobMember = {
  harmTracks: { injury: 1, exhaustion: 1, wear: 1, morale: 1 },
  harmInflicted: { injury: 1 },
};

const SOLDIER: MobMember = {
  harmTracks: { injury: 3, exhaustion: 3, wear: 3, morale: 3 },
  harmInflicted: { injury: 2 },
};

describe("scaleMob", () => {
  it.each([
    [5, "small"],
    [10, "small"],
    [11, "medium"],
    [20, "medium"],
    [21, "large"],
    [500, "large"],
  ])("should place %i members in the %s band", (count, size) => {
    expect(scaleMob(DENIZEN, count).size).toBe(size);
  });

  it.each([
    ["denizens", DENIZEN, 5, 3, 2],
    ["denizens", DENIZEN, 11, 5, 3],
    ["denizens", DENIZEN, 21, 7, 4],
    ["soldiers", SOLDIER, 5, 5, 4],
    ["soldiers", SOLDIER, 11, 7, 6],
    ["soldiers", SOLDIER, 21, 9, 8],
  ])(
    "should scale %s to the book's example at %i members",
    (_name, member, count, boxes, injury) => {
      expect(scaleMob(member, count)).toMatchObject({
        harmTracks: { injury: boxes, exhaustion: boxes, wear: boxes, morale: boxes },
        harmInflicted: { injury },
      });
    },
  );

  it("should scale each track from its own size", () => {
    const member: MobMember = {
      harmTracks: { injury: 2, exhaustion: 1, wear: 0, morale: 4 },
      harmInflicted: { injury: 1 },
    };

    expect(scaleMob(member, 11).harmTracks).toEqual({
      injury: 6,
      exhaustion: 5,
      wear: 4,
      morale: 8,
    });
  });

  it("should multiply every harm type inflicted and add none", () => {
    const member: MobMember = { ...DENIZEN, harmInflicted: { injury: 1, wear: 2 } };

    expect(scaleMob(member, 21).harmInflicted).toEqual({ injury: 4, wear: 8 });
  });

  it.each([0, 4, -5, 7.5, NaN, Infinity])("should reject %p members", (count) => {
    expect(() => scaleMob(DENIZEN, count)).toThrow(RangeError);
  });
});
