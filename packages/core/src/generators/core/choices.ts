// SPDX-FileCopyrightText: 2025-2026 Alex Brandt
//
// SPDX-License-Identifier: MIT

import { Logger } from "pino";
import { Rng } from "@woodland-generators/random";

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
 * A copy of `selection` when given, otherwise a random non-empty subset of
 * `choices`. Throws when `choices` is empty or `selection` strays outside it.
 */
export function generateSubsetFromChoices<T extends string>(
  category: string,
  selection: T[] | undefined,
  choices: T[],
  rng: Rng,
  logger: Logger,
): T[] {
  validateChoicesNonEmpty(category, choices, logger);

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

  const count = rng.getRandomIntInclusive(1, choices.length);
  return rng.selectRandomSample(choices, count) as T[];
}

/** `generateSubsetFromChoices` per category of `choices`. */
export function generateMultipleFromChoices<T extends string, K extends string>(
  selections: Record<K, T[] | undefined>,
  choices: Record<K, T[]>,
  rng: Rng,
  logger: Logger,
): Record<K, T[]> {
  const result = {} as Record<K, T[]>;

  for (const [category, categoryChoices] of Object.entries(choices) as [K, T[]][]) {
    const selection = selections[category];
    result[category] = generateSubsetFromChoices(category, selection, categoryChoices, rng, logger);
  }

  return result;
}

/**
 * `selection` when given, otherwise a random element of `choices`. Throws when
 * `choices` is empty or omits `selection`.
 */
export function generateSingleFromChoices<T extends string>(
  category: string,
  selection: T | undefined,
  choices: T[],
  rng: Rng,
  logger: Logger,
): T {
  validateChoicesNonEmpty(category, choices, logger);

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
