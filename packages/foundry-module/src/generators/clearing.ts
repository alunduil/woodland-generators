// SPDX-FileCopyrightText: 2025-2026 Alex Brandt
//
// SPDX-License-Identifier: MIT

/* global foundry */

import { Rng } from "@woodland-generators/random";

import {
  CLEARING_FEATURES,
  CLEARING_NAMES,
  CONFLICT_SUBJECTS,
  DENIZEN_SPECIES,
  LOCAL_CHALLENGERS,
  type Challenger,
  type ClearingFeature,
  type ClearingName,
  type ConflictSubject,
  type DenizenSpecies,
  type Faction,
} from "./clearing-tables.js";
import { factionsInPlay } from "./factions-in-play.js";

/** The trouble the clearing is in. */
interface Conflict {
  challenger: Challenger;
  over: ConflictSubject;
}

export interface Clearing {
  name: ClearingName;
  features: ClearingFeature[];
  inhabitants: DenizenSpecies[];
  ruler: Faction;
  conflict: Conflict;
}

export interface ClearingGeneratorOptions {
  seed: string;
  /** The factions in play in this Woodland; defaults to all of them. */
  factions?: Faction[];
  /** Overrides the ruler draw. */
  ruler?: Faction;
}

const MAX_FEATURES = 3;

const MAX_INHABITANTS = 2;

/** Draw one to `most` distinct entries from `table`. */
function drawAtLeastOne<T>(rng: Rng, table: readonly T[], most: number): T[] {
  return rng.selectRandomSample(table, rng.getRandomIntInclusive(1, most));
}

function drawConflict(rng: Rng, inPlay: Faction[], ruler: Faction): Conflict {
  const challengers: Challenger[] = [
    ...inPlay.filter((faction) => faction !== ruler),
    ...LOCAL_CHALLENGERS,
  ];

  return {
    challenger: rng.selectRandomElement(challengers),
    over: rng.selectRandomElement(CONFLICT_SUBJECTS),
  };
}

/**
 * Generate a Woodland clearing, deterministically on `options.seed`.
 *
 * Supplying `ruler` skips that draw, so the rest of the clearing differs from
 * what the same seed produces without it.
 *
 * Throws when no factions are in play, or when `ruler` is not among them.
 */
export function generateClearing(options: ClearingGeneratorOptions): Clearing {
  const inPlay = factionsInPlay(options.factions);

  if (options.ruler && !inPlay.includes(options.ruler)) {
    throw new Error(
      `Invalid ruler provided: "${options.ruler}". Available choices: ${inPlay.join(", ")}.`,
    );
  }

  const rng = new Rng(options.seed);
  const ruler = options.ruler ?? rng.selectRandomElement(inPlay);

  return {
    features: drawAtLeastOne(rng, CLEARING_FEATURES, MAX_FEATURES),
    inhabitants: drawAtLeastOne(rng, DENIZEN_SPECIES, MAX_INHABITANTS),
    ruler,
    conflict: drawConflict(rng, inPlay, ruler),
    name: rng.selectRandomElement(CLEARING_NAMES),
  };
}

interface ClearingBatchOptions extends ClearingGeneratorOptions {
  count: number;
}

/**
 * Generate `count` clearings, deterministically on `options.seed`.
 *
 * Clearing `n`, counting from one, is `generateClearing` on the seed
 * `${seed}-${n}`, so any one clearing in a batch redraws on its own. For the
 * same reason, two clearings in a batch can share a name.
 */
export function generateClearings({ count, seed, ...options }: ClearingBatchOptions): Clearing[] {
  return Array.from({ length: count }, (_, index) =>
    generateClearing({ ...options, seed: `${seed}-${index + 1}` }),
  );
}

function list(items: readonly string[]): string {
  return `<ul>${items.map((item) => `<li>${item}</li>`).join("")}</ul>`;
}

function renderJournal(clearing: Clearing, sceneId: string, i18n: ReadyGame["i18n"]): string {
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
 * Plan a clearing's Journal entry and Scene, linked to each other.
 *
 * Foundry answers a click on a Scene link by opening that Scene's journal, so
 * the entry's link to its own Scene names the Scene but doesn't open it.
 *
 * The Scene has no background image until the GM sets a map. It stays out of
 * the navigation bar so a batch doesn't crowd it.
 */
export function planClearing(
  clearing: Clearing,
  i18n: ReadyGame["i18n"],
): [JournalEntry.CreateData, Scene.CreateData] {
  const journalId = foundry.utils.randomID();
  const sceneId = foundry.utils.randomID();

  return [
    {
      _id: journalId,
      name: clearing.name,
      pages: [
        {
          name: clearing.name,
          type: "text",
          text: { content: renderJournal(clearing, sceneId, i18n) },
        },
      ],
    },
    { _id: sceneId, name: clearing.name, journal: journalId, navigation: false },
  ];
}

/**
 * Create each clearing's Journal entry and Scene in the world.
 *
 * Foundry creates one document type per call, so this splits the pairs by type.
 * Foundry replaces a document's `_id` on creation unless told to keep it, which
 * would leave every planned link dangling.
 */
export async function createClearings(
  clearings: readonly Clearing[],
  i18n: ReadyGame["i18n"],
): Promise<void> {
  const pairs = clearings.map((clearing) => planClearing(clearing, i18n));

  await foundry.documents.JournalEntry.createDocuments(
    pairs.map(([journal]) => journal),
    { keepId: true },
  );
  await foundry.documents.Scene.createDocuments(
    pairs.map(([, scene]) => scene),
    { keepId: true },
  );
}
