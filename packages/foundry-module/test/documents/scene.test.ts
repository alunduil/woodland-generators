// SPDX-FileCopyrightText: 2025-2026 Alex Brandt
//
// SPDX-License-Identifier: MIT

import { clearingScene } from "../../src/documents/scene";
import { generateClearing } from "../../src/generators/clearing";

describe("clearingScene", () => {
  const clearing = generateClearing({ seed: "woodland" });
  const scene = clearingScene(clearing, { id: "scene", journalId: "journal" });

  it("names the Scene for the clearing", () => {
    expect(scene.name).toBe(clearing.name);
  });

  it("opens the clearing's Journal entry", () => {
    expect(scene.journal).toBe("journal");
  });
});
