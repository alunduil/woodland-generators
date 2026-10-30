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
  settings?: { registerMenu?: jest.Mock; register?: jest.Mock; get?: jest.Mock };
}

export function stubGame(members: GameStub = {}): void {
  Object.assign(globalThis, { game: members });
}

/** Foundry's own localize echoes back a key it can't resolve. */
export function localizeWith(catalog: Record<string, string>): NonNullable<GameStub["i18n"]> {
  return { localize: (key) => catalog[key] ?? key };
}

export function stubHooks(): Map<string, () => void> {
  const registered = new Map<string, () => void>();

  Object.assign(globalThis, {
    Hooks: { once: (hook: string, callback: () => void) => registered.set(hook, callback) },
  });

  return registered;
}

/** The `createDocuments` mock standing in for each document class. */
export interface CreatedDocuments {
  JournalEntry: jest.Mock;
  Scene: jest.Mock;
}

/** Draw distinct IDs, so a test can tell which document a link points at. */
export function stubRandomID(): void {
  let drawn = 0;
  jest.spyOn(foundry.utils, "randomID").mockImplementation(() => `id${++drawn}`);
}

/** Stub the world document classes a generator creates. */
export function stubDocuments(): CreatedDocuments {
  stubRandomID();

  const created = {
    JournalEntry: jest.fn().mockResolvedValue([]),
    Scene: jest.fn().mockResolvedValue([]),
  };

  Object.assign(foundry, {
    documents: {
      JournalEntry: { createDocuments: created.JournalEntry },
      Scene: { createDocuments: created.Scene },
    },
  });

  return created;
}
