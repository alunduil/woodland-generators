// SPDX-FileCopyrightText: 2025-2026 Alex Brandt
//
// SPDX-License-Identifier: MIT

/* global foundry, game */

import { generateClearings } from "../generators/clearing.js";
import { MODULE_ID } from "../module-id.js";
import { readFactions } from "../settings/factions.js";

/**
 * Draws a batch of clearings from the factions in play.
 *
 * Throwing from the handler is how a form refuses a submission: Foundry shows
 * the message as an error notification and leaves the dialog open.
 */
async function generate(
  _event: Event,
  _form: HTMLFormElement,
  formData: foundry.applications.ux.FormDataExtended,
): Promise<void> {
  const ready = game as ReadyGame;
  const { count, seed } = formData.object as { count: number | null; seed: string };

  if (count === null || !Number.isInteger(count) || count < 1) {
    throw new Error(ready.i18n.localize("WOODLAND-GENERATORS.Clearing.CountTooLow"));
  }

  console.log(`${MODULE_ID} |`, generateClearings({ count, seed, factions: readFactions(ready) }));
}

/**
 * Asks how many clearings to draw and from what seed.
 *
 * The factions in play come from the world setting rather than a field here,
 * because they belong to the campaign, not to one batch.
 */
export default class ClearingDialog extends foundry.applications.api.ApplicationV2 {
  static override DEFAULT_OPTIONS = {
    id: "woodland-generators-clearing",
    tag: "form",
    classes: ["woodland-generators", "clearing-dialog"],
    window: {
      title: "WOODLAND-GENERATORS.Clearing.Title",
      icon: "fa-solid fa-tree",
    },
    position: { width: 360 },
    form: { handler: generate, submitOnChange: false, closeOnSubmit: true },
  };

  /**
   * The seed starts random, so a GM who leaves it alone still gets a batch,
   * and the field shows what to reuse to draw that batch again.
   */
  protected override async _renderHTML(): Promise<string> {
    const { i18n } = game as I18nInitGame;
    const id = (name: string): string => `${this.id}-${name}`;

    return `
      <div class="form-group">
        <label for="${id("count")}">${i18n.localize("WOODLAND-GENERATORS.Clearing.Count")}</label>
        <input id="${id("count")}" type="number" name="count" value="1" min="1" step="1" required>
      </div>
      <div class="form-group">
        <label for="${id("seed")}">${i18n.localize("WOODLAND-GENERATORS.Clearing.Seed")}</label>
        <input id="${id("seed")}" type="text" name="seed" value="${foundry.utils.randomID()}" required>
      </div>
      <footer class="form-footer">
        <button type="submit"><i class="fa-solid fa-dice"></i> ${i18n.localize("WOODLAND-GENERATORS.Clearing.Generate")}</button>
      </footer>`;
  }

  protected override _replaceHTML(result: string, content: HTMLElement): void {
    content.innerHTML = result;
  }
}
