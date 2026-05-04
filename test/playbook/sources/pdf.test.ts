// Wrap pdf-parse in a passthrough jest.fn so the rest of the suite keeps
// running real fixtures while the empty-results describe block can override
// individual calls with mockResolvedValueOnce.
jest.mock("pdf-parse", () => {
  const actual = jest.requireActual("pdf-parse") as (
    buffer: Buffer,
  ) => Promise<{ text: string; numpages: number }>;
  return jest.fn(actual);
});

import { writeFileSync, unlinkSync } from "fs";
import { tmpdir } from "os";
import path from "path";

import { glob } from "glob";
import pdfParse from "pdf-parse";

import { PDFPlaybookSource } from "../../../src/playbook/sources/pdf";
import { PdfParseError, PDF_PARSE_STAGES } from "../../../src/playbook/sources/errors";
import { root } from "../../../src/logging";

const mockPdfParse = pdfParse as unknown as jest.Mock;

describe("PDFPlaybookSource - PlaybookSource interface implementation", () => {
  const fixturesDir = path.join(__dirname, "../../fixtures");

  // Helper to get the first valid PDF file from our fixtures
  const getFirstValidPdf = () => {
    const validFiles = glob.sync("playbooks-pdf/valid/*", { cwd: fixturesDir });
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
    ].forEach((file) => {
      const testName = `should return false for: ${path.basename(file)}`;

      // TODO: Fix intermittent failure with invalid-compression.pdf due to PDF.js global state contamination
      if (
        path.basename(file) === "invalid-compression.pdf" ||
        path.basename(file) === "bad-xref-entry.pdf"
      ) {
        it.skip(testName, async () => {
          const source = new PDFPlaybookSource(path.join(fixturesDir, file), "pdf");
          const result = await source.isValid();
          expect(result).toBe(false);
        });
      } else {
        it(testName, async () => {
          const source = new PDFPlaybookSource(path.join(fixturesDir, file), "pdf");
          const result = await source.isValid();
          expect(result).toBe(false);
        });
      }
    });

    // Generate test cases for files that should be valid for PDF source
    glob.sync("playbooks-pdf/valid/*", { cwd: fixturesDir }).forEach((file) => {
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
      const testName = `should throw error when loading: ${path.basename(file)}`;

      // TODO: Fix intermittent failure with invalid-compression.pdf due to PDF.js global state contamination
      if (
        path.basename(file) === "invalid-compression.pdf" ||
        path.basename(file) === "bad-xref-entry.pdf"
      ) {
        it.skip(testName, async () => {
          const source = new PDFPlaybookSource(path.join(fixturesDir, file), "pdf");
          await expect(source.load()).rejects.toThrow();
        });
      } else {
        it(testName, async () => {
          const source = new PDFPlaybookSource(path.join(fixturesDir, file), "pdf");
          await expect(source.load()).rejects.toThrow();
        });
      }
    });

    // Generate test cases for files that should successfully load
    glob.sync("playbooks-pdf/valid/*", { cwd: fixturesDir }).forEach((file) => {
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

    const stubResult = (text: string) => ({
      text,
      numpages: 1,
      numrender: 1,
      info: {},
      metadata: null,
      version: "v1.10.100",
    });

    beforeAll(() => {
      // pdf-parse is mocked per-test via mockResolvedValueOnce, so the file's
      // contents are never extracted. readFileSync still runs in load(), so
      // the file must exist on disk.
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
      mockPdfParse.mockResolvedValueOnce(stubResult("tiny"));

      const source = new PDFPlaybookSource(stubFixturePath, "pdf");
      const promise = source.load();

      await expect(promise).rejects.toBeInstanceOf(PdfParseError);
      await expect(promise).rejects.toMatchObject({
        stage: "split",
        message: expect.stringContaining("no playbook sections"),
      });
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

      mockPdfParse.mockResolvedValueOnce(stubResult(noisyText));

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
