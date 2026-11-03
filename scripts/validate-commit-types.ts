// SPDX-FileCopyrightText: 2026 Alex Brandt
//
// SPDX-License-Identifier: MIT

// The commit-msg hook takes its types as static arguments and cannot read
// release-please-config.json, so its list is a copy. This check fails when the
// copy drifts from changelog-sections.

import { readFileSync } from "node:fs";
import { join } from "node:path";

const HOOK_ARGS_RE =
  /- id: conventional-pre-commit\n(?:[ \t]+[^\n]*\n)*?[ \t]+args:\s*\[([^\]]*)\]/;

interface ReleasePleaseConfig {
  "changelog-sections": { type: string }[];
}

function readRepoFile(path: string): string {
  return readFileSync(join(process.cwd(), path), "utf-8");
}

function declaredTypes(): string[] {
  const config = JSON.parse(
    readRepoFile("release-please-config.json"),
  ) as ReleasePleaseConfig;
  return config["changelog-sections"].map((section) => section.type);
}

function hookTypes(): string[] {
  const match = HOOK_ARGS_RE.exec(readRepoFile(".pre-commit-config.yaml"));
  if (!match) {
    console.error(
      "✗ .pre-commit-config.yaml: could not find a flow-sequence `args: [...]` on the conventional-pre-commit hook",
    );
    process.exit(1);
  }
  return match[1]
    .split(",")
    .map((arg) => arg.trim())
    .filter((arg) => arg !== "");
}

function missingFrom(types: string[], other: string[]): string[] {
  return types.filter((type) => !other.includes(type)).sort();
}

const declared = declaredTypes();
const accepted = hookTypes();
const errors: string[] = [];

const onlyDeclared = missingFrom(declared, accepted);
if (onlyDeclared.length > 0) {
  errors.push(
    `In release-please-config.json but not the commit-msg hook: ${onlyDeclared.join(", ")}`,
  );
}

const onlyAccepted = missingFrom(accepted, declared);
if (onlyAccepted.length > 0) {
  errors.push(
    `In the commit-msg hook but not release-please-config.json: ${onlyAccepted.join(", ")}`,
  );
}

if (errors.length > 0) {
  for (const err of errors) console.error(`✗ ${err}`);
  process.exit(1);
}

console.log(`✓ ${declared.length} commit type(s) agree`);
