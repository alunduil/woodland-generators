// SPDX-FileCopyrightText: 2025-2026 Alex Brandt
//
// SPDX-License-Identifier: MIT

import manifest from "../module.json";
import { checkManifest } from "../src/manifest";

// Jest ignores type errors; the typecheck hook enforces these cases.

// @ts-expect-error -- unknown top-level key
checkManifest({ ...manifest, esmodule: manifest.esmodules });

// @ts-expect-error -- `authors` must be an array
checkManifest({ ...manifest, authors: { name: "Alex Brandt" } });

// @ts-expect-error -- `esmodules` must be an array
checkManifest({ ...manifest, esmodules: "dist/module.js" });

const { license: _license, ...withoutLicense } = manifest;
// @ts-expect-error -- `license` is required
checkManifest(withoutLicense);

describe("module.json", () => {
  // lychee skips bare paths in JSON, and no per-package license file exists.
  it("declares its license as an https URL", () => {
    expect(new URL(manifest.license).protocol).toBe("https:");
  });
});
