// SPDX-FileCopyrightText: 2025-2026 Alex Brandt
//
// SPDX-License-Identifier: MIT

import {
  validateChoicesNonEmpty,
  generateSubsetFromChoices,
  generateSingleFromChoices,
  generateMultipleFromChoices,
  Rng,
} from "../../../src/generators/core";
import { root } from "../../../src/logging";

describe("generateSubsetFromChoices", () => {
  beforeEach(() => {
    root.level = "silent";
  });

  it("should throw error when choices array is empty", () => {
    const rng = new Rng("test-seed");

    expect(() => {
      generateSubsetFromChoices("test", undefined, [], rng, root);
    }).toThrow("No test choices available");
  });
});

describe("generateSingleFromChoices", () => {
  beforeEach(() => {
    root.level = "silent";
  });

  it("should throw error when choices array is empty", () => {
    const rng = new Rng("test-seed");

    expect(() => {
      generateSingleFromChoices("test", undefined, [], rng, root);
    }).toThrow("No test choices available");
  });
});

describe("validateChoicesNonEmpty", () => {
  beforeEach(() => {
    root.level = "silent";
  });

  it("should throw error when choices are empty", () => {
    expect(() => {
      validateChoicesNonEmpty("test", [], root);
    }).toThrow("No test choices available");
  });
});

describe("generateMultipleFromChoices", () => {
  beforeEach(() => {
    root.level = "silent";
  });

  it("should throw error when any category has empty choices", () => {
    const rng = new Rng("test-seed");

    expect(() => {
      generateMultipleFromChoices(
        { category1: undefined, category2: undefined },
        { category1: ["valid"], category2: [] },
        rng,
        root,
      );
    }).toThrow("No category2 choices available");
  });
});
