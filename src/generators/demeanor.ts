import { GeneratorOptions } from "./index";
import SeededRandomUtilities from "seeded-random-utilities";
import { root } from "../logging";
import { generateSubsetFromChoices } from "./core";

/**
 * Options for functional demeanor generation
 */
export interface DemeanorGeneratorOptions extends GeneratorOptions {
  /** Available demeanor choices from playbook */
  choices: string[];
  /** User-provided demeanor traits (if provided, these will be used instead of generating) */
  demeanor?: string[];
}

/**
 * Generate random character demeanor using functional approach
 */
export function generateDemeanor(options: DemeanorGeneratorOptions): string[] {
  const logger = root.child({
    generator: "demeanor",
    seed: options.seed,
  });

  logger.info({
    msg: "Starting demeanor generation",
    choices: options.choices,
    demeanor: options.demeanor,
  });

  const rng = new SeededRandomUtilities(options.seed);

  // Generate demeanor (user-provided or generated, with validation)
  const demeanor = generateSubsetFromChoices(
    "demeanor",
    options.demeanor,
    options.choices,
    rng,
    logger,
  );

  logger.info({
    msg: "Demeanor generation completed",
    choices: options.choices,
    demeanor: demeanor,
  });

  return demeanor;
}
