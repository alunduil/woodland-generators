// SPDX-FileCopyrightText: 2025-2026 Alex Brandt
//
// SPDX-License-Identifier: MIT

/* global foundry */

import { FACTIONS, type Faction } from "../generators/clearing-tables.js";
import { MODULE_ID } from "../module-id.js";

const KEY = "factions";

/**
 * `choices` keeps a stored value a subset of `FACTIONS`. `validate` refuses a
 * Woodland with nobody in it, which `generateClearing` would refuse to rule.
 */
const FIELD = new foundry.data.fields.SetField(
  new foundry.data.fields.StringField({ required: true, blank: false, choices: FACTIONS }),
  {
    required: true,
    nullable: false,
    validate: (value: Iterable<unknown>): boolean => [...value].length > 0,
  },
);

declare global {
  interface SettingConfig extends Record<`${typeof MODULE_ID}.${typeof KEY}`, typeof FIELD> {}
}

/**
 * The factions in play, a property of the campaign's Woodland rather than of
 * one generated clearing, so a GM answers once per world.
 *
 * `scope: "world"` is the GM gate: Foundry lets only a user with
 * `SETTINGS_MODIFY` change a world setting, and settings take no `restricted`
 * flag of their own.
 */
export function registerFactions(game: InitGame): void {
  game.settings.register(MODULE_ID, KEY, {
    name: "WOODLAND-GENERATORS.Settings.Factions.Name",
    hint: "WOODLAND-GENERATORS.Settings.Factions.Hint",
    scope: "world",
    config: true,
    type: FIELD,
    default: [...FACTIONS],
  });
}

/**
 * The factions in play, in the shape `ClearingGeneratorOptions.factions` takes.
 *
 * fvtt-types types a `DataField` setting's value as everything the field
 * accepts on assignment, `null` and keyed objects included. The stored value
 * is a collection of `choices`, and `default` stands in until a GM saves one.
 */
export function readFactions(game: ReadyGame): Faction[] {
  return [...(game.settings.get(MODULE_ID, KEY) as Iterable<Faction>)];
}
