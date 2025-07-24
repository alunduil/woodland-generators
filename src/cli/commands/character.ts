import { Command, Option } from "commander";
import * as Formatters from "../../formatters";

export function createCharacterCommand(): Command {
  return new Command("character")
    .alias("char")
    .description("Generate woodland characters for Root: The RPG")
    .option("-c, --count <number>", "Number of characters to generate", "1")
    .option("-o, --output <file>", "Output file (default: stdout)")
    .addOption(
      new Option("-f, --format <format>", "Output format")
        .choices([...Formatters.FORMATS]) // Spread to convert readonly array
        .default(Formatters.DEFAULT),
    )
    .action((options) => {
      // Commander handles validation, no need for Format.validate()!

      // TODO Implement the character creation process:
      // Choose playbook
      // Choose name, species, and details
      // Choose where to add +1 to stats; cannot raise above +2
      // Choose your background; prestige and notoriety
      // Choose your nature
      // Choose your drives
      // Choose your moves
      // Choose your roguish feats
      // Choose your weapon skills
      // Spend starting value on equipment; burdened and max loads

      const mockCharacters = [{ name: "Brave Squirrel", faction: "Woodland Alliance" }];

      // options.format is already validated by Commander
      const formattedOutput = Formatters.run(options.format, mockCharacters);

      console.log(formattedOutput);
    });
}
