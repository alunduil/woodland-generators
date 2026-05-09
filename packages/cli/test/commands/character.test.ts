import { createCharacterCommand } from "../../src/commands/character";

const baseArgs = [
  "--archetype",
  "The Ranger",
  "--species-choice",
  "mouse",
  "--species-choice",
  "fox",
  "--demeanor-choice",
  "Curious",
  "--demeanor-choice",
  "Brave",
  "--details-pronoun",
  "they",
  "--details-appearance",
  "scarred",
  "--details-accessory",
  "satchel",
];

interface CharacterPayload {
  seed: string;
  name: string;
  playbook: string;
  species: string;
  details: { pronouns: string[]; appearance: string[]; accessories: string[] };
  demeanor: string[];
}

describe("character command", () => {
  let stdoutSpy: jest.SpyInstance;

  beforeEach(() => {
    stdoutSpy = jest.spyOn(process.stdout, "write").mockImplementation(() => true);
  });

  afterEach(() => {
    stdoutSpy.mockRestore();
  });

  it("emits a single-line JSON character with seed and core fields", async () => {
    const cmd = createCharacterCommand();
    await cmd.parseAsync(["--seed", "fixture-seed", ...baseArgs], { from: "user" });

    expect(stdoutSpy).toHaveBeenCalledTimes(1);
    const written = stdoutSpy.mock.calls[0][0] as string;
    expect(written.endsWith("\n")).toBe(true);
    expect(written.slice(0, -1).includes("\n")).toBe(false);

    const payload = JSON.parse(written) as CharacterPayload;
    expect(payload.seed).toBe("fixture-seed");
    expect(payload.playbook).toBe("The Ranger");
    expect(typeof payload.name).toBe("string");
    expect(["mouse", "fox"]).toContain(payload.species);
    expect(payload.details.pronouns).toEqual(["they"]);
    expect(payload.details.appearance).toEqual(["scarred"]);
    expect(payload.details.accessories).toEqual(["satchel"]);
    payload.demeanor.forEach((trait) => expect(["Curious", "Brave"]).toContain(trait));
  });

  it("is reproducible across runs with the same flags", async () => {
    const cmd1 = createCharacterCommand();
    await cmd1.parseAsync(["--seed", "deterministic", ...baseArgs], { from: "user" });
    const first = stdoutSpy.mock.calls[0][0] as string;

    stdoutSpy.mockClear();

    const cmd2 = createCharacterCommand();
    await cmd2.parseAsync(["--seed", "deterministic", ...baseArgs], { from: "user" });
    const second = stdoutSpy.mock.calls[0][0] as string;

    expect(first).toBe(second);
  });

  it("passes user overrides through verbatim", async () => {
    const cmd = createCharacterCommand();
    await cmd.parseAsync(
      [
        "--seed",
        "any",
        ...baseArgs,
        "--name",
        "Rosalind",
        "--species",
        "fox",
        "--demeanor",
        "Curious",
      ],
      { from: "user" },
    );

    const payload = JSON.parse(stdoutSpy.mock.calls[0][0] as string) as CharacterPayload;
    expect(payload.name).toBe("Rosalind");
    expect(payload.species).toBe("fox");
    expect(payload.demeanor).toEqual(["Curious"]);
  });
});
