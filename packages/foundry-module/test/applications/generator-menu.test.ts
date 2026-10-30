// SPDX-FileCopyrightText: 2025-2026 Alex Brandt
//
// SPDX-License-Identifier: MIT

import en from "../../languages/en.json";
import ClearingDialog from "../../src/applications/clearing-dialog";
import GeneratorMenu from "../../src/applications/generator-menu";
import { localizeWith, stubGame } from "../foundry-globals";

// `_renderHTML` is protected; Foundry calls it, and here the test does.
async function renderedMarkup(): Promise<string> {
  return (new GeneratorMenu() as unknown as { _renderHTML(): Promise<string> })._renderHTML();
}

/** The submenu descriptor `register` hands to Foundry. */
function registerSubmenu(): Record<string, unknown> {
  const registerMenu = jest.fn();

  GeneratorMenu.register({ settings: { registerMenu } } as unknown as InitGame);

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

  it("lists the clearing generator under a localized label", async () => {
    stubGame({ i18n: localizeWith(en) });

    expect(await renderedMarkup()).toContain(en["WOODLAND-GENERATORS.Menu.Clearing"]);
  });

  it("opens the clearing dialog from its clearing action", () => {
    const render = jest.spyOn(ClearingDialog.prototype, "render");

    GeneratorMenu.DEFAULT_OPTIONS.actions.clearing();

    expect(render).toHaveBeenCalledWith({ force: true });
    expect(render.mock.contexts[0]).toBeInstanceOf(ClearingDialog);
  });

  // Foundry dispatches a click on `[data-action]` to the action of that name,
  // and ignores one with no action registered.
  it("wires every rendered button to an action it registers", async () => {
    stubGame({ i18n: localizeWith(en) });

    const html = await renderedMarkup();
    const rendered = [...html.matchAll(/data-action="([^"]+)"/g)].map(([, action]) => action);

    expect(rendered).not.toHaveLength(0);
    expect(Object.keys(GeneratorMenu.DEFAULT_OPTIONS.actions)).toEqual(
      expect.arrayContaining(rendered),
    );
  });
});
