// SPDX-FileCopyrightText: 2025-2026 Alex Brandt
//
// SPDX-License-Identifier: MIT

// Validates that package manifests declare a license consistent with the rest
// of the repository. `reuse lint` covers per-file SPDX information but never
// reads the `license` field of a package.json, so a package can be REUSE-clean
// and still ship with no license metadata for npm or Foundry.
//
// Foundry's module manifest takes a path or URL rather than an SPDX
// identifier, so the two manifest kinds are checked against different rules.

import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const PACKAGES_DIR = join(ROOT, "packages");
const LICENSES_DIR = join(ROOT, "LICENSES");

const errors: string[] = [];

function readJson(path: string): Record<string, unknown> {
  return JSON.parse(readFileSync(path, "utf-8")) as Record<string, unknown>;
}

const rootLicense = readJson(join(ROOT, "package.json")).license;

if (typeof rootLicense !== "string" || rootLicense.length === 0) {
  errors.push("package.json: missing 'license'");
} else if (!existsSync(join(LICENSES_DIR, `${rootLicense}.txt`))) {
  errors.push(
    `package.json: license '${rootLicense}' has no LICENSES/${rootLicense}.txt for REUSE to resolve`,
  );
}

const packages = readdirSync(PACKAGES_DIR, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort();

for (const name of packages) {
  const packageJsonPath = join(PACKAGES_DIR, name, "package.json");
  if (!existsSync(packageJsonPath)) continue;

  const license = readJson(packageJsonPath).license;
  if (license !== rootLicense) {
    errors.push(
      `packages/${name}/package.json: license '${String(license)}' does not match the root '${String(rootLicense)}'`,
    );
  }

  // Foundry package manifest, when the package ships one.
  const moduleJsonPath = join(PACKAGES_DIR, name, "module.json");
  if (!existsSync(moduleJsonPath)) continue;

  const moduleLicense = readJson(moduleJsonPath).license;
  if (typeof moduleLicense !== "string" || moduleLicense.length === 0) {
    errors.push(`packages/${name}/module.json: missing 'license'`);
  } else if (
    !moduleLicense.startsWith("https://") &&
    !existsSync(join(PACKAGES_DIR, name, moduleLicense))
  ) {
    errors.push(
      `packages/${name}/module.json: license '${moduleLicense}' is neither an https URL nor a path within the module root`,
    );
  }
}

if (errors.length > 0) {
  for (const err of errors) console.error(`✗ ${err}`);
  process.exit(1);
}

console.log(`✓ ${packages.length + 1} manifest(s) validated`);
