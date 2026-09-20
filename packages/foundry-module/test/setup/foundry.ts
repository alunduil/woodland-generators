// SPDX-FileCopyrightText: 2025-2026 Alex Brandt
//
// SPDX-License-Identifier: MIT

/**
 * Installs the globals Foundry injects before a test file evaluates, the way
 * Foundry has them in place before it loads a module.
 *
 * `foundry` belongs here rather than in a test body: an Application subclass
 * resolves its base class while its own class body evaluates, so a test that
 * installed it by hand had to do so before the import that loads it.
 *
 * `game` and `Hooks` vary per test and stay with the test that needs them.
 */

globalThis.foundry = {
  applications: { api: { ApplicationV2: class {} } },
} as unknown as typeof foundry;
