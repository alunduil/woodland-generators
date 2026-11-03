// SPDX-FileCopyrightText: 2025-2026 Alex Brandt
//
// SPDX-License-Identifier: MIT

export interface GeneratorOptions {
  seed: string;
}

export { generateCharacter, type CharacterGeneratorOptions } from "./character";
export { generateName, type NameGeneratorOptions } from "./name";
export { generateSpecies, type SpeciesGeneratorOptions } from "./species";
export { generateDetails, type DetailsGeneratorOptions } from "./details";
export { generateDemeanor, type DemeanorGeneratorOptions } from "./demeanor";
