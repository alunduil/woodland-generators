// Validates docs/adr/ against ADR-0000's conventions: filename pattern,
// sequential numbering, required Nygard sections, and allowed Status values.
// `Proposed` is rejected — the PR review is the deliberation.

import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const ADR_DIR = join(process.cwd(), "docs", "adr");
const FILENAME_RE = /^(\d{4})-[a-z0-9]+(?:-[a-z0-9]+)*\.md$/;
const STATUS_RE = /^(Accepted|Deprecated|Superseded by \d{4})$/;
const REQUIRED_SECTIONS = ["Status", "Context", "Decision", "Consequences"];

const errors: string[] = [];
const numbers: number[] = [];

const files = readdirSync(ADR_DIR)
  .filter((name) => name.endsWith(".md") && name !== "README.md")
  .sort();

for (const file of files) {
  const match = FILENAME_RE.exec(file);
  if (!match) {
    errors.push(`${file}: filename must match NNNN-kebab-case.md`);
    continue;
  }
  numbers.push(Number(match[1]));

  const content = readFileSync(join(ADR_DIR, file), "utf-8");

  for (const section of REQUIRED_SECTIONS) {
    const re = new RegExp(`^## ${section}\\s*$`, "m");
    if (!re.test(content)) {
      errors.push(`${file}: missing required '## ${section}' section`);
    }
  }

  const statusBlock = /^## Status\s*\n+([^\n]+)/m.exec(content);
  if (!statusBlock) {
    errors.push(`${file}: could not parse Status block`);
  } else {
    const status = statusBlock[1].trim();
    if (!STATUS_RE.test(status)) {
      errors.push(
        `${file}: Status '${status}' is not allowed (must be Accepted, Deprecated, or Superseded by NNNN)`,
      );
    }
  }
}

const sorted = [...numbers].sort((a, b) => a - b);
for (let i = 0; i < sorted.length; i++) {
  if (sorted[i] !== i) {
    errors.push(
      `ADR numbering must be sequential from 0000 with no gaps or duplicates; expected ${String(i).padStart(4, "0")} but found ${String(sorted[i]).padStart(4, "0")}`,
    );
    break;
  }
}

if (errors.length > 0) {
  for (const err of errors) console.error(`✗ ${err}`);
  process.exit(1);
}

console.log(`✓ ${files.length} ADR(s) validated`);
