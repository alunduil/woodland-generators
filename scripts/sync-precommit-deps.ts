#!/usr/bin/env node
/**
 * Sync pre-commit additional_dependencies with package.json versions
 * Usage: npx tsx scripts/sync-precommit-deps.ts
 */

import fs from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, "..");

const PACKAGE_JSON_PATH = join(projectRoot, "package.json");
const PRECOMMIT_CONFIG_PATH = join(projectRoot, ".pre-commit-config.yaml");

// Dependencies that should be synced between package.json and pre-commit
const SYNC_DEPENDENCIES = [
  "@eslint/js",
  "@typescript-eslint/eslint-plugin",
  "@typescript-eslint/parser",
  "eslint",
  "typescript",
] as const;

interface PackageJson {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
}

function readPackageJson(): PackageJson {
  const content = fs.readFileSync(PACKAGE_JSON_PATH, "utf8");
  return JSON.parse(content) as PackageJson;
}

function readPrecommitConfig(): string {
  return fs.readFileSync(PRECOMMIT_CONFIG_PATH, "utf8");
}

function writePrecommitConfig(content: string): void {
  fs.writeFileSync(PRECOMMIT_CONFIG_PATH, content);
}

function getVersionFromPackageJson(packageJson: PackageJson, depName: string): string | undefined {
  return packageJson.devDependencies?.[depName] ?? packageJson.dependencies?.[depName];
}

function syncDependencies(): void {
  const packageJson = readPackageJson();
  let precommitConfig = readPrecommitConfig();

  let hasChanges = false;

  for (const dep of SYNC_DEPENDENCIES) {
    const version = getVersionFromPackageJson(packageJson, dep);
    if (!version) {
      console.warn(`⚠️  Dependency "${dep}" not found in package.json`);
      continue;
    }

    // Pattern to match the dependency in pre-commit config
    const escapedDep = dep.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const pattern = new RegExp(`(- ")(@?${escapedDep})(@[^"]*)?(".*)`);
    const replacement = `$1$2@${version}$4`;

    const newConfig = precommitConfig.replace(pattern, replacement);

    if (newConfig !== precommitConfig) {
      console.log(`✅ Updated ${dep}: ${version}`);
      precommitConfig = newConfig;
      hasChanges = true;
    }
  }

  if (hasChanges) {
    writePrecommitConfig(precommitConfig);
    console.log("✨ Pre-commit dependencies synced with package.json");
  } else {
    console.log("✅ Pre-commit dependencies already in sync");
  }
}

// Run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  try {
    syncDependencies();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("❌ Error syncing dependencies:", message);
    process.exit(1);
  }
}

export { syncDependencies };
