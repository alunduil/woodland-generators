import { generateSpecies, EXTENDED_WOODLAND_SPECIES } from "../../src/generators/species";

describe("generateSpecies", () => {
  it("should select from extended species list when 'other' is chosen", () => {
    // When "other" is the only choice, it must be selected
    const choices = ["other"];
    const seed = "test-seed";

    const species = generateSpecies({ seed, choices });

    // Should be from the extended species list, not "other" itself
    expect(EXTENDED_WOODLAND_SPECIES).toContain(species);
  });

  describe("EXTENDED_WOODLAND_SPECIES validation", () => {
    it("should contain only valid non-empty strings", () => {
      expect(EXTENDED_WOODLAND_SPECIES.length).toBeGreaterThan(0);

      EXTENDED_WOODLAND_SPECIES.forEach((species) => {
        expect(typeof species).toBe("string");
        expect(species.length).toBeGreaterThan(0);
        expect(species.trim()).toBe(species); // No leading/trailing whitespace
      });
    });

    it("should contain unique species names", () => {
      const uniqueSpecies = new Set(EXTENDED_WOODLAND_SPECIES);
      expect(uniqueSpecies.size).toBe(EXTENDED_WOODLAND_SPECIES.length);
    });
  });
});
