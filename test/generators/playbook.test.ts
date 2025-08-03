import { generatePlaybook } from "../../src/generators/playbook";
import { fromPath, fromPathWithArchetype } from "../../src/playbook/sources";
import { root } from "../../src/logging";
import { Playbook } from "../../src/playbook/types";

// Mock only the functions while allowing constants to pass through safely
jest.mock("../../src/playbook/sources", (): typeof import("../../src/playbook/sources") => ({
  fromPath: jest.fn(),
  fromPathWithArchetype: jest.fn(),
}));

const mockFromPath = fromPath as jest.MockedFunction<typeof fromPath>;
const mockFromPathWithArchetype = fromPathWithArchetype as jest.MockedFunction<
  typeof fromPathWithArchetype
>;

describe("generatePlaybook", () => {
  const mockPlaybook: Playbook = {
    archetype: "The Ranger",
    species: ["Fox", "Rabbit"],
    background: {
      homeOptions: ["Forest"],
      motivationOptions: ["Adventure"],
    },
    nature: {
      stats: [1, 2, 3],
      statNames: ["Might", "Finesse", "Charm"],
    },
    moves: ["Track", "Hide"],
    equipment: {
      startingValue: 10,
      items: ["Bow", "Quiver"],
    },
    feats: ["Warrior", "Scout"],
    weaponSkills: ["Bow"],
    rawText: "Test playbook content",
    pageNumber: 1,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    root.level = "silent";
    mockFromPath.mockResolvedValue(mockPlaybook);
    mockFromPathWithArchetype.mockResolvedValue(mockPlaybook);
  });

  it("should coordinate archetype-based selection correctly", async () => {
    const result = await generatePlaybook({
      path: "/path/to/playbook.pdf",
      seed: "test-seed",
    });

    // Verifies coordination: calls fromPath without archetype and returns result
    expect(result).toBe(mockPlaybook);
    expect(mockFromPath).toHaveBeenCalledWith("/path/to/playbook.pdf", "test-seed");
    expect(mockFromPathWithArchetype).not.toHaveBeenCalled();
  });

  it("should delegate to archetype-specific source when archetype provided", async () => {
    const result = await generatePlaybook({
      path: "/path/to/playbook.pdf",
      seed: "test-seed",
      archetype: "The Thief",
    });

    // Verifies parameter delegation to archetype-specific source
    expect(result).toBe(mockPlaybook);
    expect(mockFromPathWithArchetype).toHaveBeenCalledWith("/path/to/playbook.pdf", "The Thief");
    expect(mockFromPath).not.toHaveBeenCalled();
  });
});
