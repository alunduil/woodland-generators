import * as playbookExports from "../../src/playbook/index";
import type { Playbook } from "../../src/playbook/index";

describe("Playbook module exports", () => {
  describe("Playbook sources", () => {
    it("should export fromPath function", () => {
      expect(playbookExports).toHaveProperty("fromPath");
      expect(typeof playbookExports.fromPath).toBe("function");
    });
  });

  describe("Playbook types", () => {
    it("should export Playbook interface with proper types", () => {
      // Test that the Playbook type is properly exported and usable
      const _playbook: Partial<Playbook> = {
        archetype: "Test Archetype",
        background: {
          homeOptions: ["Forest", "Village"],
          motivationOptions: ["Adventure", "Justice"],
        },
      };

      // If we get here without TypeScript errors, the types are properly exported
    });
  });
});
