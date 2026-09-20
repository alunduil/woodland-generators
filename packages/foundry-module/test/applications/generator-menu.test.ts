// SPDX-FileCopyrightText: 2025-2026 Alex Brandt
//
// SPDX-License-Identifier: MIT

import en from "../../languages/en.json";

// `_renderHTML` and `_replaceHTML` are protected: Foundry calls them, and the
// test stands in for Foundry.
interface RenderSeam {
  _renderHTML(): Promise<string>;
  _replaceHTML(result: string, content: HTMLElement): void;
}

// ApplicationV2 is resolved off the `foundry` global when the class body is
// evaluated, so the stub has to be in place before the import.
function stubApplicationV2(): void {
  globalThis.foundry = {
    applications: { api: { ApplicationV2: class {} } },
  } as unknown as typeof foundry;
}

function stubLocalization(catalog: Record<string, string>): void {
  globalThis.game = {
    i18n: { localize: (key: string) => catalog[key] ?? key },
  } as unknown as typeof game;
}

function stubMissingLocalization(): void {
  globalThis.game = {} as unknown as typeof game;
}

function loadMenu(): { new (): RenderSeam; DEFAULT_OPTIONS: { window: { title: string } } } {
  let menu!: ReturnType<typeof loadMenu>;

  jest.isolateModules(() => {
    menu = require("../../src/applications/generator-menu").default;
  });

  return menu;
}

describe("GeneratorMenu", () => {
  let GeneratorMenu: ReturnType<typeof loadMenu>;

  beforeEach(() => {
    stubApplicationV2();
    GeneratorMenu = loadMenu();
  });

  it("titles its window with a key the catalog defines", () => {
    expect(Object.keys(en)).toContain(GeneratorMenu.DEFAULT_OPTIONS.window.title);
  });

  it("renders the localized empty-state message", async () => {
    stubLocalization(en);

    await expect(new GeneratorMenu()._renderHTML()).resolves.toContain(
      en["WOODLAND-GENERATORS.Menu.Empty"],
    );
  });

  it("renders without the catalog rather than echoing the key back", async () => {
    stubMissingLocalization();

    await expect(new GeneratorMenu()._renderHTML()).resolves.not.toContain("WOODLAND-GENERATORS");
  });

  it("puts the rendered markup inside the window content", async () => {
    stubLocalization(en);

    const menu = new GeneratorMenu();
    const content = { innerHTML: "" } as HTMLElement;

    menu._replaceHTML(await menu._renderHTML(), content);

    expect(content.innerHTML).toContain(en["WOODLAND-GENERATORS.Menu.Empty"]);
  });
});
