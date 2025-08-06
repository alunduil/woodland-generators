import { createCharacterCommand } from "../../../src/cli/commands/character";
import { generatePlaybook } from "../../../src/generators";
import { root } from "../../../src/logging";

jest.mock("../../../src/generators", (): typeof import("../../../src/generators") => ({
  generatePlaybook: jest.fn(),
  generateCharacter: jest.fn(),
  generateName: jest.fn(),
  generateSpecies: jest.fn(),
  generateDetails: jest.fn(),
  generateDemeanor: jest.fn(),
}));

let mockProcessExit: jest.SpyInstance;
let outputBuffer: string[];
let command: ReturnType<typeof createCharacterCommand>;

describe("createCharacterCommand", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    root.level = "silent";
    outputBuffer = [];

    mockProcessExit = jest.spyOn(process, "exit").mockImplementation((code) => {
      throw new Error(`Process exit called with code ${code}`);
    });

    // Mock both stdout and stderr to write to the same buffer
    jest.spyOn(process.stdout, "write").mockImplementation((chunk: string | Uint8Array) => {
      outputBuffer.push(String(chunk));
      return true;
    });
    jest.spyOn(process.stderr, "write").mockImplementation((chunk: string | Uint8Array) => {
      outputBuffer.push(String(chunk));
      return true;
    });

    command = createCharacterCommand();
  });

  afterEach(() => {
    mockProcessExit.mockRestore();
    jest.restoreAllMocks();
  });

  it("should display help when requested", async () => {
    await expect(command.parseAsync(["character", "--help"], { from: "user" })).rejects.toThrow(
      "Process exit called with code 0",
    );

    const allOutput = outputBuffer.join("");

    expect(allOutput).toContain("Generate woodland characters for Root: The RPG");
    expect(allOutput).toContain("playbook-path");
  });

  it("should show error when required argument is missing", async () => {
    await expect(command.parseAsync(["character"], { from: "user" })).rejects.toThrow(
      "Process exit called with code 1",
    );
  });

  it("should handle generator errors with proper exit code", async () => {
    (generatePlaybook as jest.Mock).mockRejectedValue(new Error("Generation failed"));

    await expect(command.parseAsync(["character", "/path/to/playbook.pdf"])).rejects.toThrow(
      "Process exit called with code 1",
    );
  });
});
