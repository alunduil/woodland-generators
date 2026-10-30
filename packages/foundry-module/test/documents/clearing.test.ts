// SPDX-FileCopyrightText: 2026 Alex Brandt
//
// SPDX-License-Identifier: MIT

import en from "../../languages/en.json";
import { createClearingDocuments, planClearingDocuments } from "../../src/documents/clearing";
import { generateClearings, type Clearing } from "../../src/generators/clearing";
import { localizeWith, stubDocuments, stubRandomID } from "../foundry-globals";

interface JournalData {
  _id: string;
  name: string;
  pages: { name: string; text: { content: string } }[];
}

interface SceneData {
  _id: string;
  name: string;
  journal: string;
}

const i18n = localizeWith(en) as ReadyGame["i18n"];

const clearings = generateClearings({ count: 3, seed: "woodland" });

function plan(batch: readonly Clearing[] = clearings): {
  journals: JournalData[];
  scenes: SceneData[];
} {
  stubRandomID();

  const { journals, scenes } = planClearingDocuments(batch, i18n);

  return { journals: journals as JournalData[], scenes: scenes as SceneData[] };
}

function content(journal: JournalData | undefined): string {
  return journal?.pages[0]?.text.content ?? "";
}

afterEach(() => {
  jest.restoreAllMocks();
});

describe("planClearingDocuments", () => {
  it("plans a Journal entry and a Scene named for each clearing", () => {
    const { journals, scenes } = plan();
    const names = clearings.map(({ name }) => name);

    expect(journals.map(({ name }) => name)).toEqual(names);
    expect(scenes.map(({ name }) => name)).toEqual(names);
  });

  it("links each Scene to its own Journal entry", () => {
    const { journals, scenes } = plan();

    expect(scenes.map(({ journal }) => journal)).toEqual(journals.map(({ _id }) => _id));
  });

  it("links each Journal entry to its own Scene", () => {
    const { journals, scenes } = plan();

    journals.forEach((journal, index) => {
      const scene = scenes[index];

      expect(content(journal)).toContain(`@UUID[Scene.${scene?._id}]{${scene?.name}}`);
    });
  });

  it("writes every generated field into the Journal entry", () => {
    const [clearing] = clearings;
    const text = content(plan(clearings.slice(0, 1)).journals[0]);

    for (const field of [
      clearing?.ruler,
      ...(clearing?.features ?? []),
      ...(clearing?.inhabitants ?? []),
      clearing?.conflict.challenger,
      clearing?.conflict.over,
    ]) {
      expect(text).toContain(field);
    }
  });

  it("labels the Journal entry from the catalog", () => {
    expect(content(plan().journals[0])).not.toContain("WOODLAND-GENERATORS.");
  });

  it("ends the Journal entry with the unofficial notice", () => {
    const text = content(plan().journals[0]);

    expect(
      text.endsWith(`<p><em>${en["WOODLAND-GENERATORS.Clearing.Journal.Notice"]}</em></p>`),
    ).toBe(true);
  });
});

describe("createClearingDocuments", () => {
  it("keeps the IDs the links point at", async () => {
    const created = stubDocuments();

    await createClearingDocuments(clearings, i18n);

    expect(created.JournalEntry).toHaveBeenCalledWith(expect.anything(), { keepId: true });
    expect(created.Scene).toHaveBeenCalledWith(expect.anything(), { keepId: true });
  });
});
