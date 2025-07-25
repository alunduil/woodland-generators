import { readFileSync } from "fs";
import pdfParse, { Result as PDFResult } from "pdf-parse";
import { Playbook } from "../types";
import { PlaybookSource } from "./index";

/**
 * Configuration constants for PDF parsing
 */
const PDF_PARSE_CONFIG = {
  /** Minimum section length to consider as a valid playbook */
  minSectionLength: 100,
  /** Maximum distance between playbook indicators to avoid duplicates */
  splitPositionThreshold: 500,
} as const;

/**
 * PDF-specific implementation for parsing Root RPG playbook PDFs
 */
export class PDFPlaybookSource implements PlaybookSource {
  private path: string;
  private data: PDFResult | null = null;
  private playbooks: Playbook[] = [];

  constructor(path: string) {
    this.path = path;
  }

  /**
   * Load PDF data if not already cached
   */
  private async loadPDFData(): Promise<PDFResult> {
    if (this.data) {
      return this.data;
    }

    const buffer = readFileSync(this.path);
    this.data = await pdfParse(buffer);
    return this.data;
  }

  /**
   * Check if this source's file is valid and can be processed
   */
  async isValid(): Promise<boolean> {
    try {
      await this.loadPDFData();
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Load and parse the PDF content
   */
  async load(): Promise<void> {
    const data = await this.loadPDFData();

    console.log(`Processing playbook from: ${this.path}`);
    console.log(`PDF has ${data.numpages} page(s)`);
    console.log(`Extracted ${data.text.length} characters of text`);

    this.parsePlaybooks();
  }

  /**
   * Get a specific playbook by archetype name
   */
  async getPlaybook(archetype: string): Promise<Playbook | null> {
    return this.playbooks.find((p) => p.archetype === archetype) ?? null;
  }

  /**
   * Get a random playbook from available options using a seed
   */
  async getRandomPlaybook(seed: string): Promise<Playbook | null> {
    if (this.playbooks.length === 0) {
      return null;
    }

    // Simple seeded random: convert seed to number and use modulo
    const seedNum = seed.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const randomIndex = seedNum % this.playbooks.length;
    return this.playbooks[randomIndex] ?? null;
  }

  /**
   * Parse playbooks from the extracted text
   */
  private parsePlaybooks(): void {
    const text = this.data?.text ?? "";

    // Split text by pages or by clear playbook delimiters
    const sections = this.splitIntoPlaybookSections(text);

    for (const [sectionIndex, section] of sections.entries()) {
      const playbook = this.parsePlaybookSection(section, sectionIndex);
      if (playbook) {
        this.playbooks.push(playbook);
      }
    }

    console.log(`Found ${this.playbooks.length} playbook(s) in the PDF`);
  }

  /**
   * Split the extracted text into potential playbook sections
   */
  private splitIntoPlaybookSections(text: string): string[] {
    // Look for "Choose Your Nature" at the beginning of lines, which typically marks new playbooks
    const splitPositions: number[] = [0];

    // Find all occurrences of "Choose Your Nature" at line boundaries
    const lines = text.split("\n");
    let currentPos = 0;

    for (const line of lines) {
      const trimmedLine = line.trim();
      if (trimmedLine === "Choose Your Nature" || trimmedLine.startsWith("Choose Your Nature")) {
        // Only add if it's not too close to an existing split
        const threshold = PDF_PARSE_CONFIG.splitPositionThreshold;
        if (!splitPositions.some((existing) => Math.abs(existing - currentPos) < threshold)) {
          splitPositions.push(currentPos);
        }
      }
      currentPos += line.length + 1; // +1 for the newline character
    }

    splitPositions.sort((a, b) => a - b);

    const sections: string[] = [];
    const minLength = PDF_PARSE_CONFIG.minSectionLength;

    for (let i = 0; i < splitPositions.length; i++) {
      const start = splitPositions[i];
      const end = i + 1 < splitPositions.length ? splitPositions[i + 1] : text.length;
      if (start !== undefined && end !== undefined) {
        const section = text.substring(start, end).trim();
        if (section.length > minLength) {
          sections.push(section);
        }
      }
    }

    return sections;
  }

  /**
   * Parse a single playbook section
   */
  private parsePlaybookSection(text: string, sectionIndex: number): Playbook | null {
    // Try to extract playbook archetype from common patterns
    const archetypePatterns = [
      // Look for "The [Name]" pattern at the beginning of sections (preserve "The")
      /^[^\w]*(The\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/m,
      // Look for patterns near "Choose Your Nature" (preserve "The")
      /(The\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)[^\w]*Choose Your Nature/i,
      // Look for title-style headers (all caps or title case)
      /^[^\w]*([A-Z][A-Z\s]+[A-Z])\s*$/m,
      // Fallback: single word archetype names
      /^[^\w]*([A-Z][a-z]+)[^\w]*Choose Your Nature/i,
    ];

    let archetypeName = "Unknown";

    // Try each pattern to extract the archetype name
    for (const pattern of archetypePatterns) {
      const match = text.match(pattern);
      if (match?.[1]) {
        archetypeName = match[1].trim();
        // Clean up common artifacts
        archetypeName = archetypeName.replace(/\s+/g, " ").trim();
        if (archetypeName.length > 3 && archetypeName.length < 50) {
          break;
        }
      }
    }

    // If no archetype found but has playbook indicators, this might still be a valid playbook
    const hasPlaybookIndicators =
      text.includes("Choose Your Nature") ||
      text.includes("Starting Moves") ||
      (text.includes("Background") &&
        (text.includes("Where do you call home") || text.includes("Why are you a vagabond")));

    if (archetypeName === "Unknown" && !hasPlaybookIndicators) {
      return null;
    }

    return {
      archetype: archetypeName,
      background: this.parseBackground(text),
      nature: this.parseNature(text),
      moves: this.parseMoves(text),
      equipment: this.parseEquipment(text),
      feats: this.parseFeats(text),
      weaponSkills: this.parseWeaponSkills(text),
      species: this.parseSpecies(text),
      rawText: text,
      pageNumber: sectionIndex,
    };
  }

  /**
   * Parse background options from text
   */
  private parseBackground(text: string): { homeOptions: string[]; motivationOptions: string[] } {
    const homeOptions: string[] = [];
    const motivationOptions: string[] = [];

    // Look for home options
    const homeMatch = text.match(/Where do you call home\?(.*?)Why are you a vagabond\?/s);
    if (homeMatch?.[1]) {
      const homeText = homeMatch[1];
      const options = homeText
        .split("\n")
        .filter((line) => line.trim().length > 0 && !line.includes("____________"));
      homeOptions.push(...options.map((opt) => opt.trim()));
    }

    // Look for motivation options
    const motivationMatch = text.match(
      /Why are you a vagabond\?(.*?)(?:Starting Moves|Roguish Feats|Equipment|$)/s,
    );
    if (motivationMatch?.[1]) {
      const motivationText = motivationMatch[1];
      const options = motivationText
        .split("\n")
        .filter((line) => line.trim().length > 0 && !line.includes("____________"));
      motivationOptions.push(...options.map((opt) => opt.trim()));
    }

    return { homeOptions, motivationOptions };
  }

  /**
   * Parse nature stats from text
   */
  private parseNature(text: string): { stats: number[]; statNames: string[] } {
    const stats: number[] = [];
    const statNames = ["Charm", "Cunning", "Finesse", "Luck", "Might"];

    // Look for stat values (numbers like -3, -2, -1, +0, +1, +2, +3)
    const statPattern = /[-+]?\d+/g;
    const matches = text.match(statPattern);

    if (matches) {
      // Filter and convert to numbers, typically first 35 numbers are the stat array
      const numbers = matches.slice(0, 35).map((match) => parseInt(match.replace("+", ""), 10));
      stats.push(...numbers);
    }

    return { stats, statNames };
  }

  /**
   * Parse moves from text
   */
  private parseMoves(text: string): string[] {
    const moves: string[] = [];

    // Look for starting moves section
    const movesMatch = text.match(
      /Starting Moves(.*?)(?:Roguish Feats|Equipment|Weapon Skills|$)/s,
    );
    if (movesMatch?.[1]) {
      const movesText = movesMatch[1];
      // Split by bullet points or move names (typically in bold/caps)
      const moveLines = movesText.split("\n").filter((line) => line.trim().length > 10);
      moves.push(...moveLines.map((move) => move.trim()));
    }

    return moves;
  }

  /**
   * Parse equipment from text
   */
  private parseEquipment(text: string): { startingValue: number; items: string[] } {
    let startingValue = 0;
    const items: string[] = [];

    // Look for starting value
    const valueMatch = text.match(/starting value:\s*(\d+)/i);
    if (valueMatch?.[1]) {
      startingValue = parseInt(valueMatch[1], 10);
    }

    // Look for equipment section
    const equipmentMatch = text.match(/Equipment(.*?)$/s);
    if (equipmentMatch?.[1]) {
      const equipmentText = equipmentMatch[1];
      const itemLines = equipmentText
        .split("\n")
        .filter(
          (line) =>
            line.trim().length > 0 &&
            !line.includes("starting value") &&
            !line.includes("carrying") &&
            !line.includes("____"),
        );
      items.push(...itemLines.map((item) => item.trim()));
    }

    return { startingValue, items };
  }

  /**
   * Parse feats from text
   */
  private parseFeats(text: string): string[] {
    const feats: string[] = [];

    const featsMatch = text.match(/Roguish Feats(.*?)(?:Weapon Skills|Equipment|$)/s);
    if (featsMatch?.[1]) {
      const featsText = featsMatch[1];
      const featLines = featsText
        .split("\n")
        .filter((line) => line.trim().length > 0 && !line.includes("start with marked feats"));
      feats.push(...featLines.map((feat) => feat.trim()));
    }

    return feats;
  }

  /**
   * Parse weapon skills from text
   */
  private parseWeaponSkills(text: string): string[] {
    const skills: string[] = [];

    const skillsMatch = text.match(/Weapon Skills(.*?)(?:Equipment|$)/s);
    if (skillsMatch?.[1]) {
      const skillsText = skillsMatch[1];
      const skillLines = skillsText
        .split("\n")
        .filter(
          (line) => line.trim().length > 0 && !line.includes("choose one bolded weapon skill"),
        );
      skills.push(...skillLines.map((skill) => skill.trim()));
    }

    return skills;
  }

  /**
   * Parse species options from text
   */
  private parseSpecies(text: string): string[] {
    const species: string[] = [];

    // Look for the species line pattern: "Species •fox, mouse, rabbit, bird, [species], other:"
    const speciesMatch = text.match(/Species\s*•([^:]+):/i);

    if (speciesMatch?.[1]) {
      const speciesText = speciesMatch[1];

      // Split by comma and clean up each species
      const speciesList = speciesText.split(",").map((s) => s.trim().toLowerCase());

      for (const speciesItem of speciesList) {
        if (speciesItem) {
          // Handle compound species like "raccoon dog" and preserve "other"
          let cleanSpecies = speciesItem.replace(/[•_\s]+$/, "").trim();

          // Clean up "other:" to just "other"
          if (cleanSpecies.includes("other:")) {
            cleanSpecies = "other";
          }

          if (cleanSpecies && cleanSpecies.length > 0) {
            species.push(cleanSpecies);
          }
        }
      }
    }

    return species;
  }
}
