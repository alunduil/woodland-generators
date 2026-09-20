// SPDX-FileCopyrightText: 2025-2026 Alex Brandt
//
// SPDX-License-Identifier: MIT

import { DemeanorGeneratorOptions, generateDemeanor } from "../../src/generators/demeanor";
import { root } from "../../src/logging";

const CHOICES = ["Curious", "Helpful", "Wary", "Brash"];
const SEED = "test-seed";

function generate(overrides: Partial<DemeanorGeneratorOptions> = {}): string[] {
  return generateDemeanor({ seed: SEED, choices: CHOICES, ...overrides });
}

describe("generateDemeanor", () => {
  beforeEach(() => {
    root.level = "silent";
  });

  it("should return the user-provided demeanor unchanged", () => {
    const provided = ["Wary", "Brash"];

    expect(generate({ demeanor: provided })).toEqual(provided);
  });

  it("should generate a non-empty subset of the choices", () => {
    const demeanor = generate();

    expect(demeanor.length).toBeGreaterThan(0);
    expect(CHOICES).toEqual(expect.arrayContaining(demeanor));
  });

  it("should throw when the user-provided demeanor is not among the choices", () => {
    expect(() => generate({ demeanor: ["Curious", "Sneaky"] })).toThrow(
      "Invalid demeanor provided: Sneaky",
    );
  });

  it("should return the same demeanor for the same seed", () => {
    const seed = "repeatable";

    expect(generate({ seed })).toEqual(generate({ seed }));
  });
});
