import { GeneratorOptions } from "./index";
import SeededRandomUtilities from "seeded-random-utilities";

/**
 * Extended list of woodland animals compatible with Root's ecosystem
 * Used when "other" is selected as a species option
 *
 * This curated list follows Root RPG guidelines:
 * - No larger than wolf-sized (bears, moose, deer are NPCs/mysteries)
 * - Primarily mammals and birds for anthropomorphic consistency
 * - Land-based woodland dwellers (no purely aquatic species)
 * - No insects (scale and anthropomorphic issues)
 *
 * Each category represents different ecological niches within the Woodland:
 *
 * **Canopy Dwellers** - Arboreal specialists living in tree-tops
 * **Understory Inhabitants** - Mid-level forest dwellers
 * **Ground Foragers** - Forest floor specialists
 * **Burrow Dwellers** - Underground and den-based species
 * **Woodland Edge** - Species near clearings and forest borders
 * **Nocturnal Specialists** - Night-active woodland creatures
 * **Small Predators** - Appropriately-sized woodland hunters
 * **Woodland Birds** - Traditional forest bird species
 *
 * When a playbook includes "other" as a species option and it gets
 * randomly selected, the generator will pick from this Root-appropriate list.
 */
export const EXTENDED_WOODLAND_SPECIES = [
  // Canopy Dwellers - Arboreal specialists
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

  // Understory Inhabitants - Mid-level forest species
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

  // Ground Foragers - Forest floor specialists
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

  // Burrow Dwellers - Underground specialists
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

  // Woodland Edge - Stream and clearing border species
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

  // Nocturnal Specialists - Night-active woodland creatures
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

  // Small Predators - Appropriately-sized woodland hunters (wolf-sized or smaller)
  "weasel",
  "stoat",
  "ermine",
  "ferret",
  "mink",
  "marten",
  "red fox",
  "gray fox",

  // Woodland Birds - Traditional forest bird species
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

  // Amphibians - Woodland moisture specialists (anthropomorphic-friendly)
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

/**
 * Options for functional species generation
 */
export interface SpeciesGeneratorOptions extends GeneratorOptions {
  /** Species choices available for selection (from playbook) */
  choices: string[];
  /** Specific species to use (user override) */
  species?: string;
}

/**
 * Generate a random character species using functional approach
 */
export function generateSpecies(options: SpeciesGeneratorOptions): string {
  if (options.choices.length === 0) {
    throw new Error("No species available for generation");
  }

  // Handle user-provided species
  if (options.species) {
    if (!options.choices.includes("other") && !options.choices.includes(options.species)) {
      throw new Error(
        `Species "${options.species}" is not available in this playbook. Available choices: ${options.choices.join(", ")}`,
      );
    }
    return options.species;
  }

  // Generate random selection
  const rng = new SeededRandomUtilities(options.seed);
  let selected = rng.selectRandomElement(options.choices);

  if (!selected) {
    throw new Error("Failed to generate species");
  }

  if (selected !== "other") {
    return selected;
  }

  // Handle "other" selection - reassign to extended species
  selected = rng.selectRandomElement([...EXTENDED_WOODLAND_SPECIES]);
  if (!selected) {
    throw new Error("Failed to generate extended species");
  }

  return selected;
}
