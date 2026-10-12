// SPDX-FileCopyrightText: 2025-2026 Alex Brandt
//
// SPDX-License-Identifier: MIT

/* global Hooks, game */

import GeneratorMenu from "./applications/generator-menu.js";
import { MODULE_ID } from "./module-id.js";
import { registerFactions } from "./settings/factions.js";

// i18nInit, not init: the translation catalog loads just before this hook, so
// localize resolves the key rather than echoing it back.
Hooks.once("i18nInit", () => {
  const { i18n } = game as I18nInitGame;

  console.log(`${MODULE_ID} | ${i18n.localize("WOODLAND-GENERATORS.Initialized")}`);
});

Hooks.once("init", () => {
  GeneratorMenu.register(game as InitGame);
  registerFactions(game as InitGame);
});
