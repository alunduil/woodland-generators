// SPDX-FileCopyrightText: 2025-2026 Alex Brandt
//
// SPDX-License-Identifier: MIT

import en from "../../languages/en.json";
import {
  CLEARING_FEATURES,
  CLEARING_NAMES,
  CONFLICT_SUBJECTS,
  DENIZEN_SPECIES,
  FACTIONS,
  LOCAL_CHALLENGERS,
  type Faction,
} from "../../src/generators/clearing-tables";
import {
  createClearings,
  generateClearing,
  generateClearings,
  planClearing,
  type Clearing,
} from "../../src/generators/clearing";
import { localizeWith, stubDocuments, stubRandomID } from "../foundry-globals";

/** Seeds to sweep when an invariant has to hold for every clearing. */
const SEEDS = Array.from({ length: 200 }, (_, index) => `clearing-${index}`);

function clearings(options: { factions?: Faction[] } = {}): Clearing[] {
  return SEEDS.map((seed) => generateClearing({ seed, ...options }));
}

afterEach(() => {
  jest.restoreAllMocks();
});

describe("generateClearing", () => {
  it.each(["woodland", "rooston", "", "🌲"])("repeats itself for seed %p", (seed) => {
    expect(generateClearing({ seed })).toEqual(generateClearing({ seed }));
  });

  it("draws a different clearing for a different seed", () => {
    expect(generateClearing({ seed: "woodland" })).not.toEqual(
      generateClearing({ seed: "rooston" }),
    );
  });

  it("draws every field from its own table", () => {
    for (const clearing of clearings()) {
      expect(CLEARING_NAMES).toContain(clearing.name);
      expect(FACTIONS).toContain(clearing.ruler);
      expect(CLEARING_FEATURES).toEqual(expect.arrayContaining(clearing.features));
      expect(DENIZEN_SPECIES).toEqual(expect.arrayContaining(clearing.inhabitants));
      expect(CONFLICT_SUBJECTS).toContain(clearing.conflict.over);
    }
  });

  it("gives a clearing at least one feature and one species", () => {
    for (const { features, inhabitants } of clearings()) {
      expect(features.length).toBeGreaterThan(0);
      expect(inhabitants.length).toBeGreaterThan(0);
    }
  });

  // A sweep that only ever drew one of each would pass the uniqueness check
  // without exercising it.
  it("varies how much a clearing has of each", () => {
    const drawn = clearings();

    expect(Math.max(...drawn.map(({ features }) => features.length))).toBeGreaterThan(1);
    expect(Math.max(...drawn.map(({ inhabitants }) => inhabitants.length))).toBeGreaterThan(1);
  });

  // Sampling without replacement is the RNG's contract; asking for a sample
  // at all is this generator's.
  it("never repeats a feature or a species within one clearing", () => {
    for (const { features, inhabitants } of clearings()) {
      expect(new Set(features).size).toBe(features.length);
      expect(new Set(inhabitants).size).toBe(inhabitants.length);
    }
  });

  it("never sets the ruling faction against itself", () => {
    for (const { ruler, conflict } of clearings()) {
      expect(conflict.challenger).not.toBe(ruler);
    }
  });

  describe("with the factions in play narrowed", () => {
    const factions: Faction[] = ["Marquisate", "Eyrie Dynasties"];

    it("rules the clearing with one of them", () => {
      for (const { ruler } of clearings({ factions })) {
        expect(factions).toContain(ruler);
      }
    });

    it("keeps a faction that is not in play out of the conflict", () => {
      const possible = [...factions, ...LOCAL_CHALLENGERS];

      for (const { conflict } of clearings({ factions })) {
        expect(possible).toContain(conflict.challenger);
      }
    });

    it("leaves a local challenger when only the ruler is in play", () => {
      for (const { conflict } of clearings({ factions: ["Marquisate"] })) {
        expect(LOCAL_CHALLENGERS).toContain(conflict.challenger);
      }
    });
  });

  describe("with a ruler chosen", () => {
    it("installs that faction", () => {
      expect(generateClearing({ seed: "woodland", ruler: "Lizard Cult" }).ruler).toBe(
        "Lizard Cult",
      );
    });

    it("rejects one that is not in play", () => {
      expect(() =>
        generateClearing({ seed: "woodland", factions: ["Marquisate"], ruler: "Lizard Cult" }),
      ).toThrow('Invalid ruler provided: "Lizard Cult". Available choices: Marquisate.');
    });
  });
});

describe("generateClearings", () => {
  it.each([1, 3])("draws %p clearings", (count) => {
    expect(generateClearings({ seed: "woodland", count })).toHaveLength(count);
  });

  it("draws clearing n on its own seed, so it redraws alone", () => {
    const batch = generateClearings({ seed: "woodland", count: 3, factions: ["Marquisate"] });

    expect(batch[2]).toEqual(generateClearing({ seed: "woodland-3", factions: ["Marquisate"] }));
  });
});

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

const [clearing] = generateClearings({ count: 1, seed: "woodland" }) as [Clearing];

function plan(): { journal: JournalData; scene: SceneData; content: string } {
  stubRandomID();

  const [journal, scene] = planClearing(clearing, i18n) as unknown as [JournalData, SceneData];

  return { journal, scene, content: journal.pages[0]?.text.content ?? "" };
}

describe("planClearing", () => {
  it("names the Journal entry and the Scene for the clearing", () => {
    const { journal, scene } = plan();

    expect([journal.name, scene.name]).toEqual([clearing.name, clearing.name]);
  });

  it("links the Scene to its Journal entry", () => {
    const { journal, scene } = plan();

    expect(scene.journal).toBe(journal._id);
  });

  it("links the Journal entry to its Scene", () => {
    const { scene, content } = plan();

    expect(content).toContain(`@UUID[Scene.${scene._id}]{${scene.name}}`);
  });

  it("writes every generated field into the Journal entry", () => {
    const { content } = plan();

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

  it("labels the Journal entry from the catalog", () => {
    expect(plan().content).not.toContain("WOODLAND-GENERATORS.");
  });

  it("ends the Journal entry with the unofficial notice", () => {
    expect(
      plan().content.endsWith(
        `<p><em>${en["WOODLAND-GENERATORS.Clearing.Journal.Notice"]}</em></p>`,
      ),
    ).toBe(true);
  });
});

describe("createClearings", () => {
  const batch = generateClearings({ count: 3, seed: "woodland" });

  it("keeps each Scene with its own Journal entry across the split by type", async () => {
    const created = stubDocuments();

    await createClearings(batch, i18n);

    const journals = created.JournalEntry.mock.calls[0]?.[0] as JournalData[];
    const scenes = created.Scene.mock.calls[0]?.[0] as SceneData[];

    expect(journals.map(({ name }) => name)).toEqual(batch.map(({ name }) => name));
    expect(scenes.map(({ journal }) => journal)).toEqual(journals.map(({ _id }) => _id));
  });

  it("keeps the IDs the links point at", async () => {
    const created = stubDocuments();

    await createClearings(batch, i18n);

    expect(created.JournalEntry).toHaveBeenCalledWith(expect.anything(), { keepId: true });
    expect(created.Scene).toHaveBeenCalledWith(expect.anything(), { keepId: true });
  });
});
