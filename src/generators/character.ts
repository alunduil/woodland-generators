import { generateSpecies } from "./species";
import { generateName } from "./name";
import { GeneratorOptions } from "./index";
import { Character } from "../character";
import { Playbook } from "../playbook";
import { root } from "../logging";

/**
 * Options for character generation from a playbook source
 */
export interface CharacterGeneratorOptions extends GeneratorOptions {
  /** Playbook object containing character generation data */
  playbook: Playbook;
  /** User-provided name (if provided, this will be used instead of generating) */
  name?: string;
  /** User-provided species (if provided, this will be used instead of generating) */
  species?: string;
}

/**
 * Generate a complete character from a playbook object
 */
export async function generateCharacter(options: CharacterGeneratorOptions): Promise<Character> {
  const logger = root.child({
    generator: "character",
  });

  logger.info({
    msg: "Starting character generation",
    playbook: options.playbook.archetype,
    seed: options.seed,
    characterName: options.name,
    species: options.species,
  });

  // Generate character components using functional approach with seeds
  const species = generateSpecies({
    seed: options.seed,
    choices: options.playbook.species,
    ...(options.species !== undefined && { species: options.species }),
  });

  const name = generateName({
    seed: options.seed,
    ...(options.name !== undefined && { name: options.name }),
  });

  const character = {
    name,
    playbook: options.playbook.archetype,
    species,
  };

  logger.info({
    msg: "Character generation completed",
    playbook: options.playbook.archetype,
    seed: options.seed,
    characterName: name,
    species: species,
  });

  return character;
}
