import { readFileSync } from "fs";
import { Playbook } from "../types";
import { PlaybookSource } from "./types";

/**
 * JSON-based playbook source for structured playbook data
 */
export class JSONPlaybookSource extends PlaybookSource {
  private data: unknown | null = null;

  /**
   * Load JSON data if not already cached
   */
  private loadJSONData(): unknown {
    if (this.data) {
      return this.data;
    }

    const fileContent = readFileSync(this.path, "utf-8");
    this.data = JSON.parse(fileContent);
    return this.data;
  }

  /**
   * Check if this source's file is valid and can be processed
   */
  async isValid(): Promise<boolean> {
    try {
      // Try to read and parse the JSON to verify it's valid
      const jsonData = this.loadJSONData();

      // Basic validation - check if it has playbook structure
      if (Array.isArray(jsonData) || this.isValidPlaybook(jsonData)) {
        return true;
      }

      return false;
    } catch {
      return false;
    }
  }

  /**
   * Load and parse the JSON content
   */
  async load(): Promise<void> {
    const jsonData = this.loadJSONData();

    console.log(`Processing playbook from: ${this.path}`);
    if (typeof jsonData === "object" && jsonData !== null) {
      const dataSize = JSON.stringify(jsonData).length;
      console.log(`Loaded ${dataSize} characters of JSON data`);
    }

    this.parsePlaybooks(jsonData);
  }

  /**
   * Parse playbooks from the loaded JSON data
   */
  private parsePlaybooks(jsonData: unknown): void {
    if (Array.isArray(jsonData)) {
      // If the root is an array, treat it as an array of playbooks
      this.playbooks = jsonData.filter((item) => this.isValidPlaybook(item));
    } else if (typeof jsonData === "object" && jsonData !== null) {
      const obj = jsonData as Record<string, unknown>;

      if (Array.isArray(obj.playbooks)) {
        // Standard format with playbooks array
        this.playbooks = obj.playbooks.filter((item) => this.isValidPlaybook(item));
      } else if (this.isValidPlaybook(jsonData)) {
        // Single playbook object
        this.playbooks = [jsonData as Playbook];
      }
    }

    console.log(`Found ${this.playbooks.length} playbook(s) in the JSON`);
  }

  /**
   * Check if an object matches the Playbook interface
   */
  private isValidPlaybook(obj: unknown): obj is Playbook {
    if (!obj || typeof obj !== "object") return false;

    const playbook = obj as Record<string, unknown>;

    return (
      typeof playbook.archetype === "string" &&
      typeof playbook.background === "object" &&
      typeof playbook.nature === "object" &&
      Array.isArray(playbook.moves) &&
      typeof playbook.equipment === "object" &&
      Array.isArray(playbook.feats) &&
      Array.isArray(playbook.weaponSkills)
    );
  }
}
