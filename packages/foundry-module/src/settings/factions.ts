// SPDX-FileCopyrightText: 2025-2026 Alex Brandt
//
// SPDX-License-Identifier: MIT

/* global foundry */

import { FACTIONS, type Faction } from "../generators/clearing-tables.js";
import { MODULE_ID } from "../module-id.js";

const KEY = "factions";

/**
 * Keyed by faction because Foundry keys an array of choices by index, so the
 * stored names would match no option.
 */
const CHOICES = Object.fromEntries(FACTIONS.map((faction) => [faction, faction]));

/** `validate` refuses an empty set, because `generateClearing` throws on one. */
const FIELD = new foundry.data.fields.SetField(
  new foundry.data.fields.StringField({ required: true, blank: false, choices: CHOICES }),
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
 * The factions in play belong to the campaign's Woodland, so a GM sets them
 * once per world.
 *
 * A setting has no `restricted` flag. `scope: "world"` is the GM gate: only a
 * user with `SETTINGS_MODIFY` can change a world setting.
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
 * The factions in play, as `ClearingGeneratorOptions.factions` takes them.
 *
 * fvtt-types widens a `DataField` setting's value to whatever the field accepts
 * on assignment, `null` included. Foundry stores a collection of `choices`, or
 * `default` until a GM saves one.
 */
export function readFactions(game: ReadyGame): Faction[] {
  return [...(game.settings.get(MODULE_ID, KEY) as Iterable<Faction>)];
}
