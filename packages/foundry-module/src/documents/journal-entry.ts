// SPDX-FileCopyrightText: 2025-2026 Alex Brandt
//
// SPDX-License-Identifier: MIT

import type { Clearing } from "../generators/clearing.js";

function list(items: readonly string[]): string {
  return `<ul>${items.map((item) => `<li>${item}</li>`).join("")}</ul>`;
}

function renderClearing(clearing: Clearing, sceneId: string, i18n: ReadyGame["i18n"]): string {
  const localize = (key: string): string =>
    i18n.localize(`WOODLAND-GENERATORS.Clearing.Journal.${key}`);
  const field = (key: string, value: string): string =>
    `<p><strong>${localize(key)}:</strong> ${value}</p>`;
  const heading = (key: string): string => `<h2>${localize(key)}</h2>`;

  return [
    field("Ruler", clearing.ruler),
    heading("Features"),
    list(clearing.features),
    heading("Denizens"),
    list(clearing.inhabitants),
    heading("Conflict"),
    field("Challenger", clearing.conflict.challenger),
    field("Stake", clearing.conflict.over),
    field("Scene", `@UUID[Scene.${sceneId}]{${clearing.name}}`),
    "<hr>",
    `<p><em>${localize("Notice")}</em></p>`,
  ].join("\n");
}

/**
 * A clearing's Journal entry, linking to its Scene.
 *
 * Foundry answers a click on a Scene link by opening that Scene's journal, so
 * the link names the Scene but doesn't open it.
 */
export function clearingJournalEntry(
  clearing: Clearing,
  ids: { journal: string; scene: string },
  i18n: ReadyGame["i18n"],
): JournalEntry.CreateData {
  return {
    _id: ids.journal,
    name: clearing.name,
    pages: [
      {
        name: clearing.name,
        type: "text",
        text: { content: renderClearing(clearing, ids.scene, i18n) },
      },
    ],
  };
}
