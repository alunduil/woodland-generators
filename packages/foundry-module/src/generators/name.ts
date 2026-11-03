// SPDX-FileCopyrightText: 2025-2026 Alex Brandt
//
// SPDX-License-Identifier: MIT

import { Rng } from "@woodland-generators/random";

import { GeneratorOptions } from "./index";
import { root } from "../logging";

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

export interface NameGeneratorOptions extends GeneratorOptions {
  /** Used as-is instead of generating; not validated. */
  name?: string;
}

export function generateName(options: NameGeneratorOptions): string {
  const logger = root.child({
    generator: "name",
    seed: options.seed,
  });

  logger.info({
    msg: "Starting name generation",
    characterName: options.name,
  });

  let result: string;

  if (options.name) {
    result = options.name;
  } else {
    const rng = new Rng(options.seed);
    result = rng.selectRandomElement([...CHARACTER_NAMES]);
  }

  logger.info({
    msg: "Name generation completed",
    characterName: result,
  });

  return result;
}
