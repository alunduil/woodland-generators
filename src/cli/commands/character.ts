import { Command } from "commander";
import { generateCharacter, generatePlaybook } from "../../generators";

export function createCharacterCommand(): Command {
  return new Command("character")
    .alias("char")
    .description("Generate woodland characters for Root: The RPG")
    .argument("<playbook-path>", "filepath to playbook PDF")
    .option("-s, --seed <seed>", "seed for reproducible character generation")
    .option(
      "-a, --archetype <archetype>",
      'specific archetype to select (e.g., "The Ranger", "The Thief")',
    )
    .option("-n, --name <name>", "custom name for the character")
    .action(async (path, options) => {
      // Ensure we always have a seed for consistent, testable behavior
      const seed = options.seed ?? Math.random().toString(36).substring(2, 15);

      console.log(`Using seed: ${seed}`);

      // First generate/load the playbook
      const playbook = await generatePlaybook({
        path,
        seed,
        ...(options.archetype !== undefined && { archetype: options.archetype }),
      });

      // Then generate character using the playbook object
      const character = await generateCharacter({
        playbook,
        name: options.name,
        seed: seed,
      });

      // Output the character
      console.log(JSON.stringify(character, null, 2));
    });
}
