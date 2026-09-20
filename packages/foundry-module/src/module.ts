// SPDX-FileCopyrightText: 2025-2026 Alex Brandt
//
// SPDX-License-Identifier: MIT

/* global Hooks, game */

import GeneratorMenu from "./applications/generator-menu.js";

const MODULE_ID = "woodland-generators";

// i18nInit, not init: the translation catalog loads just before this hook, so
// localize resolves the key rather than echoing it back.
Hooks.once("i18nInit", () => {
  if (game.i18n) {
    console.log(`${MODULE_ID} | ${game.i18n.localize("WOODLAND-GENERATORS.Initialized")}`);
  }
});

// A submenu of Configure Settings rather than a scene control or a sidebar
// tab, so `restricted` is Foundry's own GM gate instead of a `game.user.isGM`
// check the module has to keep correct.
Hooks.once("init", () => {
  game.settings?.registerMenu(MODULE_ID, "generators", {
    name: "WOODLAND-GENERATORS.Menu.Name",
    label: "WOODLAND-GENERATORS.Menu.Label",
    hint: "WOODLAND-GENERATORS.Menu.Hint",
    icon: "fa-solid fa-tree",
    type: GeneratorMenu,
    restricted: true,
  });
});
