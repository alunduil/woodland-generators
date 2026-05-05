import { readFileSync } from "fs";
import { extractText, getDocumentProxy } from "unpdf";
import { Playbook } from "../types";
import { PlaybookSource } from "./types";
import {
  createTextPreview,
  createPositionHighlight,
  normalizeForMatching,
  normalizeWhitespace,
} from "./debug";
import { asPdfParseError, PdfParseError } from "./errors";
import { summary } from "../../maths";

interface PDFResult {
  pages: string[];
  numpages: number;
}

interface AnchorSpan {
  bodyStart: number;
  bodyEnd: number;
}

/**
 * Known section headings within a single playbook, keyed by a stable internal
 * name. Each regex matches the heading itself; the body span runs from the
 * end of the heading match to the start of the next anchor in document order.
 *
 * Headings sit on their own line (or trailing-only content on the line) in
 * extracted PDF text, so anchors require either a line boundary or a `?`
 * terminator. `g` flag is set on every entry so the anchor scanner can pick
 * up multiple occurrences for first-wins resolution.
 */
const SECTION_ANCHORS: ReadonlyArray<{ name: string; regex: RegExp }> = [
  { name: "ChooseYourNature", regex: /^[ \t]*Choose Your Nature[ \t]*$/gm },
  { name: "Background", regex: /^[ \t]*Background[ \t]*$/gm },
  { name: "WhereDoYouCallHome", regex: /Where do you call home\?/g },
  { name: "WhyAreYouAVagabond", regex: /Why are you a vagabond\?/g },
  // Real playbooks use "Roguish Moves"; the original audit comment on #199
  // confirms "Starting Moves" never appears. Both are matched here so
  // synthetic fixtures and real content both anchor.
  { name: "Moves", regex: /^[ \t]*(?:Starting Moves|Roguish Moves)[ \t]*$/gm },
  { name: "Feats", regex: /^[ \t]*Roguish Feats[ \t]*$/gm },
  { name: "WeaponSkills", regex: /^[ \t]*Weapon Skills[ \t]*$/gm },
  { name: "Equipment", regex: /^[ \t]*Equipment[ \t]*$/gm },
  { name: "Details", regex: /^[ \t]*Details[ \t]*$/gm },
  { name: "Demeanor", regex: /^[ \t]*Demeanor[ \t]*$/gm },
];

/**
 * Configuration constants for PDF parsing
 */
const PDF_PARSE_CONFIG = {
  /** Minimum section length to consider as a valid playbook */
  minSectionLength: 100,
} as const;

/**
 * PDF-specific implementation for parsing Root RPG playbook PDFs
 */
export class PDFPlaybookSource extends PlaybookSource {
  private data: PDFResult | null = null;

  /**
   * Load PDF data if not already cached
   */
  private async loadPDFData(): Promise<PDFResult> {
    if (this.data) {
      this.logger.debug("Using cached PDF data");
      return this.data;
    }

    this.logger.debug({ msg: "Loading PDF from file", path: this.path });
    let buffer: Buffer;
    try {
      buffer = readFileSync(this.path);
    } catch (error) {
      throw asPdfParseError("read", this.path, error);
    }
    this.logger.debug({ msg: "PDF file read", size: buffer.length });

    try {
      const pdf = await getDocumentProxy(new Uint8Array(buffer));
      const { text: pages, totalPages } = await extractText(pdf, { mergePages: false });
      this.data = { pages, numpages: totalPages };
    } catch (error) {
      throw asPdfParseError("parse", this.path, error);
    }
    this.logger.debug({
      msg: "PDF extraction completed",
      pageCount: this.data.numpages,
      characterCount: this.data.pages.reduce((sum, p) => sum + p.length, 0),
    });
    return this.data;
  }

  /**
   * Check if this source's file is a PDF.
   *
   * Reports compatibility based on the `%PDF-` magic bytes only — the heavy
   * parse work happens in `load()` so its failures can surface as typed
   * `PdfParseError`s with their stage tags rather than collapsing into a
   * single boolean signal.
   */
  async isValid(): Promise<boolean> {
    let buffer: Buffer;
    try {
      buffer = readFileSync(this.path);
    } catch (error) {
      this.logger.debug({
        msg: "PDF validation skipped - file unreadable",
        path: this.path,
        error: error instanceof Error ? error.message : String(error),
      });
      return false;
    }

    const looksLikePdf = buffer.subarray(0, 5).toString("latin1") === "%PDF-";
    if (!looksLikePdf) {
      this.logger.debug({ msg: "PDF validation: no %PDF- header", path: this.path });
      return false;
    }

    this.logger.debug({ msg: "PDF validation: %PDF- header present", path: this.path });
    return true;
  }

  /**
   * Load and parse the PDF content
   */
  async load(): Promise<void> {
    await this.loadPDFData();
    this.parsePlaybooks();
  }

  /**
   * Parse playbooks from the extracted text
   */
  private parsePlaybooks(): void {
    const pages = this.data?.pages ?? [];

    // Clear any existing playbooks to ensure idempotent behavior
    this.playbooks = [];

    let sections: string[];
    try {
      sections = this.splitIntoPlaybookSections(pages);
    } catch (error) {
      throw asPdfParseError("split", this.path, error);
    }

    if (sections.length === 0) {
      throw new PdfParseError(
        "split",
        this.path,
        "no playbook sections were found in the extracted PDF text",
      );
    }

    for (const [sectionIndex, section] of sections.entries()) {
      let playbook: Playbook | null;
      try {
        playbook = this.parsePlaybookSection(section, sectionIndex);
      } catch (error) {
        throw asPdfParseError("section-parse", this.path, error, `section ${sectionIndex}`);
      }
      if (playbook) {
        this.playbooks.push(playbook);
      }
    }

    if (this.playbooks.length === 0) {
      throw new PdfParseError(
        "section-parse",
        this.path,
        `no valid playbooks parsed from ${sections.length} candidate section(s)`,
      );
    }

    this.logger.info({
      msg: "Playbook parsing completed",
      playbooksFound: this.playbooks.length,
      sectionsProcessed: sections.length,
    });
  }

  /**
   * Split per-page extracted text into potential playbook sections.
   *
   * A page that contains "Choose Your Nature" at a line boundary marks the
   * start of a new section. Page 0 is always a candidate start so any
   * pre-CYN content is preserved as its own section. Page boundaries supply
   * the dedupe that the old splitPositionThreshold provided: multiple CYN
   * matches on the same page collapse to a single split.
   */
  private splitIntoPlaybookSections(pages: string[]): string[] {
    this.logger.debug({
      msg: "Splitting pages into playbook sections",
      pageCount: pages.length,
    });

    const splitPages: number[] = [0];

    for (let i = 0; i < pages.length; i++) {
      const page = normalizeForMatching(pages[i] ?? "");
      const startsPlaybook = page
        .split("\n")
        .some((line) => line.trim().startsWith("Choose Your Nature"));
      if (!startsPlaybook) continue;
      if (splitPages.includes(i)) continue;
      splitPages.push(i);

      const pageJoined = pages.slice(0, i).reduce((sum, p) => sum + p.length + 1, 0);
      const highlight = createPositionHighlight(pages.join("\n"), pageJoined, "Choose Your Nature");
      this.logger.trace({
        msg: "Found playbook delimiter on page",
        pageIndex: i,
        context: highlight,
      });
    }

    splitPages.sort((a, b) => a - b);
    this.logger.debug({
      msg: "Delimiter scanning completed - ready to extract sections",
      delimitersFound: splitPages.length,
      splitPages,
      hint: "Use trace level to see delimiter contexts",
    });

    const sections: string[] = [];
    const minLength = PDF_PARSE_CONFIG.minSectionLength;

    for (let i = 0; i < splitPages.length; i++) {
      const startPage = splitPages[i]!;
      const endPage = i + 1 < splitPages.length ? splitPages[i + 1]! : pages.length;
      const section = normalizeForMatching(pages.slice(startPage, endPage).join("\n")).trim();
      if (section.length > minLength) {
        sections.push(section);
        this.logger.trace({
          msg: "Playbook section extracted - meets minimum length",
          sectionIndex: i,
          startPage,
          endPage,
          characterCount: section.length,
          requirement: `${section.length} >= ${minLength}`,
          textPreview: createTextPreview(section),
        });
      } else {
        this.logger.trace({
          msg: "Section rejected - too short",
          sectionIndex: i,
          startPage,
          endPage,
          characterCount: section.length,
          requirement: `${section.length} < ${minLength}`,
        });
      }
    }

    this.logger.debug({
      msg: "Section extraction completed",
      sectionsCreated: sections.length,
      lengthStats: summary(sections.map((s) => s.length)),
    });

    return sections;
  }

  /**
   * Parse a single playbook section
   */
  private parsePlaybookSection(text: string, sectionIndex: number): Playbook | null {
    this.logger.trace({
      msg: "Parsing playbook section",
      sectionIndex,
      characterCount: text.length,
      textPreview: createTextPreview(text, 100),
    });

    let archetypeName: string;
    try {
      archetypeName = this.extractArchetype(text, sectionIndex);
    } catch (error) {
      throw asPdfParseError("archetype-extract", this.path, error, `section ${sectionIndex}`);
    }

    const anchors = this.findSectionAnchors(text);

    // If no archetype found but has playbook indicators, this might still be a valid playbook
    const hasPlaybookIndicators =
      anchors.has("ChooseYourNature") ||
      anchors.has("Moves") ||
      (anchors.has("Background") &&
        (anchors.has("WhereDoYouCallHome") || anchors.has("WhyAreYouAVagabond")));

    if (archetypeName === "Unknown" && !hasPlaybookIndicators) {
      this.logger.debug({
        msg: "Section rejected - no archetype or playbook indicators",
        sectionIndex,
        characterCount: text.length,
        textPreview: createTextPreview(text),
      });
      return null;
    }

    if (archetypeName === "Unknown") {
      this.logger.warn({
        msg: "Playbook found but archetype extraction failed",
        sectionIndex,
        hasIndicators: hasPlaybookIndicators,
        textPreview: createTextPreview(text, 200),
      });
    }

    this.logger.debug({
      msg: "Playbook section parsed successfully",
      sectionIndex,
      archetype: archetypeName,
    });

    return {
      archetype: archetypeName,
      background: this.parseBackground(text, anchors),
      nature: this.parseNature(text, anchors),
      moves: this.parseMoves(text, anchors),
      equipment: this.parseEquipment(text, anchors),
      feats: this.parseFeats(text, anchors),
      weaponSkills: this.parseWeaponSkills(text, anchors),
      species: this.parseSpecies(text),
      details: this.parseDetails(text, anchors),
      demeanor: this.parseDemeanor(text, anchors),
      rawText: text,
      pageNumber: sectionIndex,
    };
  }

  /**
   * Locate known section anchors in document order and record each one's
   * body span — start of body to start of the next anchor (or end of text).
   *
   * Field parsers consume slices from this map instead of rerunning brittle
   * `Anchor(.*?)NextAnchor|NextAnchor2|$` regexes. Reordered or renamed
   * upstream sections affect anchor detection here, in one place, rather
   * than silently emptying every dependent parser.
   */
  private findSectionAnchors(text: string): Map<string, AnchorSpan> {
    type Hit = { name: string; matchStart: number; bodyStart: number };
    const hits: Hit[] = [];
    for (const { name, regex } of SECTION_ANCHORS) {
      regex.lastIndex = 0;
      let match: RegExpExecArray | null;
      while ((match = regex.exec(text)) !== null) {
        hits.push({
          name,
          matchStart: match.index,
          bodyStart: match.index + match[0].length,
        });
        if (!regex.global) break;
      }
    }
    hits.sort((a, b) => a.matchStart - b.matchStart);

    const anchors = new Map<string, AnchorSpan>();
    for (let i = 0; i < hits.length; i++) {
      const hit = hits[i]!;
      // First occurrence wins; later duplicates (e.g. "Equipment" appearing
      // again inside a sidebar) extend nothing.
      if (anchors.has(hit.name)) continue;
      const next = hits.slice(i + 1).find((h) => h.matchStart > hit.bodyStart);
      anchors.set(hit.name, {
        bodyStart: hit.bodyStart,
        bodyEnd: next ? next.matchStart : text.length,
      });
    }
    return anchors;
  }

  private sliceAnchor(text: string, anchors: Map<string, AnchorSpan>, name: string): string {
    const span = anchors.get(name);
    if (!span) return "";
    return text.slice(span.bodyStart, span.bodyEnd);
  }

  /**
   * Extract the archetype name from a playbook section by trying patterns in order.
   * Returns "Unknown" when no pattern matches; callers decide whether that is fatal.
   */
  private extractArchetype(text: string, sectionIndex: number): string {
    const archetypePatterns = [
      // Letter classes use Unicode property escapes so non-ASCII archetype
      // names (e.g. "The Nâgualisz") match. The ASCII-only [A-Z][a-z]+ form
      // stopped at the first diacritic and fell through to "Unknown".
      {
        regex: /^[^\p{L}\p{N}]*(The\s+\p{Lu}\p{Ll}+(?:\s+\p{Lu}\p{Ll}+)*)/mu,
        description: "The [Name] at section start",
      },
      {
        regex: /(The\s+\p{Lu}\p{Ll}+(?:\s+\p{Lu}\p{Ll}+)*)[^\p{L}\p{N}]*Choose Your Nature/iu,
        description: "The [Name] near Choose Your Nature",
      },
      {
        regex: /^[^\p{L}\p{N}]*(\p{Lu}[\p{Lu}\s]+\p{Lu})\s*$/mu,
        description: "ALL CAPS title header",
      },
      {
        regex: /^[^\p{L}\p{N}]*(\p{Lu}\p{Ll}+)[^\p{L}\p{N}]*Choose Your Nature/iu,
        description: "Single word before Choose Your Nature",
      },
    ];

    let archetypeName = "Unknown";

    for (const { regex, description } of archetypePatterns) {
      const match = text.match(regex);
      if (match?.[1]) {
        const candidate = match[1].trim().replace(/\s+/g, " ").trim();
        if (candidate.length > 3 && candidate.length < 50) {
          archetypeName = candidate;
          this.logger.debug({
            msg: "Archetype extracted",
            sectionIndex,
            archetype: archetypeName,
            extractionMethod: description,
          });
          break;
        }
      }
    }

    return archetypeName;
  }

  /**
   * Parse background options from text
   */
  private parseBackground(
    text: string,
    anchors: Map<string, AnchorSpan>,
  ): { homeOptions: string[]; motivationOptions: string[] } {
    const homeOptions = this.linesFromAnchor(text, anchors, "WhereDoYouCallHome").filter(
      (line) => !line.includes("____________"),
    );
    const motivationOptions = this.linesFromAnchor(text, anchors, "WhyAreYouAVagabond").filter(
      (line) => !line.includes("____________"),
    );
    return { homeOptions, motivationOptions };
  }

  /**
   * Parse nature stats from text.
   *
   * Confined to the "Choose Your Nature" → next-anchor slice — the prior
   * implementation pulled every signed integer from the entire section
   * (capped at 35) which would soak up unrelated numerals from later
   * sections. Falls back to the whole section when the anchor is missing.
   */
  private parseNature(
    text: string,
    anchors: Map<string, AnchorSpan>,
  ): { stats: number[]; statNames: string[] } {
    const statNames = ["Charm", "Cunning", "Finesse", "Luck", "Might"];
    const slice = this.sliceAnchor(text, anchors, "ChooseYourNature") || text;
    const matches = slice.match(/[-+]?\d+/g) ?? [];
    const stats = matches.map((m) => parseInt(m.replace("+", ""), 10));
    return { stats, statNames };
  }

  /**
   * Parse moves from text
   */
  private parseMoves(text: string, anchors: Map<string, AnchorSpan>): string[] {
    return this.linesFromAnchor(text, anchors, "Moves", { minLength: 10 });
  }

  /**
   * Parse equipment from text
   */
  private parseEquipment(
    text: string,
    anchors: Map<string, AnchorSpan>,
  ): { startingValue: number; items: string[] } {
    let startingValue = 0;
    const valueMatch = text.match(/starting value:\s*(\d+)/i);
    if (valueMatch?.[1]) {
      startingValue = parseInt(valueMatch[1], 10);
    }

    const items = this.linesFromAnchor(text, anchors, "Equipment").filter(
      (line) =>
        !line.includes("starting value") && !line.includes("carrying") && !line.includes("____"),
    );

    return { startingValue, items };
  }

  /**
   * Parse feats from text
   */
  private parseFeats(text: string, anchors: Map<string, AnchorSpan>): string[] {
    return this.linesFromAnchor(text, anchors, "Feats").filter(
      (line) => !line.includes("start with marked feats"),
    );
  }

  /**
   * Parse weapon skills from text
   */
  private parseWeaponSkills(text: string, anchors: Map<string, AnchorSpan>): string[] {
    return this.linesFromAnchor(text, anchors, "WeaponSkills").filter(
      (line) => !line.includes("choose one bolded weapon skill"),
    );
  }

  private linesFromAnchor(
    text: string,
    anchors: Map<string, AnchorSpan>,
    name: string,
    options: { minLength?: number } = {},
  ): string[] {
    const slice = this.sliceAnchor(text, anchors, name);
    if (!slice) return [];
    const min = options.minLength ?? 1;
    return slice
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length >= min);
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

  /**
   * Parse details from text
   */
  private parseDetails(
    text: string,
    anchors: Map<string, AnchorSpan>,
  ): {
    pronouns: string[];
    appearance: string[];
    accessories: string[];
  } {
    const pronouns: string[] = [];
    const appearance: string[] = [];
    const accessories: string[] = [];

    const detailsText = this.sliceAnchor(text, anchors, "Details");
    if (detailsText) {
      // Split by bullet points and clean up each line
      const lines = detailsText.split(/\n\s*•/).filter((line) => line.trim().length > 0);

      lines.forEach((line, index) => {
        // Clean up the line
        const cleanLine = line.replace(/^[•\s]+/, "").trim();
        if (!cleanLine) return;

        // Split by comma and clean up each item
        const items = cleanLine
          .split(",")
          .map((item) => normalizeWhitespace(item))
          .filter((item) => item.length > 0);

        // Assign to appropriate category based on position
        if (index === 0) {
          // First line: pronouns
          pronouns.push(...items);
        } else if (index === 1) {
          // Second line: appearance/style
          appearance.push(...items);
        } else if (index === 2) {
          // Third line: accessories/items
          accessories.push(...items);
        }
      });
    }

    return { pronouns, appearance, accessories };
  }

  /**
   * Parse demeanor options from text
   */
  private parseDemeanor(text: string, anchors: Map<string, AnchorSpan>): string[] {
    const slice = this.sliceAnchor(text, anchors, "Demeanor");
    if (!slice) return [];

    // Demeanor is a single line of comma-separated traits — take only the
    // first non-empty line of the slice so a runaway slice (e.g. into the
    // next playbook's title) cannot bleed in.
    const firstLine = slice.split("\n").find((line) => line.trim().length > 0) ?? "";
    return firstLine
      .split(",")
      .map((item) => normalizeWhitespace(item))
      .map((item) => item.replace(/^[•\s]+/, "").trim())
      .filter((item) => item.length > 0 && item.length < 50);
  }
}
