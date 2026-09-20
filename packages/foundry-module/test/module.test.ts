// SPDX-FileCopyrightText: 2025-2026 Alex Brandt
//
// SPDX-License-Identifier: MIT

import en from "../languages/en.json";
import manifest from "../module.json";
import { localizeWith, stubGame, stubHooks } from "./foundry-globals";

const INITIALIZED_KEY = "WOODLAND-GENERATORS.Initialized";

// A renamed module ID or a dropped translation key fails the suite rather than
// a live world. Both Foundry how-to guides send a reader to this exact line.
const HEARTBEAT = `${manifest.id} | ${en[INITIALIZED_KEY]}`;

describe("module", () => {
  let hooks: Map<string, () => void>;
  let log: jest.SpyInstance<void, Parameters<typeof console.log>>;

  beforeEach(() => {
    hooks = stubHooks();
    log = jest.spyOn(console, "log").mockImplementation(() => undefined);

    // The module registers its hooks at import time, so a cached import would
    // register nothing against the stub this test just installed.
    jest.isolateModules(() => {
      require("../src/module");
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("logs the heartbeat line a verifier looks for in the console", () => {
    stubGame({ i18n: localizeWith(en) });

    hooks.get("i18nInit")?.();

    expect(log).toHaveBeenCalledWith(HEARTBEAT);
  });

  it("hands the menu the module's own namespace", () => {
    const registerMenu = jest.fn();
    stubGame({ settings: { registerMenu } });

    hooks.get("init")?.();

    expect(registerMenu).toHaveBeenCalledWith(manifest.id, expect.any(String), expect.any(Object));
  });
});
