import * as rootExports from "../src/index";
import type {
  Character,
  Playbook,
  GeneratorOptions,
  CharacterGeneratorOptions,
  NameGeneratorOptions,
  SpeciesGeneratorOptions,
  PlaybookGeneratorOptions,
} from "../src/index";

describe("Root module exports", () => {
  describe("Character generation", () => {
    it("should export generateCharacter function with proper types", () => {
      expect(rootExports).toHaveProperty("generateCharacter");
      expect(typeof rootExports.generateCharacter).toBe("function");

      // Test that related types are properly exported and usable
      const _character: Character = {
        name: "Test Character",
        playbook: "Test Playbook",
        species: "Test Species",
      };

      const _options: Partial<CharacterGeneratorOptions> = {
        seed: "test-seed",
        name: "Optional Name",
      };

      // If we get here without TypeScript errors, the types are properly exported
    });
  });

  describe("Name generation", () => {
    it("should export generateName function with proper types", () => {
      expect(rootExports).toHaveProperty("generateName");
      expect(typeof rootExports.generateName).toBe("function");

      const _options: NameGeneratorOptions = {
        seed: "test-seed",
        name: "Optional Name",
      };
    });
  });

  describe("Species generation", () => {
    it("should export generateSpecies function with proper types", () => {
      expect(rootExports).toHaveProperty("generateSpecies");
      expect(typeof rootExports.generateSpecies).toBe("function");

      const _options: SpeciesGeneratorOptions = {
        seed: "test-seed",
        choices: ["Mouse", "Rabbit", "Fox"],
        species: "Optional Species",
      };
    });
  });

  describe("Playbook generation", () => {
    it("should export generatePlaybook function with proper types", () => {
      expect(rootExports).toHaveProperty("generatePlaybook");
      expect(typeof rootExports.generatePlaybook).toBe("function");

      const _options: PlaybookGeneratorOptions = {
        seed: "test-seed",
        path: "/path/to/playbook.pdf",
        archetype: "The Ranger",
      };

      const _playbook: Partial<Playbook> = {
        archetype: "Test Archetype",
      };
    });
  });

  describe("Playbook sources", () => {
    it("should export fromPath function", () => {
      expect(rootExports).toHaveProperty("fromPath");
      expect(typeof rootExports.fromPath).toBe("function");
    });
  });

  describe("Common types", () => {
    it("should export base GeneratorOptions interface", () => {
      const _baseOptions: GeneratorOptions = {
        seed: "test-seed",
      };
    });
  });
});
