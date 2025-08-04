import { generateCharacter } from "../../src/generators/character";
import { generateSpecies } from "../../src/generators/species";
import { generateName } from "../../src/generators/name";
import { generateDetails } from "../../src/generators/details";
import { root } from "../../src/logging";
import { Playbook } from "../../src/playbook";

// Mock only the functions while allowing constants to pass through safely
jest.mock("../../src/generators/species", (): typeof import("../../src/generators/species") => {
  const actualSpecies = jest.requireActual("../../src/generators/species");
  return {
    generateSpecies: jest.fn(),
    EXTENDED_WOODLAND_SPECIES: actualSpecies.EXTENDED_WOODLAND_SPECIES,
  };
});

jest.mock("../../src/generators/name", (): typeof import("../../src/generators/name") => {
  const actualName = jest.requireActual("../../src/generators/name");
  return {
    generateName: jest.fn(),
    CHARACTER_NAMES: actualName.CHARACTER_NAMES,
  };
});

jest.mock("../../src/generators/details", () => ({
  generateDetails: jest.fn(),
}));

const mockGenerateSpecies = generateSpecies as jest.MockedFunction<typeof generateSpecies>;
const mockGenerateName = generateName as jest.MockedFunction<typeof generateName>;
const mockGenerateDetails = generateDetails as jest.MockedFunction<typeof generateDetails>;

// Helper function to create mock playbooks
function createMockPlaybook(archetype: string, species: string[] = []): Playbook {
  return {
    archetype,
    species,
    background: {
      homeOptions: [],
      motivationOptions: [],
    },
    nature: {
      stats: [],
      statNames: [],
    },
    moves: [],
    equipment: {
      startingValue: 0,
      items: [],
    },
    feats: [],
    weaponSkills: [],
    details: {
      pronouns: ["they"],
      appearance: ["simple"],
      accessories: ["personal trinket"],
    },
    rawText: "",
    pageNumber: 1,
  };
}

describe("generateCharacter", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    root.level = "silent";
    mockGenerateSpecies.mockReturnValue("Fox");
    mockGenerateName.mockReturnValue("Test Character");
    mockGenerateDetails.mockReturnValue({
      pronouns: ["they"],
      appearance: ["simple"],
      accessories: ["personal trinket"],
    });
  });

  it("should coordinate generation and assemble character object", async () => {
    const playbook = createMockPlaybook("The Wanderer", ["Fox", "Rabbit"]);

    const result = await generateCharacter({
      playbook,
      seed: "test-seed",
    });

    // Verifies coordination: calls both generators and assembles result
    expect(result).toEqual({
      name: "Test Character",
      playbook: "The Wanderer",
      species: "Fox",
      details: {
        pronouns: ["they"],
        appearance: ["simple"],
        accessories: ["personal trinket"],
      },
    });

    expect(mockGenerateSpecies).toHaveBeenCalledTimes(1);
    expect(mockGenerateName).toHaveBeenCalledTimes(1);
    expect(mockGenerateDetails).toHaveBeenCalledTimes(1);
  });

  it("should delegate parameters correctly to generators", async () => {
    const playbook = createMockPlaybook("The Ranger", ["Fox", "Rabbit"]);

    await generateCharacter({
      playbook,
      seed: "param-test",
    });

    // Verifies parameter delegation
    expect(mockGenerateSpecies).toHaveBeenCalledWith({
      seed: "param-test",
      choices: ["Fox", "Rabbit"],
    });

    expect(mockGenerateName).toHaveBeenCalledWith({
      seed: "param-test",
    });

    expect(mockGenerateDetails).toHaveBeenCalledWith({
      seed: "param-test",
      choices: {
        pronouns: ["they"],
        appearance: ["simple"],
        accessories: ["personal trinket"],
      },
    });
  });

  it("should pass user overrides only when defined", async () => {
    const playbook = createMockPlaybook("The Scout", ["Squirrel"]);

    await generateCharacter({
      playbook,
      seed: "override-test",
      name: "Custom Name",
      species: "Wolf",
      details: {
        pronouns: ["he", "him"],
        appearance: ["custom"],
        accessories: ["custom item"],
      },
    });

    // Verifies conditional parameter passing - only includes overrides when defined
    expect(mockGenerateName).toHaveBeenCalledWith({
      seed: "override-test",
      name: "Custom Name",
    });

    expect(mockGenerateSpecies).toHaveBeenCalledWith({
      seed: "override-test",
      choices: ["Squirrel"],
      species: "Wolf",
    });

    expect(mockGenerateDetails).toHaveBeenCalledWith({
      seed: "override-test",
      choices: {
        pronouns: ["they"],
        appearance: ["simple"],
        accessories: ["personal trinket"],
      },
      details: {
        pronouns: ["he", "him"],
        appearance: ["custom"],
        accessories: ["custom item"],
      },
    });
  });
});
