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
  const label = (key: string): string => `<strong>${localize(key)}:</strong>`;
  const heading = (key: string): string => `<h2>${localize(key)}</h2>`;

  return [
    `<p>${label("Ruler")} ${clearing.ruler}</p>`,
    heading("Features"),
    list(clearing.features),
    heading("Denizens"),
    list(clearing.inhabitants),
    heading("Conflict"),
    `<p>${label("Challenger")} ${clearing.conflict.challenger}</p>`,
    `<p>${label("Stake")} ${clearing.conflict.over}</p>`,
    `<p>${label("Scene")} @UUID[Scene.${sceneId}]{${clearing.name}}</p>`,
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
  { id, sceneId }: { id: string; sceneId: string },
  i18n: ReadyGame["i18n"],
): JournalEntry.CreateData {
  return {
    _id: id,
    name: clearing.name,
    pages: [
      {
        name: clearing.name,
        type: "text",
        text: { content: renderClearing(clearing, sceneId, i18n) },
      },
    ],
  };
}
