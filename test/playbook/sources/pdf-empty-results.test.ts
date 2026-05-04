import { writeFileSync, unlinkSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";

jest.mock("pdf-parse", () => jest.fn());

import pdfParse from "pdf-parse";
import { PDFPlaybookSource } from "../../../src/playbook/sources/pdf";
import { PdfParseError } from "../../../src/playbook/sources/errors";
import { root } from "../../../src/logging";

const mockPdfParse = pdfParse as unknown as jest.Mock;

const stubResult = (text: string) => ({
  text,
  numpages: 1,
  numrender: 1,
  info: {},
  metadata: null,
  version: "v1.10.100",
});

describe("PDFPlaybookSource - empty extraction results", () => {
  const fixturePath = join(tmpdir(), "pdf-empty-results.test.pdf");

  beforeAll(() => {
    // pdf-parse is mocked, so the file's contents are never extracted.
    // readFileSync still runs in load(), so the file must exist on disk.
    writeFileSync(fixturePath, "stub");
  });

  afterAll(() => {
    try {
      unlinkSync(fixturePath);
    } catch {
      // ignore — best-effort cleanup
    }
  });

  beforeEach(() => {
    root.level = "silent";
    mockPdfParse.mockReset();
  });

  it("throws PdfParseError tagged 'split' when extracted text yields no playbook sections", async () => {
    mockPdfParse.mockResolvedValue(stubResult("tiny"));

    const source = new PDFPlaybookSource(fixturePath, "pdf");
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
    // Moves", or the Background/vagabond pair) — every section is rejected as
    // non-playbook.
    const noisyText = (
      "this is a long lorem ipsum style passage with no proper noun patterns " +
      "and no special markers and no caps lines so the parser will not find an " +
      "archetype here despite the text being long enough to count as a section "
    ).repeat(2);

    mockPdfParse.mockResolvedValue(stubResult(noisyText));

    const source = new PDFPlaybookSource(fixturePath, "pdf");
    const promise = source.load();

    await expect(promise).rejects.toBeInstanceOf(PdfParseError);
    await expect(promise).rejects.toMatchObject({
      stage: "section-parse",
      message: expect.stringContaining("no valid playbooks"),
    });
  });
});
