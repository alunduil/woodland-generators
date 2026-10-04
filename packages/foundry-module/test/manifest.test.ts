// SPDX-FileCopyrightText: 2025-2026 Alex Brandt
//
// SPDX-License-Identifier: MIT

import manifest from "../module.json";
import type { ExactManifest } from "../src/manifest";

// Each malformed manifest is a named binding rather than a fresh literal, so
// `satisfies` sees it the way it sees the module.json import. The typecheck
// hook fails on any `@ts-expect-error` that stops matching an error.

const misspeltKey = { ...manifest, esmodule: manifest.esmodules };
// @ts-expect-error -- unknown top-level key
void (misspeltKey satisfies ExactManifest<typeof misspeltKey>);

const authorsAsObject = { ...manifest, authors: { name: "Alex Brandt" } };
// @ts-expect-error -- `authors` must be an array
void (authorsAsObject satisfies ExactManifest<typeof authorsAsObject>);

const esmodulesAsString = { ...manifest, esmodules: "dist/module.js" };
// @ts-expect-error -- `esmodules` must be an array
void (esmodulesAsString satisfies ExactManifest<typeof esmodulesAsString>);

const { license: _license, ...withoutLicense } = manifest;
// @ts-expect-error -- `license` is required
void (withoutLicense satisfies ExactManifest<typeof withoutLicense>);

describe("module.json", () => {
  // lychee extracts no bare path from JSON, so a relative license would go
  // unchecked; LICENSES/ ships no per-package copy for one to point at.
  it("declares its license as an https URL", () => {
    expect(new URL(manifest.license).protocol).toBe("https:");
  });
});
