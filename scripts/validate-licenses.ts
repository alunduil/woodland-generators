// SPDX-FileCopyrightText: 2025-2026 Alex Brandt
//
// SPDX-License-Identifier: MIT

/**
 * Foundry reads a module manifest's `license` as a path or URL, which puts it
 * outside every other gate here: `reuse lint` sees only per-file SPDX
 * information, and nothing publishes, so npm never inspects the manifests
 * either. Package `license` fields are left to `reuse lint` and review.
 *
 * Runs as both the pre-commit gate and its own test suite, like
 * scripts/validate-workspace.ts.
 */

import { after, describe, it } from "node:test";
import { strict as assert } from "node:assert";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { dirname, join } from "node:path";
import { tmpdir } from "node:os";

const LICENSE_URL_PREFIX = "https://";

interface Report {
  /** Manifest paths actually read, so a vacuous pass is visible. */
  readonly checked: string[];
  readonly errors: string[];
}

function packageNames(root: string): string[] {
  return readdirSync(join(root, "packages"), { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
}

/** Foundry's manifest takes a path or URL here, never an SPDX identifier. */
function resolvesForFoundry(moduleRoot: string, license: string): boolean {
  return license.startsWith(LICENSE_URL_PREFIX) || existsSync(join(moduleRoot, license));
}

function licenseErrors(moduleRoot: string, relativePath: string, declared: unknown): string[] {
  if (typeof declared !== "string" || declared.length === 0) {
    return [`${relativePath}: missing 'license'`];
  }
  if (!resolvesForFoundry(moduleRoot, declared)) {
    return [
      `${relativePath}: license '${declared}' is neither an https URL nor a path within the module root`,
    ];
  }
  return [];
}

export function validateModuleLicenses(root: string): Report {
  const checked: string[] = [];
  const errors: string[] = [];

  for (const name of packageNames(root)) {
    const relativePath = join("packages", name, "module.json");
    const absolute = join(root, relativePath);
    if (!existsSync(absolute)) continue;

    checked.push(relativePath);
    const manifest = JSON.parse(readFileSync(absolute, "utf-8")) as Record<string, unknown>;
    errors.push(...licenseErrors(join(root, "packages", name), relativePath, manifest.license));
  }

  return { checked, errors };
}

const fixtureRoots: string[] = [];

function fixture(files: Record<string, unknown>): string {
  const root = mkdtempSync(join(tmpdir(), "validate-licenses-"));
  fixtureRoots.push(root);
  for (const [relativePath, contents] of Object.entries(files)) {
    const absolute = join(root, relativePath);
    mkdirSync(dirname(absolute), { recursive: true });
    writeFileSync(absolute, typeof contents === "string" ? contents : JSON.stringify(contents));
  }
  return root;
}

after(() => {
  for (const root of fixtureRoots) rmSync(root, { recursive: true, force: true });
});

describe("this repository's module manifests", () => {
  it("declare a license Foundry can resolve", () => {
    assert.deepEqual(validateModuleLicenses(process.cwd()).errors, []);
  });

  it("are all covered, so a passing run is never vacuous", () => {
    const { checked } = validateModuleLicenses(process.cwd());

    // Not packageNames(): an expectation built from the function under test
    // would pass by construction exactly when discovery breaks.
    const packages = join(process.cwd(), "packages");
    const expected = readdirSync(packages, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => join("packages", entry.name, "module.json"))
      .filter((relativePath) => existsSync(join(process.cwd(), relativePath)))
      .sort();

    assert.ok(expected.length > 0, "no module.json found under packages/");
    assert.deepEqual(checked.sort(), expected);
  });
});

describe("a module.json license", () => {
  it("is reported missing when absent", () => {
    const root = fixture({ "packages/shell/module.json": { id: "shell" } });
    assert.deepEqual(validateModuleLicenses(root).errors, [
      "packages/shell/module.json: missing 'license'",
    ]);
  });

  it("is reported when the path resolves nowhere in the module root", () => {
    const root = fixture({ "packages/shell/module.json": { license: "LICENSE" } });
    assert.deepEqual(validateModuleLicenses(root).errors, [
      "packages/shell/module.json: license 'LICENSE' is neither an https URL nor a path within the module root",
    ]);
  });

  it("accepts a path that exists inside the module root", () => {
    const root = fixture({
      "packages/shell/module.json": { license: "LICENSE" },
      "packages/shell/LICENSE": "MIT license text",
    });
    assert.deepEqual(validateModuleLicenses(root).errors, []);
  });

  it("accepts an https URL", () => {
    const root = fixture({
      "packages/shell/module.json": { license: "https://example.invalid/LICENSE" },
    });
    assert.deepEqual(validateModuleLicenses(root).errors, []);
  });

  it("is not required of a package shipping no module.json", () => {
    const root = fixture({ "packages/core/package.json": { license: "MIT" } });
    const { checked, errors } = validateModuleLicenses(root);
    assert.deepEqual(errors, []);
    assert.deepEqual(checked, []);
  });
});
