// SPDX-FileCopyrightText: 2025-2026 Alex Brandt
//
// SPDX-License-Identifier: MIT

/**
 * Stand-ins for the per-test globals Foundry injects. `foundry` itself is
 * installed for every test file by `test/setup/foundry.ts`.
 *
 * A test installs the members it needs and no others; leaving one out is how a
 * test reaches the module's guards.
 */

interface GameStub {
  i18n?: { localize: (key: string) => string };
  settings?: { registerMenu: jest.Mock };
}

export function stubGame(members: GameStub = {}): void {
  globalThis.game = members as unknown as typeof game;
}

/** Foundry's own localize echoes back a key it can't resolve. */
export function localizeWith(catalog: Record<string, string>): NonNullable<GameStub["i18n"]> {
  return { localize: (key) => catalog[key] ?? key };
}

export function stubHooks(): Map<string, () => void> {
  const registered = new Map<string, () => void>();

  globalThis.Hooks = {
    once: (hook: string, callback: () => void) => registered.set(hook, callback),
  } as unknown as typeof Hooks;

  return registered;
}
