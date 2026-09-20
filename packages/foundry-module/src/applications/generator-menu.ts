// SPDX-FileCopyrightText: 2025-2026 Alex Brandt
//
// SPDX-License-Identifier: MIT

/* global foundry, game */

// Worn by both the launcher button and the window it opens.
const ICON = "fa-solid fa-tree";

/**
 * The launcher listing the generators the module offers.
 *
 * Rendering goes straight to markup rather than through
 * `HandlebarsApplicationMixin`: a template would be a file to ship in
 * `module.json` and a path to resolve at runtime for one static string.
 */
export default class GeneratorMenu extends foundry.applications.api.ApplicationV2 {
  static override DEFAULT_OPTIONS = {
    id: "woodland-generators-menu",
    classes: ["woodland-generators", "generator-menu"],
    window: {
      title: "WOODLAND-GENERATORS.Menu.Title",
      icon: ICON,
    },
    position: { width: 480 },
  };

  /**
   * Add the launcher to Configure Settings → Module Settings.
   *
   * `restricted` is Foundry's own GM gate, so the module carries no
   * `game.user.isGM` check of its own to keep correct.
   */
  static register(namespace: string): void {
    game.settings?.registerMenu(namespace, "generators", {
      name: "WOODLAND-GENERATORS.Menu.Name",
      label: "WOODLAND-GENERATORS.Menu.Label",
      hint: "WOODLAND-GENERATORS.Menu.Hint",
      icon: ICON,
      type: GeneratorMenu,
      restricted: true,
    });
  }

  protected override async _renderHTML(): Promise<string> {
    const empty = game.i18n?.localize("WOODLAND-GENERATORS.Menu.Empty") ?? "";

    return `<p class="notification info">${empty}</p>`;
  }

  protected override _replaceHTML(result: string, content: HTMLElement): void {
    content.innerHTML = result;
  }
}
