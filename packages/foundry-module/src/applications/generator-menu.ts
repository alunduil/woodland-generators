// SPDX-FileCopyrightText: 2025-2026 Alex Brandt
//
// SPDX-License-Identifier: MIT

/* global game */

import { MODULE_ID } from "../module-id.js";
import ClearingDialog from "./clearing-dialog.js";
import MarkupApplication from "./markup-application.js";

/** The launcher listing the generators the module offers. */
export default class GeneratorMenu extends MarkupApplication {
  static override DEFAULT_OPTIONS = {
    id: "woodland-generators-menu",
    classes: ["woodland-generators", "generator-menu"],
    window: {
      title: "WOODLAND-GENERATORS.Menu.Title",
      icon: MarkupApplication.ICON,
    },
    position: { width: 480 },
    actions: {
      clearing: (): void => void new ClearingDialog().render({ force: true }),
    },
  };

  /**
   * Add the launcher to Configure Settings → Module Settings.
   *
   * `restricted` is Foundry's own GM gate, which saves the module a
   * `game.user.isGM` check of its own to keep correct.
   */
  static register(game: InitGame): void {
    game.settings.registerMenu(MODULE_ID, "generators", {
      name: "WOODLAND-GENERATORS.Menu.Name",
      label: "WOODLAND-GENERATORS.Menu.Label",
      hint: "WOODLAND-GENERATORS.Menu.Hint",
      icon: MarkupApplication.ICON,
      type: GeneratorMenu,
      restricted: true,
    });
  }

  protected override async _renderHTML(): Promise<string> {
    const { i18n } = game as I18nInitGame;

    return `<button type="button" data-action="clearing">${i18n.localize("WOODLAND-GENERATORS.Menu.Clearing")}</button>`;
  }
}
