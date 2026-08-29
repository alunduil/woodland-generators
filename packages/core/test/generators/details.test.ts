// SPDX-FileCopyrightText: 2025-2026 Alex Brandt
//
// SPDX-License-Identifier: MIT

import { generateDetails } from "../../src/generators/details";
import { Details } from "../../src/details";
import { root } from "../../src/logging";

const CHOICES: Details = {
  pronouns: ["they/them", "she/her", "he/him"],
  appearance: ["scarred", "tidy", "weathered"],
  accessories: ["walking stick", "locket", "patched cloak"],
};

describe("generateDetails", () => {
  beforeEach(() => {
    root.level = "silent";
  });

  it("should generate a non-empty subset for every category", () => {
    const details = generateDetails({ seed: "test-seed", choices: CHOICES });

    (Object.keys(CHOICES) as (keyof Details)[]).forEach((category) => {
      expect(details[category].length).toBeGreaterThan(0);
      expect(CHOICES[category]).toEqual(expect.arrayContaining(details[category]));
    });
  });

  it("should use user-provided selections and generate the remaining categories", () => {
    const details = generateDetails({
      seed: "test-seed",
      choices: CHOICES,
      details: { pronouns: ["she/her"] },
    });

    expect(details.pronouns).toEqual(["she/her"]);
    expect(CHOICES.appearance).toEqual(expect.arrayContaining(details.appearance));
    expect(CHOICES.accessories).toEqual(expect.arrayContaining(details.accessories));
  });

  it("should throw when a user-provided selection is not among that category's choices", () => {
    expect(() => {
      generateDetails({
        seed: "test-seed",
        choices: CHOICES,
        details: { accessories: ["locket", "enchanted sword"] },
      });
    }).toThrow("Invalid accessories provided: enchanted sword");
  });

  it("should return the same details for the same seed", () => {
    const first = generateDetails({ seed: "repeatable", choices: CHOICES });
    const second = generateDetails({ seed: "repeatable", choices: CHOICES });

    expect(first).toEqual(second);
  });
});
