import { GeneratorOptions } from "./index";

/**
 * Options for functional species generation
 */
export interface SpeciesGeneratorOptions extends GeneratorOptions {
  /** Species choices available for selection (from playbook) */
  choices: string[];
  /** Specific species to use (user override) */
  species?: string;
}

/**
 * Generate a random character species using functional approach
 */
export function generateSpecies(options: SpeciesGeneratorOptions): string {
  if (options.choices.length === 0) {
    throw new Error("No species available for generation");
  }

  // If user provided a species, validate it against choices
  if (options.species) {
    // If choices include "other" or the specific species, allow it
    if (options.choices.includes("other") || options.choices.includes(options.species)) {
      return options.species;
    }

    // Otherwise, the species is not available
    throw new Error(
      `Species "${options.species}" is not available in this playbook. Available choices: ${options.choices.join(", ")}`,
    );
  }

  // Use seed for reproducible selection
  const seedNum = options.seed
    .split("")
    .reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
  const index = seedNum % options.choices.length;
  const species = options.choices[index];

  if (!species) {
    throw new Error("Failed to generate species");
  }

  return species;
}
