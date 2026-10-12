// SPDX-FileCopyrightText: 2025-2026 Alex Brandt
//
// SPDX-License-Identifier: MIT

import MarkupApplication from "../../src/applications/markup-application";

const MARKUP = "<p>rendered</p>";

class Probe extends MarkupApplication {
  protected override async _renderHTML(): Promise<string> {
    return MARKUP;
  }
}

// `_renderHTML` and `_replaceHTML` are protected; Foundry calls them, and here
// the test does.
interface RenderPair {
  _renderHTML(): Promise<string>;
  _replaceHTML(result: string, content: HTMLElement): void;
}

describe("MarkupApplication", () => {
  // Foundry passes whatever `_renderHTML` returns to `_replaceHTML` untyped.
  it("writes the rendered markup into the window content", async () => {
    const probe = new Probe() as unknown as RenderPair;
    const content = { innerHTML: "" } as HTMLElement;

    probe._replaceHTML(await probe._renderHTML(), content);

    expect(content.innerHTML).toBe(MARKUP);
  });
});
