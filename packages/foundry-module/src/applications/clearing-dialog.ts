// SPDX-FileCopyrightText: 2025-2026 Alex Brandt
//
// SPDX-License-Identifier: MIT

/* global foundry, game */

import { createClearingDocuments } from "../documents/clearing.js";
import { generateClearings } from "../generators/clearing.js";
import { readFactions } from "../settings/factions.js";
import MarkupApplication from "./markup-application.js";

/** A validated submission: `count` is a whole number of at least one. */
interface ClearingRequest {
  count: number;
  seed: string;
}

interface InputAttributes {
  type: "number" | "text";
  value: number | string;
  min?: number;
  step?: number;
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

async function generate(
  _event: Event,
  _form: HTMLFormElement,
  formData: foundry.applications.ux.FormDataExtended,
): Promise<void> {
  const ready = game as ReadyGame;
  const request = parseRequest(formData, ready.i18n);

  const clearings = generateClearings({ ...request, factions: readFactions(ready) });

  await createClearingDocuments(clearings, ready.i18n);
}

/**
 * Asks how many clearings to draw and from what seed.
 *
 * The factions in play come from the world setting, since they belong to the
 * campaign.
 */
export default class ClearingDialog extends MarkupApplication {
  static override DEFAULT_OPTIONS = {
    id: "woodland-generators-clearing",
    tag: "form",
    classes: ["clearing-dialog"],
    window: { title: "WOODLAND-GENERATORS.Clearing.Title" },
    position: { width: 360 },
    form: { handler: generate, submitOnChange: false, closeOnSubmit: true },
  };

  /**
   * The seed starts random, so the field always shows what to reuse to redraw
   * the batch.
   */
  protected override async _renderHTML(): Promise<string> {
    const { i18n } = game as I18nInitGame;
    const label = (key: string): string => i18n.localize(`WOODLAND-GENERATORS.Clearing.${key}`);

    return `
      ${this.#field("count", label("Count"), { type: "number", value: 1, min: 1, step: 1 })}
      ${this.#field("seed", label("Seed"), { type: "text", value: foundry.utils.randomID() })}
      <footer class="form-footer">
        <button type="submit"><i class="fa-solid fa-dice"></i> ${label("Generate")}</button>
      </footer>`;
  }

  #field(name: string, label: string, input: InputAttributes): string {
    const id = `${this.id}-${name}`;
    const attributes = Object.entries(input)
      .map(([attribute, value]) => `${attribute}="${value}"`)
      .join(" ");

    return `
      <div class="form-group">
        <label for="${id}">${label}</label>
        <input id="${id}" name="${name}" ${attributes} required>
      </div>`;
  }
}
