// SPDX-FileCopyrightText: 2025-2026 Alex Brandt
//
// SPDX-License-Identifier: MIT

// The 32-bit FNV-1a parameters, named as the specification names them so the
// reference test vectors can be read against this implementation.
const FNV_OFFSET_BASIS = 0x811c9dc5;
const FNV_PRIME = 0x01000193;

/**
 * Derive a 32-bit seed from a string via FNV-1a.
 *
 * pure-rand generators take a numeric seed, but every generator is seeded from
 * a user-facing string. The engine's state initialization does the mixing, so
 * this only has to be deterministic and low-collision.
 *
 * The digest is taken over UTF-16 code units, not the UTF-8 bytes canonical
 * FNV-1a specifies. The two agree on ASCII and diverge beyond it; changing to
 * bytes would silently repoint every non-ASCII seed at a different stream.
 */
export function hashSeed(seed: string): number {
  let h = FNV_OFFSET_BASIS;

  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, FNV_PRIME);
  }

  return h >>> 0;
}
