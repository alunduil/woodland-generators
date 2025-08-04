import { generateDetails } from "../../src/generators/details";
import { root } from "../../src/logging";

describe("generateDetails", () => {
  beforeEach(() => {
    root.level = "silent";
  });

  describe("error handling", () => {
    it("should throw error when a single category is empty", () => {
      expect(() => {
        generateDetails({
          seed: "test-seed",
          choices: {
            pronouns: [],
            appearance: ["formal"],
            accessories: ["badge"],
          },
        });
      }).toThrow("Missing detail choices for categories: pronouns");
    });

    it("should throw error when multiple categories are empty", () => {
      expect(() => {
        generateDetails({
          seed: "test-seed",
          choices: {
            pronouns: [],
            appearance: [],
            accessories: ["badge"],
          },
        });
      }).toThrow("Missing detail choices for categories: pronouns, appearance");
    });

    it("should throw error when all categories are empty", () => {
      expect(() => {
        generateDetails({
          seed: "test-seed",
          choices: {
            pronouns: [],
            appearance: [],
            accessories: [],
          },
        });
      }).toThrow("Missing detail choices for categories: pronouns, appearance, accessories");
    });
  });
});
