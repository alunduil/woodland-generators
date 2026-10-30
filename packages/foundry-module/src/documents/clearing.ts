// SPDX-FileCopyrightText: 2026 Alex Brandt
//
// SPDX-License-Identifier: MIT

/* global foundry */

import type { Clearing } from "../generators/clearing.js";

interface Pair {
  journalId: string;
  sceneId: string;
  clearing: Clearing;
}

function list(items: readonly string[]): string {
  return `<ul>${items.map((item) => `<li>${item}</li>`).join("")}</ul>`;
}

function renderJournal({ sceneId, clearing }: Pair, i18n: ReadyGame["i18n"]): string {
  const localize = (key: string): string =>
    i18n.localize(`WOODLAND-GENERATORS.Clearing.Journal.${key}`);
  const label = (key: string): string => `<strong>${localize(key)}:</strong>`;
  const heading = (key: string): string => `<h2>${localize(key)}</h2>`;

  return [
    `<p>${label("Ruler")} ${clearing.ruler}</p>`,
    heading("Features"),
    list(clearing.features),
    heading("Inhabitants"),
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
 * Create a Journal entry and a Scene for each clearing, linked to each other.
 *
 * The IDs are drawn up front and kept on creation, so each document can name
 * its partner without a second round trip to update it.
 *
 * The Scene reaches its Journal entry through its `journal` field. The Journal
 * entry's link to its Scene is only a reference: Foundry answers a click on a
 * Scene link by opening that Scene's journal, which is the entry itself.
 *
 * Scenes start without a background image, a placeholder until the GM sets a
 * map, and stay out of the navigation bar, so a batch doesn't crowd it.
 */
export async function createClearingDocuments(
  clearings: readonly Clearing[],
  i18n: ReadyGame["i18n"],
): Promise<void> {
  const pairs: Pair[] = clearings.map((clearing) => ({
    journalId: foundry.utils.randomID(),
    sceneId: foundry.utils.randomID(),
    clearing,
  }));

  await foundry.documents.JournalEntry.createDocuments(
    pairs.map((pair) => ({
      _id: pair.journalId,
      name: pair.clearing.name,
      pages: [
        {
          name: pair.clearing.name,
          type: "text",
          text: { content: renderJournal(pair, i18n) },
        },
      ],
    })),
    { keepId: true },
  );

  await foundry.documents.Scene.createDocuments(
    pairs.map(({ sceneId, journalId, clearing }) => ({
      _id: sceneId,
      name: clearing.name,
      journal: journalId,
      navigation: false,
    })),
    { keepId: true },
  );
}
