// SPDX-FileCopyrightText: 2025-2026 Alex Brandt
//
// SPDX-License-Identifier: MIT

/* global Hooks, game */

import GeneratorMenu from "./applications/generator-menu.js";

const MODULE_ID = "woodland-generators";

// i18nInit, not init: the translation catalog loads just before this hook, so
// localize resolves the key rather than echoing it back.
Hooks.once("i18nInit", () => {
  const { i18n } = game as I18nInitGame;

  console.log(`${MODULE_ID} | ${i18n.localize("WOODLAND-GENERATORS.Initialized")}`);
});

Hooks.once("init", () => {
  GeneratorMenu.register(game as InitGame, MODULE_ID);
});
