import { Command } from "commander";
import { generateName } from "@woodland-generators/core";
import { randomBytes } from "crypto";

export function createNameCommand(): Command {
  return new Command("name")
    .description("Generate a character name and print it as JSON")
    .option("-s, --seed <seed>", "seed for reproducible generation")
    .option("--name <name>", "user-provided name (passes through verbatim)")
    .action((options: { seed?: string; name?: string }): void => {
      const seed = options.seed ?? randomBytes(8).toString("hex");
      const name = generateName({
        seed,
        ...(options.name !== undefined && { name: options.name }),
      });
      process.stdout.write(JSON.stringify({ seed, name }) + "\n");
    });
}
