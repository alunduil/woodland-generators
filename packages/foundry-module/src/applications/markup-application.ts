// SPDX-FileCopyrightText: 2025-2026 Alex Brandt
//
// SPDX-License-Identifier: MIT

/* global foundry */

/**
 * An Application that renders a markup string straight into its window.
 *
 * Skips `HandlebarsApplicationMixin`, which would mean shipping a template file
 * and resolving its path at runtime for markup this small.
 */
export default abstract class MarkupApplication extends foundry.applications.api.ApplicationV2 {
  /** The icon on every window and menu entry the module adds. */
  static readonly ICON = "fa-solid fa-tree";

  protected abstract override _renderHTML(): Promise<string>;

  protected override _replaceHTML(result: string, content: HTMLElement): void {
    content.innerHTML = result;
  }
}
