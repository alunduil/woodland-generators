// Wrap unpdf's extractText in a passthrough jest.fn so the rest of the suite
// keeps running real fixtures while the empty-results describe block can
// override individual calls with mockResolvedValueOnce.
jest.mock("unpdf", () => {
  const actual = jest.requireActual("unpdf");
  return {
    ...actual,
    extractText: jest.fn(actual.extractText),
    getDocumentProxy: jest.fn(actual.getDocumentProxy),
  };
});

import { writeFileSync, unlinkSync } from "fs";
import { tmpdir } from "os";
import path from "path";

import { glob } from "glob";
import { extractText, getDocumentProxy } from "unpdf";

import { PDFPlaybookSource } from "../../../src/playbook/sources/pdf";
import { PdfParseError, PDF_PARSE_STAGES } from "../../../src/playbook/sources/errors";
import { root } from "../../../src/logging";

const mockExtractText = extractText as unknown as jest.Mock;
const mockGetDocumentProxy = getDocumentProxy as unknown as jest.Mock;

// Magic-bytes isValid (see PDFPlaybookSource.isValid) cannot distinguish PDFs
// with a valid %PDF- header but corrupt internals. These fixtures fail at
// load() time with a stage-tagged error, not at isValid().
const HEADER_VALID_BUT_CORRUPT = new Set(["invalid-compression.pdf", "bad-xref-entry.pdf"]);

// Edge-case fixtures (issue #128) are exercised in pdf.edge-cases.test.ts so
// each gets a fresh jest worker; pdf-parse's pdf.js v1.10.100 holds module
// state that contaminates parses across the same worker process. The auto-
// generated coverage in this file skips them to keep the existing suite green.
const EDGE_CASE_FIXTURES = new Set([
  "two-column-1.pdf",
  "unknown-archetype-1.pdf",
  "short-section-1.pdf",
  "non-ascii-archetype-1.pdf",
]);

describe("PDFPlaybookSource - PlaybookSource interface implementation", () => {
  const fixturesDir = path.join(__dirname, "../../fixtures");

  // Helper to get the first valid PDF file from our fixtures
  const getFirstValidPdf = () => {
    const validFiles = glob
      .sync("playbooks-pdf/valid/*", { cwd: fixturesDir })
      .filter((f) => !EDGE_CASE_FIXTURES.has(path.basename(f)));
    if (validFiles.length === 0) {
      throw new Error("No valid PDF files found in test fixtures");
    }
    return path.join(fixturesDir, validFiles[0]!);
  };

  beforeEach(() => {
    root.level = "silent";
  });

  describe("isValid", () => {
    it("should return false for empty path", async () => {
      const source = new PDFPlaybookSource("", "pdf");
      const result = await source.isValid();
      expect(result).toBe(false);
    });

    it("should return false for non-existent files", async () => {
      const source = new PDFPlaybookSource(path.join(tmpdir(), "pdf.test.pdf"), "pdf");
      const result = await source.isValid();
      expect(result).toBe(false);
    });

    it("should return false for directories", async () => {
      const source = new PDFPlaybookSource(fixturesDir, "pdf");
      const result = await source.isValid();
      expect(result).toBe(false);
    });

    // Generate test cases for files that should be invalid for PDF source
    [
      ...glob
        .sync("playbooks-*/valid/*", { cwd: fixturesDir })
        .filter((file) => !file.includes("playbooks-pdf")),
      ...glob.sync("playbooks-pdf/invalid/*", { cwd: fixturesDir }),
    ]
      .filter((file) => !HEADER_VALID_BUT_CORRUPT.has(path.basename(file)))
      .forEach((file) => {
        it(`should return false for: ${path.basename(file)}`, async () => {
          const source = new PDFPlaybookSource(path.join(fixturesDir, file), "pdf");
          const result = await source.isValid();
          expect(result).toBe(false);
        });
      });

    // Generate test cases for files that should be valid for PDF source
    glob
      .sync("playbooks-pdf/valid/*", { cwd: fixturesDir })
      .filter((file) => !EDGE_CASE_FIXTURES.has(path.basename(file)))
      .forEach((file) => {
        it(`should return true for: ${path.basename(file)}`, async () => {
          const source = new PDFPlaybookSource(path.join(fixturesDir, file), "pdf");
          const result = await source.isValid();
          expect(result).toBe(true);
        });
      });
  });

  describe("load", () => {
    it("should throw error when loading non-existent files", async () => {
      const source = new PDFPlaybookSource(path.join(tmpdir(), "pdf.test.pdf"), "pdf");
      await expect(source.load()).rejects.toThrow();
    });

    // Generate test cases for files that should fail to load
    [
      ...glob
        .sync("playbooks-*/valid/*", { cwd: fixturesDir })
        .filter((file) => !file.includes("playbooks-pdf")),
      ...glob.sync("playbooks-pdf/invalid/*", { cwd: fixturesDir }),
    ].forEach((file) => {
      it(`should throw error when loading: ${path.basename(file)}`, async () => {
        const source = new PDFPlaybookSource(path.join(fixturesDir, file), "pdf");
        await expect(source.load()).rejects.toThrow();
      });
    });

    // Generate test cases for files that should successfully load
    glob
      .sync("playbooks-pdf/valid/*", { cwd: fixturesDir })
      .filter((file) => !EDGE_CASE_FIXTURES.has(path.basename(file)))
      .forEach((file) => {
        it(`should successfully load: ${path.basename(file)}`, async () => {
          const source = new PDFPlaybookSource(path.join(fixturesDir, file), "pdf");
          await expect(source.load()).resolves.not.toThrow();

          // Extract expected count from filename (e.g., "playbooks-with-rules-2.pdf" -> 2)
          const filename = path.basename(file, ".pdf");
          const countMatch = filename.match(/-(\d+)$/);
          const expectedCount = countMatch ? parseInt(countMatch[1]!, 10) : null;

          // All valid PDF filenames must contain expected playbook count
          if (expectedCount === null) {
            throw new Error(
              `Invalid filename format: ${filename}. Valid PDF files must end with expected playbook count (e.g., "playbooks-with-rules-2.pdf")`,
            );
          }

          // Verify that the exact expected number of playbooks were loaded
          const playbooks = source.getPlaybooks();
          expect(playbooks.length).toBe(expectedCount);
        });
      });

    // Field-level assertions on the canonical synthetic fixture. Previously
    // the only check was `playbooks.length`, which a parser returning N empty
    // Playbook objects would still pass (issue #199, "Wider parser smells" #6).
    it("should populate field-level data from the canonical fixture", async () => {
      const source = new PDFPlaybookSource(
        path.join(fixturesDir, "playbooks-pdf/valid/multiple-playbooks-3.pdf"),
        "pdf",
      );
      await source.load();
      const playbooks = source.getPlaybooks();
      expect(playbooks).toHaveLength(3);
      // Archetype regex greedily captures the trailing "Choose Your Nature"
      // because every word is capitalised; the leading "The X" still
      // identifies each playbook unambiguously.
      expect(playbooks[0]!.archetype.startsWith("The Ranger")).toBe(true);
      expect(playbooks[1]!.archetype.startsWith("The Thief")).toBe(true);
      expect(playbooks[2]!.archetype.startsWith("The Tinker")).toBe(true);

      for (const pb of playbooks) {
        expect(pb.background.homeOptions.length).toBeGreaterThanOrEqual(4);
        expect(pb.background.motivationOptions.length).toBeGreaterThanOrEqual(4);
        expect(pb.background.homeOptions.every((opt) => opt.startsWith("•"))).toBe(true);
        expect(pb.moves.length).toBeGreaterThan(0);
        expect(pb.nature.statNames).toEqual(["Charm", "Cunning", "Finesse", "Luck", "Might"]);
      }
    });

    it("should be idempotent and safe for repeated calls", async () => {
      const source = new PDFPlaybookSource(getFirstValidPdf(), "pdf");
      await source.load();

      // Get the initial state
      const initialPlaybooks = source.getPlaybooks();

      // Load again and verify state hasn't changed
      await expect(source.load()).resolves.not.toThrow();
      const afterSecondLoad = source.getPlaybooks();

      expect(afterSecondLoad).toEqual(initialPlaybooks);
    });
  });

  describe("typed PdfParseError", () => {
    const skippedFixtures = new Set(["invalid-compression.pdf", "bad-xref-entry.pdf"]);

    const failingFixtures = [
      ...glob
        .sync("playbooks-*/valid/*", { cwd: fixturesDir })
        .filter((file) => !file.includes("playbooks-pdf")),
      ...glob.sync("playbooks-pdf/invalid/*", { cwd: fixturesDir }),
    ].filter((file) => !skippedFixtures.has(path.basename(file)));

    it("should throw PdfParseError with stage 'read' for non-existent files", async () => {
      const source = new PDFPlaybookSource(path.join(tmpdir(), "does-not-exist.pdf"), "pdf");
      await expect(source.load()).rejects.toBeInstanceOf(PdfParseError);
      await expect(source.load()).rejects.toMatchObject({ stage: "read" });
    });

    it("should throw PdfParseError with stage 'read' for directories", async () => {
      const source = new PDFPlaybookSource(fixturesDir, "pdf");
      await expect(source.load()).rejects.toBeInstanceOf(PdfParseError);
      await expect(source.load()).rejects.toMatchObject({ stage: "read" });
    });

    failingFixtures.forEach((file) => {
      it(`should throw PdfParseError with a known stage for: ${path.basename(file)}`, async () => {
        const source = new PDFPlaybookSource(path.join(fixturesDir, file), "pdf");
        try {
          await source.load();
          throw new Error("expected load() to reject");
        } catch (error) {
          expect(error).toBeInstanceOf(PdfParseError);
          const stage = (error as PdfParseError).stage;
          expect(PDF_PARSE_STAGES).toContain(stage);
        }
      });
    });
  });

  describe("empty extraction results", () => {
    const stubFixturePath = path.join(tmpdir(), "pdf-empty-results.test.pdf");

    const stubResult = (text: string) => ({ text: [text], totalPages: 1 });

    beforeAll(() => {
      // unpdf's getDocumentProxy and extractText are both mocked per-test via
      // mockResolvedValueOnce, so the file's contents are never parsed.
      // readFileSync still runs in load(), so the file must exist on disk.
      writeFileSync(stubFixturePath, "stub");
    });

    afterAll(() => {
      try {
        unlinkSync(stubFixturePath);
      } catch {
        // ignore — best-effort cleanup
      }
    });

    it("throws PdfParseError tagged 'split' when extracted text yields no playbook sections", async () => {
      mockGetDocumentProxy.mockResolvedValueOnce({});
      mockExtractText.mockResolvedValueOnce(stubResult("tiny"));

      const source = new PDFPlaybookSource(stubFixturePath, "pdf");
      const promise = source.load();

      await expect(promise).rejects.toBeInstanceOf(PdfParseError);
      await expect(promise).rejects.toMatchObject({
        stage: "split",
        message: expect.stringContaining("no playbook sections"),
      });
    });

    // Real playbook PDFs use "Roguish Moves" as the heading; "Starting Moves"
    // never appears in the in-tree out-of-fixture content surveyed in #199.
    // Both anchors must resolve so synthetic fixtures and real PDFs both
    // populate the moves field instead of silently emitting an empty array.
    it("recognizes 'Roguish Moves' as the moves anchor", async () => {
      const text = [
        "The Auditor",
        "Choose Your Nature",
        "+1 +2 -1 +0 +1",
        "Roguish Moves",
        "MOVE ONE: lorem ipsum dolor sit amet consectetur adipiscing elit",
        "MOVE TWO: ut labore et dolore magna aliqua enim ad minim veniam",
        "Background",
        "Where do you call home?",
        "Why are you a vagabond?",
      ].join("\n");

      mockGetDocumentProxy.mockResolvedValueOnce({});
      mockExtractText.mockResolvedValueOnce(stubResult(text));

      const source = new PDFPlaybookSource(stubFixturePath, "pdf");
      await source.load();
      const [pb] = source.getPlaybooks();
      expect(pb!.moves.length).toBeGreaterThanOrEqual(2);
      expect(pb!.moves.some((m) => m.startsWith("MOVE ONE"))).toBe(true);
      expect(pb!.moves.some((m) => m.startsWith("MOVE TWO"))).toBe(true);
    });

    it("throws PdfParseError tagged 'section-parse' when no section produces a valid playbook", async () => {
      // Long enough to clear minSectionLength (100), but lacks every archetype
      // pattern and every playbook indicator ("Choose Your Nature", "Starting
      // Moves", or the Background/vagabond pair) — every section is rejected
      // as non-playbook.
      const noisyText = (
        "this is a long lorem ipsum style passage with no proper noun patterns " +
        "and no special markers and no caps lines so the parser will not find an " +
        "archetype here despite the text being long enough to count as a section "
      ).repeat(2);

      mockGetDocumentProxy.mockResolvedValueOnce({});
      mockExtractText.mockResolvedValueOnce(stubResult(noisyText));

      const source = new PDFPlaybookSource(stubFixturePath, "pdf");
      const promise = source.load();

      await expect(promise).rejects.toBeInstanceOf(PdfParseError);
      await expect(promise).rejects.toMatchObject({
        stage: "section-parse",
        message: expect.stringContaining("no valid playbooks"),
      });
    });
  });
});
