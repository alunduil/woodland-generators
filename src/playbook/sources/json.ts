import { readFileSync } from "fs";
import { Playbook } from "../types";
import { PlaybookSource } from "./types";
import { createTextPreview } from "./debug";

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
      this.logger.debug("Using cached JSON data");
      return this.data;
    }

    this.logger.debug({ msg: "Loading JSON from file", path: this.path });
    const fileContent = readFileSync(this.path, "utf-8");
    this.logger.debug({
      msg: "JSON file read",
      characterCount: fileContent.length,
    });

    this.data = JSON.parse(fileContent);

    this.logger.debug({
      msg: "JSON parsing completed",
      dataType: Array.isArray(this.data) ? "array" : typeof this.data,
      textPreview: createTextPreview(fileContent, 100),
    });

    return this.data;
  }

  /**
   * Check if this source's file is valid and can be processed
   */
  async isValid(): Promise<boolean> {
    try {
      // Try to read and parse the JSON to verify it's valid
      const jsonData = this.loadJSONData();

      let isValidData = false;
      let validationDetails = "";

      // Basic validation - check if it has playbook structure
      if (Array.isArray(jsonData)) {
        const validPlaybooks = jsonData.filter((item) => this.isValidPlaybook(item));
        isValidData = validPlaybooks.length > 0;
        validationDetails = `array with ${validPlaybooks.length}/${jsonData.length} valid playbooks`;
      } else if (this.isValidPlaybook(jsonData)) {
        isValidData = true;
        validationDetails = "single valid playbook object";
      } else if (typeof jsonData === "object" && jsonData !== null) {
        const obj = jsonData as Record<string, unknown>;
        if (Array.isArray(obj.playbooks)) {
          const validPlaybooks = obj.playbooks.filter((item) => this.isValidPlaybook(item));
          isValidData = validPlaybooks.length > 0;
          validationDetails = `object.playbooks array with ${validPlaybooks.length}/${obj.playbooks.length} valid playbooks`;
        } else {
          validationDetails = "object without playbooks array or valid playbook structure";
        }
      } else {
        validationDetails = `unsupported data type: ${typeof jsonData}`;
      }

      this.logger.debug(isValidData ? "JSON validation successful" : "JSON validation failed", {
        path: this.path,
        validationDetails,
        isValid: isValidData,
      });

      return isValidData;
    } catch (error) {
      this.logger.warn({
        msg: "JSON validation failed - parse error",
        path: this.path,
        error: error instanceof Error ? error.message : String(error),
      });
      return false;
    }
  }

  /**
   * Load and parse the JSON content
   */
  async load(): Promise<void> {
    const jsonData = this.loadJSONData();
    this.logger.debug("Starting JSON playbook parsing");
    this.parsePlaybooks(jsonData);
  }

  /**
   * Parse playbooks from the loaded JSON data
   */
  private parsePlaybooks(jsonData: unknown): void {
    this.logger.trace({
      msg: "Starting playbook extraction from JSON data",
      dataType: Array.isArray(jsonData) ? "array" : typeof jsonData,
    });

    let candidatePlaybooks: unknown[] = [];
    let parsingStrategy = "";

    if (Array.isArray(jsonData)) {
      // If the root is an array, treat it as an array of playbooks
      candidatePlaybooks = jsonData;
      parsingStrategy = "direct array of playbooks";

      this.logger.debug({
        msg: "Processing direct playbook array",
        totalItems: jsonData.length,
      });
    } else if (typeof jsonData === "object" && jsonData !== null) {
      const obj = jsonData as Record<string, unknown>;

      if (Array.isArray(obj.playbooks)) {
        // Standard format with playbooks array
        candidatePlaybooks = obj.playbooks;
        parsingStrategy = "playbooks property array";

        this.logger.debug({
          msg: "Processing playbooks property array",
          totalItems: obj.playbooks.length,
          otherProperties: Object.keys(obj).filter((k) => k !== "playbooks"),
        });
      } else if (this.isValidPlaybook(jsonData)) {
        // Single playbook object
        candidatePlaybooks = [jsonData];
        parsingStrategy = "single playbook object";

        this.logger.debug("Processing single playbook object");
      } else {
        this.logger.warn({
          msg: "Unrecognized JSON structure",
          objectKeys: Object.keys(obj),
          hasPlaybooksArray: Array.isArray(obj.playbooks),
          isValidPlaybook: this.isValidPlaybook(jsonData),
        });
      }
    } else {
      this.logger.warn({
        msg: "Unsupported JSON data type",
        dataType: typeof jsonData,
        isArray: Array.isArray(jsonData),
        isNull: jsonData === null,
      });
    }

    // Filter and validate playbooks
    const validPlaybooks: Playbook[] = [];
    const rejectedItems: Array<{ index: number; reason: string; preview?: string }> = [];

    for (const [index, item] of candidatePlaybooks.entries()) {
      if (this.isValidPlaybook(item)) {
        validPlaybooks.push(item as Playbook);

        this.logger.trace({
          msg: "Playbook accepted",
          playbookIndex: index,
          archetype: (item as Playbook).archetype,
          hasBackground: !!(item as Playbook).background,
          hasNature: !!(item as Playbook).nature,
          movesCount: Array.isArray((item as Playbook).moves) ? (item as Playbook).moves.length : 0,
          featsCount: Array.isArray((item as Playbook).feats) ? (item as Playbook).feats.length : 0,
        });
      } else {
        const preview =
          typeof item === "object" && item !== null
            ? createTextPreview(JSON.stringify(item, null, 2), 100)
            : String(item);

        rejectedItems.push({
          index,
          reason: this.getValidationFailureReason(item),
          preview,
        });

        this.logger.trace({
          msg: "Playbook rejected - validation failed",
          playbookIndex: index,
          reason: this.getValidationFailureReason(item),
          itemPreview: preview,
        });
      }
    }

    this.playbooks = validPlaybooks;

    // Log summary with essential statistics
    this.logger.info({
      msg: "JSON parsing completed",
      parsingStrategy,
      candidatesProcessed: candidatePlaybooks.length,
      playbooksAccepted: validPlaybooks.length,
      playbooksRejected: rejectedItems.length,
      acceptanceRate:
        candidatePlaybooks.length > 0
          ? Math.round((validPlaybooks.length / candidatePlaybooks.length) * 100)
          : 0,
    });

    if (rejectedItems.length > 0) {
      this.logger.debug({
        msg: "Rejection summary",
        rejectedCount: rejectedItems.length,
        rejectionReasons: rejectedItems.reduce(
          (acc, item) => {
            acc[item.reason] = (acc[item.reason] ?? 0) + 1;
            return acc;
          },
          {} as Record<string, number>,
        ),
      });
    }
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

  /**
   * Get detailed reason why an object failed playbook validation
   */
  private getValidationFailureReason(obj: unknown): string {
    if (!obj) return "null or undefined";
    if (typeof obj !== "object") return `wrong type: ${typeof obj}`;

    const playbook = obj as Record<string, unknown>;

    if (typeof playbook.archetype !== "string") {
      return `archetype: expected string, got ${typeof playbook.archetype}`;
    }
    if (typeof playbook.background !== "object") {
      return `background: expected object, got ${typeof playbook.background}`;
    }
    if (typeof playbook.nature !== "object") {
      return `nature: expected object, got ${typeof playbook.nature}`;
    }
    if (!Array.isArray(playbook.moves)) {
      return `moves: expected array, got ${typeof playbook.moves}`;
    }
    if (typeof playbook.equipment !== "object") {
      return `equipment: expected object, got ${typeof playbook.equipment}`;
    }
    if (!Array.isArray(playbook.feats)) {
      return `feats: expected array, got ${typeof playbook.feats}`;
    }
    if (!Array.isArray(playbook.weaponSkills)) {
      return `weaponSkills: expected array, got ${typeof playbook.weaponSkills}`;
    }
    if (!Array.isArray(playbook.species)) {
      return `species: expected array, got ${typeof playbook.species}`;
    }
    if (typeof playbook.details !== "object") {
      return `details: expected object, got ${typeof playbook.details}`;
    }

    return "unknown validation failure";
  }
}
