/**
 * Character generation interfaces and common types
 */

/**
 * Common options for all generators
 */
export interface GeneratorOptions {
  /** Seed for reproducible random generation */
  seed: string;
}

// Export the functional generators and their options
export { generateCharacter, type CharacterGeneratorOptions } from "./character";
export { generatePlaybook, type PlaybookGeneratorOptions } from "./playbook";
export { generateName, type NameGeneratorOptions } from "./name";
export { generateSpecies, type SpeciesGeneratorOptions } from "./species";
export { generateDetails, type DetailsGeneratorOptions } from "./details";
