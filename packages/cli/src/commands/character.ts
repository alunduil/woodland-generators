import { Command } from "commander";
import { generateCharacter } from "@woodland-generators/core";
import { randomBytes } from "crypto";

const collect = (value: string, previous: string[]): string[] => [...previous, value];

interface CharacterCommandOptions {
  seed?: string;
  archetype: string;
  speciesChoice: string[];
  demeanorChoice: string[];
  detailsPronoun: string[];
  detailsAppearance: string[];
  detailsAccessory: string[];
  name?: string;
  species?: string;
  demeanor: string[];
}

export function createCharacterCommand(): Command {
  return new Command("character")
    .description("Generate a character and print it as JSON")
    .option("-s, --seed <seed>", "seed for reproducible generation")
    .requiredOption("--archetype <archetype>", "archetype label written onto the character")
    .option("--species-choice <s>", "species choice (repeatable)", collect, [])
    .option("--demeanor-choice <s>", "demeanor choice (repeatable)", collect, [])
    .option("--details-pronoun <s>", "pronoun choice (repeatable)", collect, [])
    .option("--details-appearance <s>", "appearance choice (repeatable)", collect, [])
    .option("--details-accessory <s>", "accessory choice (repeatable)", collect, [])
    .option("--name <name>", "user-provided name (passes through verbatim)")
    .option("--species <species>", "user-provided species override")
    .option("--demeanor <s>", "user-provided demeanor trait (repeatable)", collect, [])
    .action(async (options: CharacterCommandOptions): Promise<void> => {
      const seed = options.seed ?? randomBytes(8).toString("hex");
      const character = await generateCharacter({
        seed,
        archetype: options.archetype,
        speciesChoices: options.speciesChoice,
        demeanorChoices: options.demeanorChoice,
        detailsChoices: {
          pronouns: options.detailsPronoun,
          appearance: options.detailsAppearance,
          accessories: options.detailsAccessory,
        },
        ...(options.name !== undefined && { name: options.name }),
        ...(options.species !== undefined && { species: options.species }),
        ...(options.demeanor.length > 0 && { demeanor: options.demeanor }),
      });
      process.stdout.write(JSON.stringify({ seed, ...character }) + "\n");
    });
}
