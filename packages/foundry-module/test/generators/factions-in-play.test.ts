// SPDX-FileCopyrightText: 2026 Alex Brandt
//
// SPDX-License-Identifier: MIT

import { FACTIONS } from "../../src/generators/clearing-tables";
import { factionsInPlay } from "../../src/generators/factions-in-play";

describe("factionsInPlay", () => {
  it("puts every faction in play by default", () => {
    expect(factionsInPlay()).toEqual(FACTIONS);
  });

  it("keeps the factions it is given", () => {
    expect(factionsInPlay(["Lizard Cult"])).toEqual(["Lizard Cult"]);
  });

  it("refuses an empty set", () => {
    expect(() => factionsInPlay([])).toThrow("No factions in play");
  });
});
