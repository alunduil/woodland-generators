// SPDX-FileCopyrightText: 2025-2026 Alex Brandt
//
// SPDX-License-Identifier: MIT

import en from "../../languages/en.json";
import ClearingDialog from "../../src/applications/clearing-dialog";
import type { Faction } from "../../src/generators/clearing-tables";
import { generateClearings } from "../../src/generators/clearing";
import { localizeWith, stubDocuments, stubGame, type CreatedDocuments } from "../foundry-globals";

// `_renderHTML` is protected; Foundry calls it, and here the test does.
async function renderedMarkup(): Promise<string> {
  return (new ClearingDialog() as unknown as { _renderHTML(): Promise<string> })._renderHTML();
}

/** Submit the form as Foundry would, with the fields already parsed. */
async function submit(fields: { count: number | null; seed: string }): Promise<void> {
  const { handler } = ClearingDialog.DEFAULT_OPTIONS.form;
  const formData = { object: fields } as unknown as foundry.applications.ux.FormDataExtended;

  await handler(new Event("submit"), {} as HTMLFormElement, formData);
}

/** Stub the world with these factions in play, and capture what a submit creates. */
function stubWorld(factions: Faction[]): CreatedDocuments {
  stubGame({ i18n: localizeWith(en), settings: { get: jest.fn().mockReturnValue(factions) } });

  return stubDocuments();
}

interface JournalData {
  _id: string;
  name: string;
  pages: { text: { content: string } }[];
}

interface SceneData {
  _id: string;
  journal: string;
}

function createdJournals(created: CreatedDocuments): JournalData[] {
  return created.JournalEntry.mock.calls[0]?.[0] as JournalData[];
}

function createdScenes(created: CreatedDocuments): SceneData[] {
  return created.Scene.mock.calls[0]?.[0] as SceneData[];
}

afterEach(() => {
  jest.restoreAllMocks();
});

describe("ClearingDialog", () => {
  it("titles its window with a key the catalog defines", () => {
    expect(Object.keys(en)).toContain(ClearingDialog.DEFAULT_OPTIONS.window.title);
  });

  it("renders every label from the catalog", async () => {
    stubGame({ i18n: localizeWith(en) });

    expect(await renderedMarkup()).not.toContain("WOODLAND-GENERATORS.");
  });

  it.each([0, -1, 1.5, null])("refuses a count of %p", async (count) => {
    const created = stubWorld(["Marquisate"]);

    await expect(submit({ count, seed: "woodland" })).rejects.toThrow(
      en["WOODLAND-GENERATORS.Clearing.CountTooLow"],
    );
    expect(created.JournalEntry).not.toHaveBeenCalled();
    expect(created.Scene).not.toHaveBeenCalled();
  });

  it("creates the batch the seed names from the factions in play", async () => {
    const factions: Faction[] = ["Marquisate", "Lizard Cult"];
    const created = stubWorld(factions);

    await submit({ count: 3, seed: "woodland" });

    expect(createdJournals(created).map(({ name }) => name)).toEqual(
      generateClearings({ count: 3, seed: "woodland", factions }).map(({ name }) => name),
    );
  });

  it("keeps each Scene with its own Journal entry across the split by type", async () => {
    const created = stubWorld(["Marquisate"]);

    await submit({ count: 3, seed: "woodland" });

    const journals = createdJournals(created);
    const scenes = createdScenes(created);

    expect(scenes.map(({ journal }) => journal)).toEqual(journals.map(({ _id }) => _id));
    journals.forEach(({ pages }, index) => {
      expect(pages[0]?.text.content).toContain(`@UUID[Scene.${scenes[index]?._id}]`);
    });
  });

  it("keeps the IDs the links point at", async () => {
    const created = stubWorld(["Marquisate"]);

    await submit({ count: 1, seed: "woodland" });

    expect(created.JournalEntry).toHaveBeenCalledWith(expect.anything(), { keepId: true });
    expect(created.Scene).toHaveBeenCalledWith(expect.anything(), { keepId: true });
  });
});
