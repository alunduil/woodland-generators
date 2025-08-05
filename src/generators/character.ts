import { generateSpecies } from "./species";
import { generateName } from "./name";
import { generateDetails } from "./details";
import { generateDemeanor } from "./demeanor";
import { GeneratorOptions } from "./index";
import { Character } from "../character";
import { Details } from "../details";
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
  /** User-provided details (if provided, these will be used instead of generating) */
  details?: Partial<Details>;
  /** User-provided demeanor traits (if provided, these will be used instead of generating) */
  demeanor?: string[];
}

/**
 * Generate a complete character from a playbook object
 */
export async function generateCharacter(options: CharacterGeneratorOptions): Promise<Character> {
  const logger = root.child({
    generator: "character",
    seed: options.seed,
  });

  logger.info({
    msg: "Starting character generation",
    playbook: options.playbook.archetype,
    characterName: options.name,
    species: options.species,
    details: options.details,
    demeanor: options.demeanor,
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

  const details = generateDetails({
    seed: options.seed,
    choices: options.playbook.details,
    ...(options.details !== undefined && { details: options.details }),
  });

  const demeanor = generateDemeanor({
    seed: options.seed,
    choices: options.playbook.demeanor,
    ...(options.demeanor !== undefined && { demeanor: options.demeanor }),
  });

  const character = {
    name,
    playbook: options.playbook.archetype,
    species,
    details,
    demeanor,
  };

  logger.info({
    msg: "Character generation completed",
    playbook: options.playbook.archetype,
    seed: options.seed,
    characterName: name,
    species: species,
    details: details,
    demeanor: demeanor,
  });

  return character;
}
