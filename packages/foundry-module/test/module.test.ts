// SPDX-FileCopyrightText: 2025-2026 Alex Brandt
//
// SPDX-License-Identifier: MIT

import en from "../languages/en.json";
import manifest from "../module.json";

const INITIALIZED_KEY = "WOODLAND-GENERATORS.Initialized";

// A renamed module ID or a dropped translation key fails the suite rather than
// a live world. Both Foundry how-to guides send a reader to this exact line.
const HEARTBEAT = `${manifest.id} | ${en[INITIALIZED_KEY]}`;

function stubHooks(): Map<string, () => void> {
  const registered = new Map<string, () => void>();

  globalThis.Hooks = {
    once: (hook: string, callback: () => void) => registered.set(hook, callback),
  } as unknown as typeof Hooks;

  return registered;
}

// `game.i18n` appears only once the translation catalog has loaded, which is
// what separates these two stubs.
function stubLocalization(catalog: Record<string, string>): void {
  globalThis.game = {
    i18n: { localize: (key: string) => catalog[key] ?? key },
  } as unknown as typeof game;
}

function stubMissingLocalization(): void {
  globalThis.game = {} as unknown as typeof game;
}

function stubSettings(): jest.Mock {
  const registerMenu = jest.fn();

  globalThis.game = { settings: { registerMenu } } as unknown as typeof game;

  return registerMenu;
}

// The menu's own behaviour is covered in applications/generator-menu.test.ts;
// here the class only has to survive being named as a submenu `type`.
function stubApplicationV2(): void {
  globalThis.foundry = {
    applications: { api: { ApplicationV2: class {} } },
  } as unknown as typeof foundry;
}

// Registration happens at import time, so the module registry resets per call:
// a second import of a cached module registers nothing.
function loadModule(): void {
  jest.isolateModules(() => {
    require("../src/module");
  });
}

describe("module", () => {
  let hooks: Map<string, () => void>;
  let log: jest.SpyInstance<void, Parameters<typeof console.log>>;

  beforeEach(() => {
    hooks = stubHooks();
    stubApplicationV2();
    log = jest.spyOn(console, "log").mockImplementation(() => undefined);
    loadModule();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("takes the heartbeat on i18nInit and the menu on init", () => {
    expect([...hooks.keys()]).toEqual(["i18nInit", "init"]);
  });

  it("logs the heartbeat line a verifier looks for in the console", () => {
    stubLocalization(en);

    hooks.get("i18nInit")?.();

    expect(log).toHaveBeenCalledWith(HEARTBEAT);
  });

  it("stays silent when localization is unavailable", () => {
    stubMissingLocalization();

    hooks.get("i18nInit")?.();

    expect(log).not.toHaveBeenCalled();
  });

  it("registers the menu under the module's own namespace", () => {
    const registerMenu = stubSettings();

    hooks.get("init")?.();

    expect(registerMenu).toHaveBeenCalledWith(manifest.id, expect.any(String), expect.any(Object));
  });

  it("leaves the GM gate to Foundry's restricted flag", () => {
    const registerMenu = stubSettings();

    hooks.get("init")?.();

    expect(registerMenu.mock.calls[0]?.[2]).toMatchObject({ restricted: true });
  });

  it("names strings the catalog defines", () => {
    const registerMenu = stubSettings();

    hooks.get("init")?.();

    const { name, label, hint } = registerMenu.mock.calls[0]?.[2] as Record<string, string>;

    expect(Object.keys(en)).toEqual(expect.arrayContaining([name, label, hint]));
  });
});
