import { GeneratorOptions } from "./index";
import SeededRandomUtilities from "seeded-random-utilities";

/**
 * Available character names for generation
 */
export const CHARACTER_NAMES = [
  "Bramble",
  "Clover",
  "Daisy",
  "Ember",
  "Fern",
  "Grove",
  "Hazel",
  "Ivy",
  "Jasper",
  "Kestrel",
  "Luna",
  "Moss",
  "Nutkin",
  "Oak",
  "Petal",
  "Quill",
  "Robin",
  "Sage",
  "Thistle",
  "Vale",
  "Willow",
  "Zinnia",
] as const;

/**
 * Get the available character name choices
 * @returns Array of available character names
 */
export function getNameChoices(): readonly string[] {
  return CHARACTER_NAMES;
}

/**
 * Options for functional name generation
 */
export interface NameGeneratorOptions extends GeneratorOptions {
  /** User-provided name (if provided, this will be returned instead of generating) */
  name?: string;
}

/**
 * Generate a random character name using functional approach
 */
export function generateName(options: NameGeneratorOptions): string {
  // If user provided a name, use it directly
  if (options.name) {
    return options.name;
  }

  // Create seeded random generator for reproducible selection
  const rng = new SeededRandomUtilities(options.seed);
  const name = rng.selectRandomElement([...CHARACTER_NAMES]);

  return name;
}
