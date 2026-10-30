// SPDX-FileCopyrightText: 2026 Alex Brandt
//
// SPDX-License-Identifier: MIT

import en from "../../languages/en.json";
import { createClearingDocuments } from "../../src/documents/clearing";
import { generateClearings, type Clearing } from "../../src/generators/clearing";
import { localizeWith, stubDocuments, type CreatedDocuments } from "../foundry-globals";

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

const clearings = generateClearings({ count: 3, seed: "woodland" });

async function create(batch: readonly Clearing[] = clearings): Promise<CreatedDocuments> {
  const created = stubDocuments();

  await createClearingDocuments(batch, localizeWith(en) as ReadyGame["i18n"]);

  return created;
}

function journals(created: CreatedDocuments): JournalData[] {
  return created.JournalEntry.mock.calls[0]?.[0] as JournalData[];
}

function scenes(created: CreatedDocuments): SceneData[] {
  return created.Scene.mock.calls[0]?.[0] as SceneData[];
}

function content(journal: JournalData | undefined): string {
  return journal?.pages[0]?.text.content ?? "";
}

afterEach(() => {
  jest.restoreAllMocks();
});

describe("createClearingDocuments", () => {
  it("creates a Journal entry and a Scene named for each clearing", async () => {
    const created = await create();
    const names = clearings.map(({ name }) => name);

    expect(journals(created).map(({ name }) => name)).toEqual(names);
    expect(scenes(created).map(({ name }) => name)).toEqual(names);
  });

  // Without `keepId`, Foundry discards the drawn IDs and every link dangles.
  it("keeps the IDs the links point at", async () => {
    const created = await create();

    expect(created.JournalEntry).toHaveBeenCalledWith(expect.anything(), { keepId: true });
    expect(created.Scene).toHaveBeenCalledWith(expect.anything(), { keepId: true });
  });

  it("links each Scene to its own Journal entry", async () => {
    const created = await create();

    expect(scenes(created).map(({ journal }) => journal)).toEqual(
      journals(created).map(({ _id }) => _id),
    );
  });

  it("links each Journal entry to its own Scene", async () => {
    const created = await create();

    journals(created).forEach((journal, index) => {
      const scene = scenes(created)[index];

      expect(content(journal)).toContain(`@UUID[Scene.${scene?._id}]{${scene?.name}}`);
    });
  });

  it("writes every generated field into the Journal entry", async () => {
    const [clearing] = clearings;
    const text = content(journals(await create(clearings.slice(0, 1)))[0]);

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

  it("labels the Journal entry from the catalog", async () => {
    expect(content(journals(await create())[0])).not.toContain("WOODLAND-GENERATORS.");
  });

  it("ends the Journal entry with the unofficial notice", async () => {
    const text = content(journals(await create())[0]);

    expect(
      text.endsWith(`<p><em>${en["WOODLAND-GENERATORS.Clearing.Journal.Notice"]}</em></p>`),
    ).toBe(true);
  });
});
