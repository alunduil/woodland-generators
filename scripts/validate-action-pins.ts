// SPDX-FileCopyrightText: 2026 Alex Brandt
//
// SPDX-License-Identifier: MIT

// Rejects a third-party composite action whose own action.yml, at any depth,
// references another action by tag or branch. GitHub's sha_pinning_required
// applies transitively and fails the run at action resolution, before any
// step executes; zizmor's unpinned-uses only sees refs written in this repo.
//
// zizmor already requires every top-level ref to be a full SHA, and the
// action.yml behind a SHA never changes, so a result only changes when a ref
// in .github/ does. Upstream files come from raw.githubusercontent.com, which
// needs no token. Without network access the check fails rather than passing
// unchecked; `SKIP=validate-action-pins` bypasses it locally and CI still runs it.

import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const SHA_RE = /^[0-9a-f]{40}$/;
const USES_RE = /^\s*(?:-\s+)?uses:\s*["']?([^\s"'#]+)/gm;
const COMPOSITE_RE = /^\s+using:\s*["']?composite["']?\s*(?:#.*)?$/m;

interface RemoteRef {
  owner: string;
  repo: string;
  path: string;
  ref: string;
}

function usesRefs(content: string): string[] {
  return [...content.matchAll(USES_RE)].map((match) => match[1] ?? "");
}

// Local (`./`) and `docker://` refs carry no nested action references.
function parseRemote(uses: string): RemoteRef | undefined {
  if (uses.startsWith("./") || uses.startsWith("docker://")) return undefined;
  const at = uses.lastIndexOf("@");
  if (at === -1) return undefined;
  const [owner = "", repo = "", ...path] = uses.slice(0, at).split("/");
  return { owner, repo, path: path.join("/"), ref: uses.slice(at + 1) };
}

async function fetchActionFile(action: RemoteRef): Promise<string> {
  const base = `https://raw.githubusercontent.com/${action.owner}/${action.repo}/${action.ref}`;
  const dir = action.path ? `${base}/${action.path}` : base;
  for (const name of ["action.yml", "action.yaml"]) {
    const response = await fetch(`${dir}/${name}`);
    if (response.ok) return response.text();
    if (response.status !== 404) {
      throw new Error(`${dir}/${name}: HTTP ${response.status}`);
    }
  }
  throw new Error(`${dir}: no action.yml or action.yaml`);
}

function localFiles(): string[] {
  const workflows = join(".github", "workflows");
  const actions = join(".github", "actions");
  return [
    ...readdirSync(workflows)
      .filter((name) => /\.ya?ml$/.test(name))
      .map((name) => join(workflows, name)),
    ...readdirSync(actions).flatMap((name) =>
      readdirSync(join(actions, name))
        .filter((file) => /^action\.ya?ml$/.test(file))
        .map((file) => join(actions, name, file)),
    ),
  ];
}

const errors: string[] = [];
const visited = new Set<string>();

async function descend(uses: string, chain: string[]): Promise<void> {
  const action = parseRemote(uses);
  if (!action || !SHA_RE.test(action.ref) || visited.has(uses)) return;
  visited.add(uses);

  let content: string;
  try {
    content = await fetchActionFile(action);
  } catch (error) {
    errors.push(`${[...chain, uses].join(" -> ")}: could not fetch: ${String(error)}`);
    return;
  }
  if (!COMPOSITE_RE.test(content)) return;

  for (const nested of usesRefs(content)) {
    const nestedAction = parseRemote(nested);
    if (!nestedAction) continue;
    if (!SHA_RE.test(nestedAction.ref)) {
      errors.push(
        `${[...chain, uses, nested].join(" -> ")}: not pinned to a full-length commit SHA`,
      );
      continue;
    }
    await descend(nested, [...chain, uses]);
  }
}

async function main(): Promise<void> {
  for (const file of localFiles()) {
    for (const uses of usesRefs(readFileSync(file, "utf-8"))) {
      await descend(uses, [file]);
    }
  }

  if (errors.length > 0) {
    console.error("Nested action pin validation failed:");
    for (const error of errors) console.error(`  - ${error}`);
    console.error(
      "Offline? `SKIP=validate-action-pins` bypasses this hook locally; CI still runs it.",
    );
    process.exit(1);
  }

  console.log(`Nested action pins OK (${visited.size} remote actions checked)`);
}

void main();
