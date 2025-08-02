import { Command } from "commander";
import { generateCharacter, generatePlaybook } from "../../generators";
import { root } from "../../logging";
import { randomBytes } from "crypto";
import type pino from "pino";

/**
 * Internal implementation of character command logic.
 * Separated from CLI plumbing for better testability and error handling.
 */
async function executeCharacterCommand(
  path: string,
  options: {
    seed?: string;
    archetype?: string;
    name?: string;
    species?: string;
  },
  logger: pino.Logger,
): Promise<void> {
  // Ensure we always have a seed for consistent, testable behavior
  const seed = options.seed ?? randomBytes(8).toString("hex");

  logger.info({
    msg: "Starting character generation",
    seed,
    archetype: options.archetype,
    characterName: options.name,
    species: options.species,
  });

  // First generate/load the playbook
  const playbook = await generatePlaybook({
    path,
    seed,
    ...(options.archetype !== undefined && { archetype: options.archetype }),
  });

  // Then generate character using the playbook object
  const character = await generateCharacter({
    playbook,
    ...(options.name !== undefined && { name: options.name }),
    ...(options.species !== undefined && { species: options.species }),
    seed: seed,
  });

  logger.info({
    msg: "Character generation completed",
    characterName: character.name,
    playbook: character.playbook,
    species: character.species,
  });

  // Output the character (this should always be JSON for programmatic use)
  console.log(JSON.stringify(character, null, 2));
}

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
    .option("--name <name>", "custom name for the character")
    .option("--species <species>", "custom species for the character")
    .action(async (path, options) => {
      // Create a logger with command context once, outside try block
      const logger = root.child({
        command: "character",
        playbookPath: path,
      });

      try {
        await executeCharacterCommand(path, options, logger);
      } catch (error) {
        logger.error({
          msg: "Character generation failed",
          error: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
          path,
          options,
        });

        process.exit(1);
      }
    });
}
