// SPDX-FileCopyrightText: 2025-2026 Alex Brandt
//
// SPDX-License-Identifier: MIT

import en from "../../languages/en.json";
import GeneratorMenu from "../../src/applications/generator-menu";
import { localizeWith, stubGame } from "../foundry-globals";

const EMPTY_STATE = en["WOODLAND-GENERATORS.Menu.Empty"];

// `_renderHTML` and `_replaceHTML` are protected; Foundry calls them, and here
// the test does.
interface RenderPair {
  _renderHTML(): Promise<string>;
  _replaceHTML(result: string, content: HTMLElement): void;
}

function renderPair(): RenderPair {
  return new GeneratorMenu() as unknown as RenderPair;
}

/** The submenu descriptor `register` hands to Foundry. */
function registerSubmenu(): Record<string, unknown> {
  const registerMenu = jest.fn();

  GeneratorMenu.register(
    { settings: { registerMenu } } as unknown as InitGame,
    "woodland-generators",
  );

  return registerMenu.mock.calls[0]?.[2] as Record<string, unknown>;
}

describe("GeneratorMenu", () => {
  it("titles its window with a key the catalog defines", () => {
    expect(Object.keys(en)).toContain(GeneratorMenu.DEFAULT_OPTIONS.window.title);
  });

  it("leaves the GM gate to Foundry's restricted flag", () => {
    expect(registerSubmenu()).toMatchObject({ restricted: true });
  });

  it("opens itself as the submenu's Application", () => {
    expect(registerSubmenu()).toMatchObject({ type: GeneratorMenu });
  });

  it("labels the submenu with keys the catalog defines", () => {
    const { name, label, hint } = registerSubmenu() as Record<string, string>;

    expect(Object.keys(en)).toEqual(expect.arrayContaining([name, label, hint]));
  });

  // Whatever `_renderHTML` returns is what `_replaceHTML` consumes -- Foundry
  // passes it through untyped, so the two halves only agree by construction.
  it("renders the localized empty state into the window content", async () => {
    stubGame({ i18n: localizeWith(en) });

    const menu = renderPair();
    const content = { innerHTML: "" } as HTMLElement;

    menu._replaceHTML(await menu._renderHTML(), content);

    expect(content.innerHTML).toContain(EMPTY_STATE);
  });
});
