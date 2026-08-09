// SPDX-FileCopyrightText: 2025-2026 Alex Brandt
//
// SPDX-License-Identifier: MIT

/**
 * Package manifest license validator.
 *
 * `reuse lint` covers per-file SPDX information but never reads the `license`
 * field of a package.json, so a package can be REUSE-clean while shipping no
 * license metadata for npm or Foundry. This checks the manifests instead:
 * every workspace package.json against the root license, the root license
 * against LICENSES/ so REUSE can resolve the identifier it names, and any
 * module.json against Foundry's rules, which take a path or URL rather than
 * an SPDX identifier.
 *
 * Runs both as the pre-commit gate over the working tree and as its own test
 * suite, the same way scripts/validate-workspace.ts does.
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

function readManifest(root: string, relativePath: string): Record<string, unknown> | null {
  const absolute = join(root, relativePath);
  if (!existsSync(absolute)) return null;
  return JSON.parse(readFileSync(absolute, "utf-8")) as Record<string, unknown>;
}

function packageNames(root: string): string[] {
  return readdirSync(join(root, "packages"), { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
}

function packageLicenseErrors(name: string, declared: unknown, expected: string): string[] {
  if (declared === expected) return [];
  if (declared === undefined) return [`packages/${name}/package.json: missing 'license'`];
  return [
    `packages/${name}/package.json: license '${String(declared)}' does not match the root '${expected}'`,
  ];
}

/**
 * Foundry resolves a module manifest's license as either a publicly reachable
 * URL or a path inside the module root. An SPDX identifier is not one of its
 * options, which is why this differs from the package.json rule.
 */
function resolvesForFoundry(moduleRoot: string, license: string): boolean {
  return license.startsWith(LICENSE_URL_PREFIX) || existsSync(join(moduleRoot, license));
}

function moduleLicenseErrors(moduleRoot: string, name: string, declared: unknown): string[] {
  if (typeof declared !== "string" || declared.length === 0) {
    return [`packages/${name}/module.json: missing 'license'`];
  }
  if (!resolvesForFoundry(moduleRoot, declared)) {
    return [
      `packages/${name}/module.json: license '${declared}' is neither an https URL nor a path within the module root`,
    ];
  }
  return [];
}

export function validateLicenses(root: string): Report {
  const rootManifest = readManifest(root, "package.json");
  if (rootManifest === null) {
    return { checked: [], errors: ["package.json: not found"] };
  }

  const checked = ["package.json"];
  const declared = rootManifest.license;

  // A root license nobody can resolve makes every per-package comparison
  // below meaningless, so report the cause once instead of echoing it as a
  // mismatch against 'undefined' for every package in the workspace.
  if (typeof declared !== "string" || declared.length === 0) {
    return { checked, errors: ["package.json: missing 'license'"] };
  }
  if (!existsSync(join(root, "LICENSES", `${declared}.txt`))) {
    return {
      checked,
      errors: [
        `package.json: license '${declared}' has no LICENSES/${declared}.txt for REUSE to resolve`,
      ],
    };
  }

  const errors: string[] = [];
  const names = packageNames(root);

  // One pass per manifest kind. Folded into a single loop, an early exit for
  // a package with no package.json would also skip its module.json, and the
  // next check added would inherit that truncation by position alone.
  for (const name of names) {
    const relativePath = join("packages", name, "package.json");
    const manifest = readManifest(root, relativePath);
    if (manifest === null) continue;
    checked.push(relativePath);
    errors.push(...packageLicenseErrors(name, manifest.license, declared));
  }

  for (const name of names) {
    const relativePath = join("packages", name, "module.json");
    const manifest = readManifest(root, relativePath);
    if (manifest === null) continue;
    checked.push(relativePath);
    errors.push(...moduleLicenseErrors(join(root, "packages", name), name, manifest.license));
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

const MIT_WORKSPACE = {
  "package.json": { license: "MIT" },
  "LICENSES/MIT.txt": "MIT license text",
  "packages/core/package.json": { license: "MIT" },
};

after(() => {
  for (const root of fixtureRoots) rmSync(root, { recursive: true, force: true });
});

describe("this repository's manifests", () => {
  it("declare a license consistent with the root and with LICENSES/", () => {
    assert.deepEqual(validateLicenses(process.cwd()).errors, []);
  });

  it("are all covered, so a passing run is never vacuous", () => {
    const { checked } = validateLicenses(process.cwd());

    // Deliberately not packageNames(): building the expectation from the
    // function under test makes this assertion pass by construction the
    // moment discovery breaks, which is the failure it exists to catch.
    const directories = readdirSync(join(process.cwd(), "packages"), { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name);

    assert.ok(directories.length > 0, "no package directories found under packages/");
    for (const name of directories) {
      assert.ok(
        checked.some((path) => path.startsWith(join("packages", name) + "/")),
        `no manifest checked for packages/${name}; checked ${checked.join(", ")}`,
      );
    }
  });
});

describe("root license", () => {
  it("is reported missing when absent", () => {
    const root = fixture({ ...MIT_WORKSPACE, "package.json": {} });
    assert.deepEqual(validateLicenses(root).errors, ["package.json: missing 'license'"]);
  });

  it("is reported when LICENSES/ has no text REUSE can resolve", () => {
    const root = fixture({ ...MIT_WORKSPACE, "package.json": { license: "Apache-2.0" } });
    assert.deepEqual(validateLicenses(root).errors, [
      "package.json: license 'Apache-2.0' has no LICENSES/Apache-2.0.txt for REUSE to resolve",
    ]);
  });

  it("suppresses per-package mismatches, which are echoes of it", () => {
    const root = fixture({
      ...MIT_WORKSPACE,
      "package.json": {},
      "packages/other/package.json": { license: "MIT" },
    });
    assert.deepEqual(validateLicenses(root).errors, ["package.json: missing 'license'"]);
  });
});

describe("package.json license", () => {
  it("is reported when it disagrees with the root", () => {
    const root = fixture({
      ...MIT_WORKSPACE,
      "packages/core/package.json": { license: "GPL-3.0" },
    });
    assert.deepEqual(validateLicenses(root).errors, [
      "packages/core/package.json: license 'GPL-3.0' does not match the root 'MIT'",
    ]);
  });

  it("is reported as missing rather than as a mismatch against undefined", () => {
    const root = fixture({ ...MIT_WORKSPACE, "packages/core/package.json": {} });
    assert.deepEqual(validateLicenses(root).errors, [
      "packages/core/package.json: missing 'license'",
    ]);
  });

  it("is not required of a directory that ships no manifest", () => {
    const root = fixture({ ...MIT_WORKSPACE, "packages/scratch/notes.md": "no manifest here" });
    assert.deepEqual(validateLicenses(root).errors, []);
  });
});

describe("module.json license", () => {
  it("is reported missing when absent", () => {
    const root = fixture({ ...MIT_WORKSPACE, "packages/core/module.json": { id: "core" } });
    assert.deepEqual(validateLicenses(root).errors, [
      "packages/core/module.json: missing 'license'",
    ]);
  });

  it("is reported when the path resolves nowhere in the module root", () => {
    const root = fixture({ ...MIT_WORKSPACE, "packages/core/module.json": { license: "LICENSE" } });
    assert.deepEqual(validateLicenses(root).errors, [
      "packages/core/module.json: license 'LICENSE' is neither an https URL nor a path within the module root",
    ]);
  });

  it("accepts a path that exists inside the module root", () => {
    const root = fixture({
      ...MIT_WORKSPACE,
      "packages/core/module.json": { license: "LICENSE" },
      "packages/core/LICENSE": "MIT license text",
    });
    assert.deepEqual(validateLicenses(root).errors, []);
  });

  it("accepts an https URL", () => {
    const root = fixture({
      ...MIT_WORKSPACE,
      "packages/core/module.json": { license: "https://example.invalid/LICENSE" },
    });
    assert.deepEqual(validateLicenses(root).errors, []);
  });

  it("is checked even when the package ships no package.json", () => {
    const root = fixture({
      ...MIT_WORKSPACE,
      "packages/shell/module.json": { license: "nowhere" },
    });
    assert.deepEqual(validateLicenses(root).errors, [
      "packages/shell/module.json: license 'nowhere' is neither an https URL nor a path within the module root",
    ]);
  });
});
