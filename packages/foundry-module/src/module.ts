// SPDX-FileCopyrightText: 2025-2026 Alex Brandt
//
// SPDX-License-Identifier: MIT

/* global Hooks, game */
const MODULE_ID = "woodland-generators";

// i18nInit, not init: the translation catalog loads just before this hook, so
// localize resolves the key rather than echoing it back.
Hooks.once("i18nInit", () => {
  if (game.i18n) {
    console.log(`${MODULE_ID} | ${game.i18n.localize("WOODLAND-GENERATORS.Initialized")}`);
  }
});
