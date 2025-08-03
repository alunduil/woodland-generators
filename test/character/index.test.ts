import type { Character } from "../../src/character/index";

describe("Character module exports", () => {
  describe("Character types", () => {
    it("should export Character interface with proper types", () => {
      // Test that the Character type is properly exported and usable
      const _character: Character = {
        name: "Test Character",
        playbook: "Test Playbook",
        species: "Test Species",
      };

      // If we get here without TypeScript errors, the types are properly exported
    });
  });
});
