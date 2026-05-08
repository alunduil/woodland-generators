import { generateSpecies } from "./species";
import { generateName } from "./name";
import { generateDetails } from "./details";
import { generateDemeanor } from "./demeanor";
import { GeneratorOptions } from "./index";
import { Character } from "../character";
import { Details } from "../details";
import { root } from "../logging";

export interface CharacterGeneratorOptions extends GeneratorOptions {
  /** Archetype label written onto the generated character (e.g., "The Ranger") */
  archetype: string;
  /** Species choices the generator picks from */
  speciesChoices: string[];
  /** Per-category detail choices the generator picks from */
  detailsChoices: Details;
  /** Demeanor trait choices the generator picks from */
  demeanorChoices: string[];
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
 * Generate a complete character from archetype + choice lists
 */
export async function generateCharacter(options: CharacterGeneratorOptions): Promise<Character> {
  const logger = root.child({
    generator: "character",
    seed: options.seed,
  });

  logger.info({
    msg: "Starting character generation",
    archetype: options.archetype,
    characterName: options.name,
    species: options.species,
    details: options.details,
    demeanor: options.demeanor,
  });

  const species = generateSpecies({
    seed: options.seed,
    choices: options.speciesChoices,
    ...(options.species !== undefined && { species: options.species }),
  });

  const name = generateName({
    seed: options.seed,
    ...(options.name !== undefined && { name: options.name }),
  });

  const details = generateDetails({
    seed: options.seed,
    choices: options.detailsChoices,
    ...(options.details !== undefined && { details: options.details }),
  });

  const demeanor = generateDemeanor({
    seed: options.seed,
    choices: options.demeanorChoices,
    ...(options.demeanor !== undefined && { demeanor: options.demeanor }),
  });

  const character = {
    name,
    playbook: options.archetype,
    species,
    details,
    demeanor,
  };

  logger.info({
    msg: "Character generation completed",
    archetype: options.archetype,
    seed: options.seed,
    characterName: name,
    species: species,
    details: details,
    demeanor: demeanor,
  });

  return character;
}
