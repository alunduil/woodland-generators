// SPDX-FileCopyrightText: 2025-2026 Alex Brandt
//
// SPDX-License-Identifier: MIT

/* global foundry, game */

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
      icon: "fa-solid fa-tree",
    },
    position: { width: 480 },
  };

  protected override async _renderHTML(): Promise<string> {
    const empty = game.i18n?.localize("WOODLAND-GENERATORS.Menu.Empty") ?? "";

    return `<p class="notification info">${empty}</p>`;
  }

  protected override _replaceHTML(result: string, content: HTMLElement): void {
    content.innerHTML = result;
  }
}
