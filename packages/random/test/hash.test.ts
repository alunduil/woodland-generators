// SPDX-FileCopyrightText: 2025-2026 Alex Brandt
//
// SPDX-License-Identifier: MIT

import { hashSeed } from "../src/hash";

describe("hashSeed", () => {
  // The reference vectors are ASCII, where the UTF-16 code units hashSeed
  // digests coincide with the UTF-8 bytes FNV-1a defines.
  it.each([
    ["", 0x811c9dc5],
    ["a", 0xe40c292c],
    ["b", 0xe70c2de5],
    ["c", 0xe60c2c52],
    ["d", 0xe10c2473],
    ["e", 0xe00c22e0],
    ["f", 0xe30c2799],
    ["fo", 0x6222e842],
    ["foo", 0xa9f37ed7],
    ["foob", 0x3f5076ef],
    ["fooba", 0x39aaa18a],
    ["foobar", 0xbf9cf968],
  ])("hashes %p to the FNV-1a reference digest", (input, expected) => {
    expect(hashSeed(input)).toBe(expected);
  });

  it("returns an unsigned 32-bit integer", () => {
    for (const seed of ["", "a", "woodland", "\u{1f98a}", "z".repeat(1000)]) {
      const digest = hashSeed(seed);

      expect(Number.isInteger(digest)).toBe(true);
      expect(digest).toBeGreaterThanOrEqual(0);
      expect(digest).toBeLessThanOrEqual(0xffffffff);
    }
  });
});
