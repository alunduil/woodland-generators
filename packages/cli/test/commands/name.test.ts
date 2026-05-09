import { createNameCommand } from "../../src/commands/name";

describe("name command", () => {
  let stdoutSpy: jest.SpyInstance;

  beforeEach(() => {
    stdoutSpy = jest.spyOn(process.stdout, "write").mockImplementation(() => true);
  });

  afterEach(() => {
    stdoutSpy.mockRestore();
  });

  it("emits a single-line JSON object with seed and name", async () => {
    const cmd = createNameCommand();
    await cmd.parseAsync(["--seed", "fixture-seed"], { from: "user" });

    expect(stdoutSpy).toHaveBeenCalledTimes(1);
    const written = stdoutSpy.mock.calls[0][0] as string;
    expect(written.endsWith("\n")).toBe(true);
    const payload = JSON.parse(written) as { seed: string; name: string };
    expect(payload.seed).toBe("fixture-seed");
    expect(typeof payload.name).toBe("string");
    expect(payload.name.length).toBeGreaterThan(0);
  });

  it("is reproducible across runs with the same seed", async () => {
    const cmd1 = createNameCommand();
    await cmd1.parseAsync(["--seed", "deterministic"], { from: "user" });
    const first = JSON.parse(stdoutSpy.mock.calls[0][0] as string).name;

    stdoutSpy.mockClear();

    const cmd2 = createNameCommand();
    await cmd2.parseAsync(["--seed", "deterministic"], { from: "user" });
    const second = JSON.parse(stdoutSpy.mock.calls[0][0] as string).name;

    expect(first).toBe(second);
  });

  it("passes --name through verbatim", async () => {
    const cmd = createNameCommand();
    await cmd.parseAsync(["--seed", "any", "--name", "Rosalind"], { from: "user" });

    const payload = JSON.parse(stdoutSpy.mock.calls[0][0] as string) as { name: string };
    expect(payload.name).toBe("Rosalind");
  });
});
