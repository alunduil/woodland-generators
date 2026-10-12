// SPDX-FileCopyrightText: 2025-2026 Alex Brandt
//
// SPDX-License-Identifier: MIT

import en from "../../languages/en.json";
import { FACTIONS } from "../../src/generators/clearing-tables";
import { readFactions, registerFactions } from "../../src/settings/factions";

/** Where the test stub's fields keep what they were built with. */
interface StubField {
  options: { choices?: unknown; validate?: (value: unknown) => boolean };
  element: StubField;
}

interface Registration {
  name: string;
  hint: string;
  scope: string;
  config: boolean;
  type: StubField;
  default: unknown;
}

/** The setting `registerFactions` hands to Foundry. */
function registration(): Registration {
  const register = jest.fn();

  registerFactions({ settings: { register } } as unknown as InitGame);

  return register.mock.calls[0]?.[2] as Registration;
}

describe("registerFactions", () => {
  it("puts every faction in play until a GM narrows them", () => {
    expect(registration().default).toEqual([...FACTIONS]);
  });

  it("offers every faction to choose from", () => {
    expect(registration().type.element.options.choices).toEqual(FACTIONS);
  });

  // Foundry lets only a GM change a world setting, and lists it only for one.
  it("keeps one answer per world, in Module Settings", () => {
    expect(registration()).toMatchObject({ scope: "world", config: true });
  });

  it("labels the setting with keys the catalog defines", () => {
    const { name, hint } = registration();

    expect(Object.keys(en)).toEqual(expect.arrayContaining([name, hint]));
  });

  it("refuses a Woodland with nobody in it", () => {
    expect(registration().type.options.validate?.([])).toBe(false);
  });

  it("accepts a single faction", () => {
    expect(registration().type.options.validate?.(new Set(["Marquisate"]))).toBe(true);
  });
});

describe("readFactions", () => {
  it.each([
    ["a set", new Set(["Marquisate", "Lizard Cult"])],
    ["an array", ["Marquisate", "Lizard Cult"]],
  ])("hands the generator an array when Foundry stores %s", (_, stored) => {
    const get = jest.fn().mockReturnValue(stored);

    expect(readFactions({ settings: { get } } as unknown as ReadyGame)).toEqual([
      "Marquisate",
      "Lizard Cult",
    ]);
  });
});
