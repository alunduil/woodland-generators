// SPDX-FileCopyrightText: 2025-2026 Alex Brandt
//
// SPDX-License-Identifier: MIT

import en from "../languages/en.json";
import manifest from "../module.json";

const INITIALIZED_KEY = "WOODLAND-GENERATORS.Initialized";

// Composed rather than written out, so renaming the module ID or dropping the
// translation key fails the suite rather than a live world. The two Foundry
// how-to guides direct a human to this exact line.
const HEARTBEAT = `${manifest.id} | ${en[INITIALIZED_KEY]}`;

/** Stands in for Foundry's `Hooks`, recording what registers against it. */
function stubHooks(): Map<string, () => void> {
  const registered = new Map<string, () => void>();

  globalThis.Hooks = {
    once: (hook: string, callback: () => void) => registered.set(hook, callback),
  } as unknown as typeof Hooks;

  return registered;
}

/** Stands in for Foundry once the translation catalog has loaded. */
function stubLocalization(catalog: Record<string, string>): void {
  globalThis.game = {
    i18n: { localize: (key: string) => catalog[key] ?? key },
  } as unknown as typeof game;
}

/** Stands in for Foundry when the catalog is missing and `game.i18n` is unset. */
function stubMissingLocalization(): void {
  globalThis.game = {} as unknown as typeof game;
}

/**
 * Imports `src/module.ts` for its side effect.
 *
 * Registration happens at import time, so the module registry is reset per
 * call: a second import of a cached module registers nothing.
 */
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
    log = jest.spyOn(console, "log").mockImplementation(() => undefined);
    loadModule();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("registers on i18nInit rather than init", () => {
    // Under `init` the translation catalog has not loaded and localize echoes
    // the key back, so the hook name is the behaviour worth pinning.
    expect([...hooks.keys()]).toEqual(["i18nInit"]);
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
});
