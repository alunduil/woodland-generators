import { PlaybookSource } from "../../../src/playbook/sources/types";
import { Playbook } from "../../../src/playbook/types";

// Test implementation of PlaybookSource for testing base class methods
export class TestPlaybookSource extends PlaybookSource {
  constructor(playbooks: Playbook[] = []) {
    super("test-path", "test");
    this.playbooks = playbooks;
  }

  async isValid(): Promise<boolean> {
    return true;
  }

  async load(): Promise<void> {
    // No-op for test implementation
  }

  // Method to inject playbooks for testing
  setPlaybooks(playbooks: Playbook[]): void {
    this.playbooks = playbooks;
  }
}

export const mockPlaybooks: Playbook[] = [
  {
    archetype: "Test Archetype 1",
    background: {
      homeOptions: ["Home 1"],
      motivationOptions: ["Motivation 1"],
    },
    nature: { stats: [1, 2, 3], statNames: ["Stat1", "Stat2", "Stat3"] },
    moves: ["Move 1"],
    equipment: { startingValue: 10, items: ["Item 1"] },
    feats: ["Feat 1"],
    weaponSkills: ["Skill 1"],
    species: ["Species 1"],
    rawText: "Test raw text 1",
    pageNumber: 1,
  },
  {
    archetype: "Test Archetype 2",
    background: {
      homeOptions: ["Home 2"],
      motivationOptions: ["Motivation 2"],
    },
    nature: { stats: [4, 5, 6], statNames: ["Stat1", "Stat2", "Stat3"] },
    moves: ["Move 2"],
    equipment: { startingValue: 20, items: ["Item 2"] },
    feats: ["Feat 2"],
    weaponSkills: ["Skill 2"],
    species: ["Species 2"],
    rawText: "Test raw text 2",
    pageNumber: 2,
  },
];
