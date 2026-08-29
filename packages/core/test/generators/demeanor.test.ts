// SPDX-FileCopyrightText: 2025-2026 Alex Brandt
//
// SPDX-License-Identifier: MIT

import { generateDemeanor } from "../../src/generators/demeanor";
import { root } from "../../src/logging";

const CHOICES = ["Curious", "Helpful", "Wary", "Brash"];

describe("generateDemeanor", () => {
  beforeEach(() => {
    root.level = "silent";
  });

  it("should return the user-provided demeanor unchanged", () => {
    const demeanor = generateDemeanor({
      seed: "test-seed",
      choices: CHOICES,
      demeanor: ["Wary", "Brash"],
    });

    expect(demeanor).toEqual(["Wary", "Brash"]);
  });

  it("should generate a non-empty subset of the choices", () => {
    const demeanor = generateDemeanor({ seed: "test-seed", choices: CHOICES });

    expect(demeanor.length).toBeGreaterThan(0);
    expect(CHOICES).toEqual(expect.arrayContaining(demeanor));
  });

  it("should throw when the user-provided demeanor is not among the choices", () => {
    expect(() => {
      generateDemeanor({
        seed: "test-seed",
        choices: CHOICES,
        demeanor: ["Curious", "Sneaky"],
      });
    }).toThrow("Invalid demeanor provided: Sneaky");
  });

  it("should return the same demeanor for the same seed", () => {
    const first = generateDemeanor({ seed: "repeatable", choices: CHOICES });
    const second = generateDemeanor({ seed: "repeatable", choices: CHOICES });

    expect(first).toEqual(second);
  });
});
