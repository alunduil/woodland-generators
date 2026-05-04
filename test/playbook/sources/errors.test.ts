import { asPdfParseError, PdfParseError } from "../../../src/playbook/sources/errors";

describe("asPdfParseError", () => {
  // The PDF parser wraps multiple stages in nested try/catch blocks, so an
  // inner error tagged with one stage can flow through an outer wrapper that
  // would normally tag a different stage. Returning the existing error
  // unchanged preserves the original failing stage in the bug-report hint.
  it("returns existing PdfParseError unchanged so the original stage propagates", () => {
    const inner = new PdfParseError("archetype-extract", "/path/to/file.pdf", "boom");

    const result = asPdfParseError("section-parse", "/path/to/file.pdf", inner, "section 0");

    expect(result).toBe(inner);
    expect(result.stage).toBe("archetype-extract");
  });
});
