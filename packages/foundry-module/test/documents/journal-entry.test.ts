// SPDX-FileCopyrightText: 2025-2026 Alex Brandt
//
// SPDX-License-Identifier: MIT

import en from "../../languages/en.json";
import { clearingJournalEntry } from "../../src/documents/journal-entry";
import { generateClearing } from "../../src/generators/clearing";
import { localizeWith } from "../foundry-globals";

interface JournalData {
  _id: string;
  name: string;
  pages: { name: string; text: { content: string } }[];
}

describe("clearingJournalEntry", () => {
  const clearing = generateClearing({ seed: "woodland" });
  const journal = clearingJournalEntry(
    clearing,
    { id: "journal", sceneId: "scene" },
    localizeWith(en) as ReadyGame["i18n"],
  ) as unknown as JournalData;
  const content = journal.pages[0]?.text.content ?? "";

  it("names the entry for the clearing", () => {
    expect(journal.name).toBe(clearing.name);
  });

  it("links to the clearing's Scene", () => {
    expect(content).toContain(`@UUID[Scene.scene]{${clearing.name}}`);
  });

  it("writes every generated field", () => {
    for (const field of [
      clearing.ruler,
      ...clearing.features,
      ...clearing.inhabitants,
      clearing.conflict.challenger,
      clearing.conflict.over,
    ]) {
      expect(content).toContain(field);
    }
  });

  it("labels the entry from the catalog", () => {
    expect(content).not.toContain("WOODLAND-GENERATORS.");
  });

  it("ends with the unofficial notice", () => {
    expect(
      content.endsWith(`<p><em>${en["WOODLAND-GENERATORS.Clearing.Journal.Notice"]}</em></p>`),
    ).toBe(true);
  });
});
