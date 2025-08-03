import { root } from "../../../src/logging";
import { TestPlaybookSource, mockPlaybooks } from "./types.common";

describe("PlaybookSource - Base class interface", () => {
  beforeEach(() => {
    root.level = "silent";
  });

  describe("getPlaybook", () => {
    it("should require initialization before archetype lookup", async () => {
      const source = new TestPlaybookSource([]);
      await expect(source.getPlaybook("Any Archetype")).rejects.toThrow("No playbooks loaded");
    });

    it("should return null when archetype is not found", async () => {
      const source = new TestPlaybookSource(mockPlaybooks);
      const playbook = await source.getPlaybook("NonExistent Archetype");
      expect(playbook).toBeNull();
    });

    it("should retrieve playbook by exact archetype match", async () => {
      const source = new TestPlaybookSource(mockPlaybooks);
      const playbook = await source.getPlaybook("Test Archetype 1");
      expect(playbook).toBeTruthy();
      expect(playbook?.archetype).toBe("Test Archetype 1");
    });
  });

  describe("getRandomPlaybook", () => {
    it("should require initialization before random selection", async () => {
      const source = new TestPlaybookSource([]);
      await expect(source.getRandomPlaybook("test-seed")).rejects.toThrow("No playbooks loaded");
    });

    it("should provide deterministic selection with identical seeds", async () => {
      const source = new TestPlaybookSource(mockPlaybooks);
      const playbook1 = await source.getRandomPlaybook("consistent-seed");
      const playbook2 = await source.getRandomPlaybook("consistent-seed");
      expect(playbook1.archetype).toBe(playbook2.archetype);
    });
  });

  describe("getPlaybooks", () => {
    it("should require initialization before accessing playbooks", () => {
      const source = new TestPlaybookSource([]);
      expect(() => source.getPlaybooks()).toThrow("No playbooks loaded");
    });

    it("should return a copy of the playbooks array", () => {
      const source = new TestPlaybookSource(mockPlaybooks);
      const playbooks = source.getPlaybooks();

      expect(playbooks).toEqual(mockPlaybooks);
      expect(playbooks).not.toBe(mockPlaybooks); // Should be a copy, not the same reference
    });
  });
});
