// SPDX-FileCopyrightText: 2025-2026 Alex Brandt
//
// SPDX-License-Identifier: MIT

import en from "../languages/en.json";
import manifest from "../module.json";

const INITIALIZED_KEY = "WOODLAND-GENERATORS.Initialized";

/**
 * Imports `src/module.ts` for its side effect and returns the hooks it
 * registered, keyed by hook name.
 *
 * Registration happens at import time, so the module registry is reset per
 * call: a second import of a cached module registers nothing.
 */
function registerHooks(): Map<string, () => void> {
  const registered = new Map<string, () => void>();

  globalThis.Hooks = {
    once: (hook: string, callback: () => void) => registered.set(hook, callback),
  } as unknown as typeof Hooks;

  jest.isolateModules(() => {
    require("../src/module");
  });

  return registered;
}

function stubLocalization(catalog: Record<string, string> | undefined): void {
  globalThis.game = {
    ...(catalog && { i18n: { localize: (key: string) => catalog[key] ?? key } }),
  } as unknown as typeof game;
}

describe("module", () => {
  it("registers on i18nInit rather than init", () => {
    // Under `init` the translation catalog has not loaded and localize echoes
    // the key back, so the hook name is the behaviour worth pinning.
    expect([...registerHooks().keys()]).toEqual(["i18nInit"]);
  });

  it("logs the heartbeat line a verifier looks for in the console", () => {
    const hook = registerHooks().get("i18nInit");
    stubLocalization(en);
    const log = jest.spyOn(console, "log").mockImplementation(() => undefined);

    hook?.();

    // Composed from module.json and the catalog so that renaming the module ID
    // or dropping the key fails here rather than in a live world. The two
    // Foundry how-to guides direct a human to this exact line.
    expect(log).toHaveBeenCalledWith(`${manifest.id} | ${en[INITIALIZED_KEY]}`);
  });

  it("stays silent when localization is unavailable", () => {
    const hook = registerHooks().get("i18nInit");
    stubLocalization(undefined);
    const log = jest.spyOn(console, "log").mockImplementation(() => undefined);

    hook?.();

    expect(log).not.toHaveBeenCalled();
  });
});
