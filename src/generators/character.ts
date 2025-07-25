import { GeneratorOptions } from "./index";
import { generateSpecies } from "./species";
import { generateName } from "./name";
import { Character } from "../character";
import { Playbook } from "../playbook";

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
  console.log(`Generating character from playbook: ${options.playbook.archetype}`);

  // Generate character components using functional approach
  const species = generateSpecies({
    seed: options.seed,
    choices: options.playbook.species,
    ...(options.species !== undefined && { species: options.species }),
  });

  const name = generateName({
    seed: options.seed,
    ...(options.name !== undefined && { name: options.name }),
  });

  return {
    name,
    playbook: options.playbook.archetype,
    species,
  };
}
