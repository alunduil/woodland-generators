// SPDX-FileCopyrightText: 2025-2026 Alex Brandt
//
// SPDX-License-Identifier: MIT

import en from "../../languages/en.json";
import ClearingDialog from "../../src/applications/clearing-dialog";
import type { Faction } from "../../src/generators/clearing-tables";
import { generateClearings, type Clearing } from "../../src/generators/clearing";
import { localizeWith, stubGame } from "../foundry-globals";

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

/** Stub the world with these factions in play, and capture what a submit logs. */
function stubWorld(factions: Faction[]): jest.SpyInstance {
  stubGame({ i18n: localizeWith(en), settings: { get: jest.fn().mockReturnValue(factions) } });

  return jest.spyOn(console, "log").mockImplementation(() => undefined);
}

function logged(log: jest.SpyInstance): Clearing[] {
  return log.mock.calls[0]?.[1] as Clearing[];
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
    const log = stubWorld(["Marquisate"]);

    await expect(submit({ count, seed: "woodland" })).rejects.toThrow(
      en["WOODLAND-GENERATORS.Clearing.CountTooLow"],
    );
    expect(log).not.toHaveBeenCalled();
  });

  it("draws the batch the seed names from the factions in play", async () => {
    const log = stubWorld(["Marquisate", "Lizard Cult"]);

    await submit({ count: 3, seed: "woodland" });

    expect(logged(log)).toEqual(
      generateClearings({ count: 3, seed: "woodland", factions: ["Marquisate", "Lizard Cult"] }),
    );
  });
});
