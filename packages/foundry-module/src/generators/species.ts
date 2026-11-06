// SPDX-FileCopyrightText: 2025-2026 Alex Brandt
//
// SPDX-License-Identifier: MIT

import { Rng } from "../random/rng.js";

import { root } from "../logging/index.js";
import { generateSingleFromChoices } from "./choices.js";
import type { GeneratorOptions } from "./options.js";

/**
 * Woodland animals a playbook's "other" species option draws from.
 *
 * This curated list follows Root RPG guidelines:
 * - No larger than wolf-sized (bears, moose, deer are NPCs/mysteries)
 * - Primarily mammals and birds for anthropomorphic consistency
 * - Land-based woodland dwellers (no purely aquatic species)
 * - No insects (scale and anthropomorphic issues)
 */
export const EXTENDED_WOODLAND_SPECIES = [
  // Canopy Dwellers
  "squirrel",
  "flying squirrel",
  "chipmunk",
  "red squirrel",
  "gray squirrel",
  "woodpecker",
  "nuthatch",
  "chickadee",
  "titmouse",
  "treecreeper",
  "cedar waxwing",
  "warbler",
  "vireo",
  "tanager",
  "oriole",

  // Understory Inhabitants
  "cardinal",
  "robin",
  "thrush",
  "jay",
  "catbird",
  "wren",
  "towhee",
  "sparrow",
  "finch",
  "flycatcher",
  "kinglet",
  "raccoon",
  "opossum",
  "porcupine",
  "pine marten",

  // Ground Foragers
  "vole",
  "shrew",
  "mole",
  "groundhog",
  "woodchuck",
  "junco",
  "fox sparrow",
  "hermit thrush",
  "oven bird",
  "wood thrush",
  "veery",

  // Burrow Dwellers
  "badger",
  "marmot",
  "prairie dog",
  "pocket gopher",
  "thirteen-lined ground squirrel",
  "least chipmunk",
  "kangaroo rat",
  "jumping mouse",
  "harvest mouse",
  "deer mouse",
  "white-footed mouse",

  // Woodland Edge
  "beaver",
  "muskrat",
  "otter",
  "water shrew",
  "water vole",
  "wood duck",
  "mallard",
  "teal",
  "kingfisher",
  "turtle",
  "painted turtle",
  "box turtle",

  // Nocturnal Specialists
  "owl",
  "screech owl",
  "barred owl",
  "great horned owl",
  "barn owl",
  "bat",
  "little brown bat",
  "big brown bat",
  "red bat",
  "skunk",
  "least weasel",

  // Small Predators
  "weasel",
  "stoat",
  "ermine",
  "ferret",
  "mink",
  "marten",
  "red fox",
  "gray fox",

  // Woodland Birds
  "grouse",
  "ruffed grouse",
  "partridge",
  "woodcock",
  "mourning dove",
  "band-tailed pigeon",
  "wild turkey",
  "crow",
  "raven",
  "nutcracker",
  "hummingbird",

  // Amphibians
  "salamander",
  "newt",
  "red-backed salamander",
  "spotted salamander",
  "wood frog",
  "tree frog",
  "spring peeper",
  "toad",
  "american toad",
] as const;

export interface SpeciesGeneratorOptions extends GeneratorOptions {
  /** The playbook's species choices. */
  choices: string[];
  /** Used instead of generating. Must be one of `choices` unless they include "other". */
  species?: string;
}

/** A playbook offering "other" accepts any species the user names, listed or not. */
function isCarteBlanche(
  options: SpeciesGeneratorOptions,
): options is SpeciesGeneratorOptions & { species: string } {
  return Boolean(options.species) && options.choices.includes("other");
}

export function generateSpecies(options: SpeciesGeneratorOptions): string {
  const logger = root.child({
    generator: "species",
  });

  logger.info({
    msg: "Starting species generation",
    choices: options.choices,
    species: options.species,
  });

  const rng = new Rng(options.seed);

  let selected = isCarteBlanche(options)
    ? options.species
    : generateSingleFromChoices("species", options.species, options.choices, rng, logger);

  if (selected === "other") {
    selected = generateSingleFromChoices(
      "extended species",
      undefined,
      [...EXTENDED_WOODLAND_SPECIES],
      rng,
      logger,
    );
  }

  logger.info({
    msg: "Species generation completed",
    choices: options.choices,
    species: selected,
  });

  return selected;
}
