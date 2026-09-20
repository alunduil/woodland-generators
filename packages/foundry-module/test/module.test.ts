// SPDX-FileCopyrightText: 2025-2026 Alex Brandt
//
// SPDX-License-Identifier: MIT

import en from "../languages/en.json";
import manifest from "../module.json";
import {
  loadIsolated,
  localizeWith,
  stubApplicationV2,
  stubGame,
  stubHooks,
} from "./support/foundry";

const INITIALIZED_KEY = "WOODLAND-GENERATORS.Initialized";

// A renamed module ID or a dropped translation key fails the suite rather than
// a live world. Both Foundry how-to guides send a reader to this exact line.
const HEARTBEAT = `${manifest.id} | ${en[INITIALIZED_KEY]}`;

describe("module", () => {
  let hooks: Map<string, () => void>;
  let log: jest.SpyInstance<void, Parameters<typeof console.log>>;

  beforeEach(() => {
    hooks = stubHooks();
    stubApplicationV2();
    log = jest.spyOn(console, "log").mockImplementation(() => undefined);
    loadIsolated(() => require("../src/module"));
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("takes the heartbeat on i18nInit and the menu on init", () => {
    expect([...hooks.keys()]).toEqual(["i18nInit", "init"]);
  });

  it("logs the heartbeat line a verifier looks for in the console", () => {
    stubGame({ i18n: localizeWith(en) });

    hooks.get("i18nInit")?.();

    expect(log).toHaveBeenCalledWith(HEARTBEAT);
  });

  it("stays silent when localization is unavailable", () => {
    stubGame();

    hooks.get("i18nInit")?.();

    expect(log).not.toHaveBeenCalled();
  });

  // What the menu registers under that namespace belongs to the menu, and is
  // covered in applications/generator-menu.test.ts.
  it("hands the menu the module's own namespace", () => {
    const registerMenu = jest.fn();
    stubGame({ settings: { registerMenu } });

    hooks.get("init")?.();

    expect(registerMenu).toHaveBeenCalledWith(manifest.id, expect.any(String), expect.any(Object));
  });
});
