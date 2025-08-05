import { GeneratorOptions } from "./index";
import SeededRandomUtilities from "seeded-random-utilities";
import { root } from "../logging";
import { Details } from "../details";
import { generateMultipleFromChoices } from "./core/choices";

/**
 * Options for functional details generation
 */
export interface DetailsGeneratorOptions extends GeneratorOptions {
  /** Available detail choices from playbook */
  choices: Details;
  /** User-provided details (if provided, these will be used instead of generating) */
  details?: Partial<Details>;
}

/**
 * Generate random character details using functional approach
 */
export function generateDetails(options: DetailsGeneratorOptions): Details {
  const logger = root.child({
    generator: "details",
    seed: options.seed,
  });

  logger.info({
    msg: "Starting details generation",
    choices: options.choices,
    details: options.details,
  });

  const rng = new SeededRandomUtilities(options.seed);

  // Generate details for each category (user-provided or generated, with validation)
  const generated = generateMultipleFromChoices(
    {
      pronouns: options.details?.pronouns,
      appearance: options.details?.appearance,
      accessories: options.details?.accessories,
    },
    {
      pronouns: options.choices.pronouns,
      appearance: options.choices.appearance,
      accessories: options.choices.accessories,
    },
    rng,
    logger,
  );

  const result: Details = {
    pronouns: generated.pronouns ?? [],
    appearance: generated.appearance ?? [],
    accessories: generated.accessories ?? [],
  };

  logger.info({
    msg: "Details generation completed",
    choices: options.choices,
    details: result,
  });

  return result;
}
