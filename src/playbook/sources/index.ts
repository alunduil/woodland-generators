/**
 * Types and interfaces for playbook data sources
 */

import { Playbook } from "../types";
import { PlaybookSource } from "./types";
import { PDFPlaybookSource } from "./pdf";
import { JSONPlaybookSource } from "./json";

/**
 * Helper function to find and use an appropriate source for a given path
 */
async function withValidSource(
  path: string,
  operation: (source: PlaybookSource) => Promise<Playbook>,
): Promise<Playbook> {
  // Try each source type to see which can handle this file
  const sources = [new PDFPlaybookSource(path, "pdf"), new JSONPlaybookSource(path, "json")];

  for (const source of sources) {
    let valid: boolean;
    try {
      valid = await source.isValid();
    } catch {
      // isValid is meant to signal compatibility via its return value;
      // defensively treat a thrown error as "not this source" so we still
      // try the next one.
      valid = false;
    }
    if (valid) {
      // Once a source has claimed compatibility, surface load/operation
      // failures so callers (CLI, tests) see the typed error — e.g.
      // PdfParseError with its stage tag — instead of a generic
      // "no source can handle file" fallback.
      await source.load();
      return await operation(source);
    }
  }

  throw new Error(`No source can handle file: ${path}`);
}

/**
 * Create a Playbook from any supported file type
 */
export async function fromPath(path: string, seed: string): Promise<Playbook> {
  return await withValidSource(path, async (source) => {
    return await source.getRandomPlaybook(seed);
  });
}

/**
 * Create a specific Playbook by archetype from any supported file type
 */
export async function fromPathWithArchetype(path: string, archetype: string): Promise<Playbook> {
  return await withValidSource(path, async (source) => {
    const playbook = await source.getPlaybook(archetype);
    if (!playbook) {
      throw new Error(`No playbook with archetype "${archetype}" found in file: ${path}`);
    }
    return playbook;
  });
}
