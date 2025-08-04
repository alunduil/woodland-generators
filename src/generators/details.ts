import { GeneratorOptions } from "./index";
import SeededRandomUtilities from "seeded-random-utilities";
import { root } from "../logging";
import { Details } from "../details";

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
 * Generate details for a category, either from user input or by random generation
 */
function generateDetailsForCategory(
  details: string[] | undefined,
  choices: string[],
  rng: SeededRandomUtilities,
): string[] {
  return (
    details ?? rng.selectUniqueRandomElements(choices, rng.getRandomIntegar(1, choices.length))
  );
}

/**
 * Validate user-provided details against available choices
 */
function validateDetailsForCategory(
  category: string,
  details: string[] | undefined,
  choices: string[],
  logger: typeof root,
): void {
  if (!details) return;

  const invalidItems = details.filter((item) => !choices.includes(item));
  if (invalidItems.length > 0) {
    logger.error({
      msg: `Invalid user ${category} provided`,
      invalidItems,
      choices,
    });
    throw new Error(
      `Invalid ${category} provided: ${invalidItems.join(", ")}. Must be from available choices.`,
    );
  }
}

/**
 * Generate random character details using functional approach
 */
export function generateDetails(options: DetailsGeneratorOptions): Details {
  const logger = root.child({
    generator: "details",
  });

  logger.info({
    msg: "Starting details generation",
    seed: options.seed,
    choices: options.choices,
    details: options.details,
  });

  // Validate all categories have choices available
  const missingCategories = [];
  if (!options.choices.pronouns.length) missingCategories.push("pronouns");
  if (!options.choices.appearance.length) missingCategories.push("appearance");
  if (!options.choices.accessories.length) missingCategories.push("accessories");

  if (missingCategories.length > 0) {
    logger.error({
      msg: "Missing detail choices for required categories",
      seed: options.seed,
      choices: options.choices,
      missingCategories: missingCategories,
    });
    throw new Error(`Missing detail choices for categories: ${missingCategories.join(", ")}`);
  }

  const rng = new SeededRandomUtilities(options.seed);

  // Generate details for each category (user-provided or generated)
  const pronouns = generateDetailsForCategory(
    options.details?.pronouns,
    options.choices.pronouns,
    rng,
  );

  const appearance = generateDetailsForCategory(
    options.details?.appearance,
    options.choices.appearance,
    rng,
  );

  const accessories = generateDetailsForCategory(
    options.details?.accessories,
    options.choices.accessories,
    rng,
  );

  // Validate user-provided details if present
  validateDetailsForCategory(
    "pronouns",
    options.details?.pronouns,
    options.choices.pronouns,
    logger,
  );
  validateDetailsForCategory(
    "appearance",
    options.details?.appearance,
    options.choices.appearance,
    logger,
  );
  validateDetailsForCategory(
    "accessories",
    options.details?.accessories,
    options.choices.accessories,
    logger,
  );

  const result = {
    pronouns,
    appearance,
    accessories,
  };

  logger.info({
    msg: "Details generation completed",
    seed: options.seed,
    choices: options.choices,
    details: result,
  });

  return result;
}
