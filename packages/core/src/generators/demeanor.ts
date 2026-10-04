// SPDX-FileCopyrightText: 2025-2026 Alex Brandt
//
// SPDX-License-Identifier: MIT

import { Rng } from "@woodland-generators/random";

import { GeneratorOptions } from "./index";
import { root } from "../logging";
import { generateSubsetFromChoices } from "./core";

export interface DemeanorGeneratorOptions extends GeneratorOptions {
  /** Available demeanor choices from playbook */
  choices: string[];
  /** User-provided demeanor traits (if provided, these will be used instead of generating) */
  demeanor?: string[];
}

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

  const rng = new Rng(options.seed);

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
