// SPDX-FileCopyrightText: 2025-2026 Alex Brandt
//
// SPDX-License-Identifier: MIT

/* global foundry, game */

import { generateClearings } from "../generators/clearing.js";
import { MODULE_ID } from "../module-id.js";
import { readFactions } from "../settings/factions.js";
import MarkupApplication from "./markup-application.js";

/** What a GM asked the dialog for, once the form has passed its checks. */
interface ClearingRequest {
  count: number;
  seed: string;
}

/**
 * Throwing is how a form refuses a submission: Foundry shows the message as an
 * error notification and leaves the dialog open.
 */
function parseRequest(
  formData: foundry.applications.ux.FormDataExtended,
  i18n: ReadyGame["i18n"],
): ClearingRequest {
  const { count, seed } = formData.object as { count: number | null; seed: string };

  if (count === null || !Number.isInteger(count) || count < 1) {
    throw new Error(i18n.localize("WOODLAND-GENERATORS.Clearing.CountTooLow"));
  }

  return { count, seed };
}

/** Draws a batch of clearings from the factions in play. */
async function generate(
  _event: Event,
  _form: HTMLFormElement,
  formData: foundry.applications.ux.FormDataExtended,
): Promise<void> {
  const ready = game as ReadyGame;
  const request = parseRequest(formData, ready.i18n);

  console.log(`${MODULE_ID} |`, generateClearings({ ...request, factions: readFactions(ready) }));
}

/**
 * Asks how many clearings to draw and from what seed.
 *
 * The factions in play come from the world setting rather than a field here,
 * because they belong to the campaign, not to one batch.
 */
export default class ClearingDialog extends MarkupApplication {
  static override DEFAULT_OPTIONS = {
    id: "woodland-generators-clearing",
    tag: "form",
    classes: ["woodland-generators", "clearing-dialog"],
    window: {
      title: "WOODLAND-GENERATORS.Clearing.Title",
      icon: MarkupApplication.ICON,
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

    return `
      ${this.#field("count", i18n.localize("WOODLAND-GENERATORS.Clearing.Count"), 'type="number" value="1" min="1" step="1"')}
      ${this.#field("seed", i18n.localize("WOODLAND-GENERATORS.Clearing.Seed"), `type="text" value="${foundry.utils.randomID()}"`)}
      <footer class="form-footer">
        <button type="submit"><i class="fa-solid fa-dice"></i> ${i18n.localize("WOODLAND-GENERATORS.Clearing.Generate")}</button>
      </footer>`;
  }

  /** A required, labelled input, laid out the way Foundry's stylesheet expects. */
  #field(name: string, label: string, attributes: string): string {
    const id = `${this.id}-${name}`;

    return `
      <div class="form-group">
        <label for="${id}">${label}</label>
        <input id="${id}" name="${name}" ${attributes} required>
      </div>`;
  }
}
