import { Playbook } from "../playbook/types";
import { fromPath, fromPathWithArchetype } from "../playbook/sources";
import { GeneratorOptions } from "./index";
import { root } from "../logging";

/**
 * Options for playbook generation
 */
export interface PlaybookGeneratorOptions extends GeneratorOptions {
  /** Path to the playbook source file */
  path: string;
  /** Specific archetype to select (e.g., "The Ranger", "The Thief") */
  archetype?: string;
}

/**
 * Generate a playbook from a source file with selection options
 */
export async function generatePlaybook(options: PlaybookGeneratorOptions): Promise<Playbook> {
  const { path, seed, archetype } = options;

  const logger = root.child({
    generator: "playbook",
  });

  logger.info({
    msg: "Starting playbook generation",
    path,
    seed,
    archetype,
  });

  const playbook = archetype
    ? await fromPathWithArchetype(path, archetype)
    : await fromPath(path, seed);

  logger.info({
    msg: "Playbook generation completed",
    path,
    seed,
    archetype: playbook.archetype,
    pageNumber: playbook.pageNumber,
  });

  return playbook;
}
