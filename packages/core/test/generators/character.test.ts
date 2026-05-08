import { generateCharacter } from "../../src/generators/character";
import { generateSpecies } from "../../src/generators/species";
import { generateName } from "../../src/generators/name";
import { generateDetails } from "../../src/generators/details";
import { generateDemeanor } from "../../src/generators/demeanor";
import { root } from "../../src/logging";

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

jest.mock("../../src/generators/demeanor", () => ({
  generateDemeanor: jest.fn(),
}));

const mockGenerateSpecies = generateSpecies as jest.MockedFunction<typeof generateSpecies>;
const mockGenerateName = generateName as jest.MockedFunction<typeof generateName>;
const mockGenerateDetails = generateDetails as jest.MockedFunction<typeof generateDetails>;
const mockGenerateDemeanor = generateDemeanor as jest.MockedFunction<typeof generateDemeanor>;

const DEFAULT_DETAILS_CHOICES = {
  pronouns: ["they"],
  appearance: ["simple"],
  accessories: ["personal trinket"],
};

const DEFAULT_DEMEANOR_CHOICES = ["Curious", "Helpful"];

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
    mockGenerateDemeanor.mockReturnValue(["Curious", "Helpful"]);
  });

  it("should coordinate generation and assemble character object", async () => {
    const result = await generateCharacter({
      archetype: "The Wanderer",
      speciesChoices: ["Fox", "Rabbit"],
      detailsChoices: DEFAULT_DETAILS_CHOICES,
      demeanorChoices: DEFAULT_DEMEANOR_CHOICES,
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
      demeanor: ["Curious", "Helpful"],
    });

    expect(mockGenerateSpecies).toHaveBeenCalledTimes(1);
    expect(mockGenerateName).toHaveBeenCalledTimes(1);
    expect(mockGenerateDetails).toHaveBeenCalledTimes(1);
    expect(mockGenerateDemeanor).toHaveBeenCalledTimes(1);
  });

  it("should delegate parameters correctly to generators", async () => {
    await generateCharacter({
      archetype: "The Ranger",
      speciesChoices: ["Fox", "Rabbit"],
      detailsChoices: DEFAULT_DETAILS_CHOICES,
      demeanorChoices: DEFAULT_DEMEANOR_CHOICES,
      seed: "param-test",
    });

    expect(mockGenerateSpecies).toHaveBeenCalledWith({
      seed: "param-test",
      choices: ["Fox", "Rabbit"],
    });

    expect(mockGenerateName).toHaveBeenCalledWith({
      seed: "param-test",
    });

    expect(mockGenerateDetails).toHaveBeenCalledWith({
      seed: "param-test",
      choices: DEFAULT_DETAILS_CHOICES,
    });

    expect(mockGenerateDemeanor).toHaveBeenCalledWith({
      seed: "param-test",
      choices: DEFAULT_DEMEANOR_CHOICES,
    });
  });

  it("should pass user overrides only when defined", async () => {
    await generateCharacter({
      archetype: "The Scout",
      speciesChoices: ["Squirrel"],
      detailsChoices: DEFAULT_DETAILS_CHOICES,
      demeanorChoices: DEFAULT_DEMEANOR_CHOICES,
      seed: "override-test",
      name: "Custom Name",
      species: "Wolf",
      details: {
        pronouns: ["he", "him"],
        appearance: ["custom"],
        accessories: ["custom item"],
      },
      demeanor: ["Custom", "Demeanor"],
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
      choices: DEFAULT_DETAILS_CHOICES,
      details: {
        pronouns: ["he", "him"],
        appearance: ["custom"],
        accessories: ["custom item"],
      },
    });

    expect(mockGenerateDemeanor).toHaveBeenCalledWith({
      seed: "override-test",
      choices: DEFAULT_DEMEANOR_CHOICES,
      demeanor: ["Custom", "Demeanor"],
    });
  });
});
