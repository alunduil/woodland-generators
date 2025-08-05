import { Logger } from "pino";
import SeededRandomUtilities from "seeded-random-utilities";

/**
 * Validate that choices array is non-empty
 */
export function validateChoicesNonEmpty(category: string, choices: string[], logger: Logger): void {
  if (choices.length === 0) {
    logger.error({
      msg: `No ${category} choices available`,
      choices,
    });
    throw new Error(`No ${category} choices available`);
  }
}

/**
 * Generate random subset from available choices, with user override option
 * Validates user selection before using it
 */
export function generateSubsetFromChoices<T extends string>(
  category: string,
  selection: T[] | undefined,
  choices: T[],
  rng: SeededRandomUtilities,
  logger: Logger,
): T[] {
  // Validate choices are non-empty
  validateChoicesNonEmpty(category, choices, logger);

  // Validate user selection if provided
  if (selection) {
    const invalidItems = selection.filter((item) => !choices.includes(item));
    if (invalidItems.length > 0) {
      logger.error({
        msg: `Invalid ${category} provided`,
        selection,
        choices,
        invalidItems,
      });
      throw new Error(
        `Invalid ${category} provided: ${invalidItems.join(", ")}. Available choices: ${choices.join(", ")}.`,
      );
    }
    return [...selection];
  }

  // Generate 1 to all available random choices
  const count = rng.getRandomIntegar(1, choices.length);
  return rng.selectUniqueRandomElements(choices, count) as T[];
}

/**
 * Generate multiple categories of random selections from available choices
 * Validates all user selections before using them
 */
export function generateMultipleFromChoices<T extends string>(
  selections: Record<string, T[] | undefined>,
  choices: Record<string, T[]>,
  rng: SeededRandomUtilities,
  logger: Logger,
): Record<string, T[]> {
  const result: Record<string, T[]> = {};

  for (const [category, categoryChoices] of Object.entries(choices)) {
    const selection = selections[category];
    result[category] = generateSubsetFromChoices(category, selection, categoryChoices, rng, logger);
  }

  return result;
}

/**
 * Generate a single random selection from available choices, with user override option
 * Validates user selection before using it
 */
export function generateSingleFromChoices<T extends string>(
  category: string,
  selection: T | undefined,
  choices: T[],
  rng: SeededRandomUtilities,
  logger: Logger,
): T {
  // Validate choices are non-empty
  validateChoicesNonEmpty(category, choices, logger);

  // Validate user selection if provided
  if (selection) {
    if (!choices.includes(selection)) {
      logger.error({
        msg: `Invalid ${category} provided`,
        selection,
        choices,
      });
      throw new Error(
        `Invalid ${category} provided: "${selection}". Available choices: ${choices.join(", ")}.`,
      );
    }
    return selection;
  }

  return rng.selectRandomElement(choices) as T;
}
