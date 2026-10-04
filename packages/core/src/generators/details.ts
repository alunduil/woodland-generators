// SPDX-FileCopyrightText: 2025-2026 Alex Brandt
//
// SPDX-License-Identifier: MIT

import { Rng } from "@woodland-generators/random";

import { GeneratorOptions } from "./index";
import { root } from "../logging";
import { Details } from "../details";
import { generateMultipleFromChoices } from "./core";

export interface DetailsGeneratorOptions extends GeneratorOptions {
  /** The playbook's detail choices, per category. */
  choices: Details;
  /** Used instead of generating, per category. Each detail must be one of `choices`. */
  details?: Partial<Details>;
}

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

  const rng = new Rng(options.seed);

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
    pronouns: generated.pronouns,
    appearance: generated.appearance,
    accessories: generated.accessories,
  };

  logger.info({
    msg: "Details generation completed",
    choices: options.choices,
    details: result,
  });

  return result;
}
