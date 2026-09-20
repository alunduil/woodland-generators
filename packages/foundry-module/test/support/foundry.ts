// SPDX-FileCopyrightText: 2025-2026 Alex Brandt
//
// SPDX-License-Identifier: MIT

/**
 * Stand-ins for the globals Foundry injects, shared by every suite in the
 * package. A test installs the members it needs and nothing else, so an absent
 * member is how the suite reaches the module's guards.
 */

/** The `game` members a test can install; anything omitted reads as absent. */
interface GameStub {
  i18n?: { localize: (key: string) => string };
  settings?: { registerMenu: jest.Mock };
}

export function stubGame(members: GameStub = {}): void {
  globalThis.game = members as unknown as typeof game;
}

/** A `game.i18n` resolving against `catalog`, echoing unknown keys back. */
export function localizeWith(catalog: Record<string, string>): NonNullable<GameStub["i18n"]> {
  return { localize: (key) => catalog[key] ?? key };
}

/** Captures the callbacks a module registers, keyed by hook name. */
export function stubHooks(): Map<string, () => void> {
  const registered = new Map<string, () => void>();

  globalThis.Hooks = {
    once: (hook: string, callback: () => void) => registered.set(hook, callback),
  } as unknown as typeof Hooks;

  return registered;
}

/**
 * An Application subclass resolves its base class off `foundry` while its own
 * class body evaluates, so this has to run before the import that loads it.
 */
export function stubApplicationV2(): void {
  globalThis.foundry = {
    applications: { api: { ApplicationV2: class {} } },
  } as unknown as typeof foundry;
}

/**
 * Import under a fresh module registry. Modules register their hooks at import
 * time, so a second import of a cached module registers nothing.
 */
export function loadIsolated<T>(load: () => T): T {
  let loaded!: T;

  jest.isolateModules(() => {
    loaded = load();
  });

  return loaded;
}
