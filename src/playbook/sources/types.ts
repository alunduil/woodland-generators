/**
 * Base types and abstract classes for playbook data sources
 */

import { Playbook } from "../types";
import SeededRandomUtilities from "seeded-random-utilities";
import { root } from "../../logging";
import pino from "pino";

/**
 * Abstract base class that all playbook sources must extend
 *
 * Implementations must:
 * - Populate the `playbooks` array during the `load()` method
 * - Implement `load()` to parse their specific data format
 * - Implement `isValid()` to check if they can handle the given file
 *
 * The base class provides runtime validation to ensure `load()` was called
 * and successfully populated the playbooks array before accessing data.
 */
export abstract class PlaybookSource {
  /** Array of loaded playbooks - must be populated by load() implementation */
  protected playbooks: Playbook[] = [];
  /** Path to the source file */
  protected path: string;
  /** Logger with source-specific context */
  protected logger: pino.Logger;

  constructor(path: string, sourceType: string) {
    this.path = path;
    this.logger = root.child({ source: sourceType, path: this.path });
  }

  /** Get a specific playbook by archetype name */
  async getPlaybook(archetype: string): Promise<Playbook | null> {
    this.ensureLoaded();
    return this.playbooks.find((p) => p.archetype === archetype) ?? null;
  }

  /** Get a random playbook using a seed for reproducible selection */
  async getRandomPlaybook(seed: string): Promise<Playbook> {
    this.ensureLoaded();
    const rng = new SeededRandomUtilities(seed);
    return rng.selectRandomElement(this.playbooks);
  }

  /** Get all loaded playbooks - primarily for testing purposes */
  getPlaybooks(): Playbook[] {
    this.ensureLoaded();
    return [...this.playbooks]; // Return a copy to prevent external modification
  }

  /**
   * Ensure that playbooks have been loaded
   * @throws Error if playbooks array is empty, indicating load() wasn't called or failed
   */
  private ensureLoaded(): void {
    if (this.playbooks.length === 0) {
      throw new Error(
        `No playbooks loaded. Ensure load() was called and successfully populated the playbooks array for ${this.constructor.name}.`,
      );
    }
  }

  /** Load the source data - must populate the playbooks array */
  abstract load(): Promise<void>;

  /** Check if this source's file is valid and can be processed */
  abstract isValid(): Promise<boolean>;
}
