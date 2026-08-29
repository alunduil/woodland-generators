// SPDX-FileCopyrightText: 2025-2026 Alex Brandt
//
// SPDX-License-Identifier: MIT

import { DetailsGeneratorOptions, generateDetails } from "../../src/generators/details";
import { Details } from "../../src/details";
import { root } from "../../src/logging";

const CHOICES: Details = {
  pronouns: ["they/them", "she/her", "he/him"],
  appearance: ["scarred", "tidy", "weathered"],
  accessories: ["walking stick", "locket", "patched cloak"],
};

const CATEGORIES = Object.keys(CHOICES) as (keyof Details)[];

const SEED = "test-seed";

function generate(overrides: Partial<DetailsGeneratorOptions> = {}): Details {
  return generateDetails({ seed: SEED, choices: CHOICES, ...overrides });
}

function expectNonEmptySubset(actual: string[], choices: string[]): void {
  expect(actual.length).toBeGreaterThan(0);
  expect(choices).toEqual(expect.arrayContaining(actual));
}

describe("generateDetails", () => {
  beforeEach(() => {
    root.level = "silent";
  });

  it("should generate a non-empty subset for every category", () => {
    const details = generate();

    CATEGORIES.forEach((category) => {
      expectNonEmptySubset(details[category], CHOICES[category]);
    });
  });

  it("should use user-provided selections and generate the remaining categories", () => {
    const details = generate({ details: { pronouns: ["she/her"] } });

    expect(details.pronouns).toEqual(["she/her"]);
    expectNonEmptySubset(details.appearance, CHOICES.appearance);
    expectNonEmptySubset(details.accessories, CHOICES.accessories);
  });

  it("should throw when a user-provided selection is not among that category's choices", () => {
    expect(() => generate({ details: { accessories: ["locket", "enchanted sword"] } })).toThrow(
      "Invalid accessories provided: enchanted sword",
    );
  });

  it("should return the same details for the same seed", () => {
    const seed = "repeatable";

    expect(generate({ seed })).toEqual(generate({ seed }));
  });
});
