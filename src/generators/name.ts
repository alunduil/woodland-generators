import { GeneratorOptions } from "./index";
import SeededRandomUtilities from "seeded-random-utilities";
import { root } from "../logging";

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
  const logger = root.child({
    generator: "name",
  });

  logger.info({
    msg: "Starting name generation",
    seed: options.seed,
    characterName: options.name,
  });

  let result: string;

  // If user provided a name, use it directly
  if (options.name) {
    result = options.name;
  } else {
    // Create seeded random generator for reproducible selection
    const rng = new SeededRandomUtilities(options.seed);
    result = rng.selectRandomElement([...CHARACTER_NAMES]);
  }

  logger.info({
    msg: "Name generation completed",
    seed: options.seed,
    characterName: result,
  });

  return result;
}
