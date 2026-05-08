import { PDFPlaybookSource } from "../../../src/playbook/sources/pdf";
import { root } from "../../../src/logging";
import path from "path";

// Edge-case fixtures (issue #128) pin the parser's current behavior on inputs
// that the heuristic-heavy regex pipeline does not handle cleanly. They are
// baselines: when the parser is hardened (#199), these assertions should
// change to reflect the new contract.
describe("PDFPlaybookSource - edge cases (issue #128)", () => {
  const validDir = path.join(__dirname, "../../fixtures/playbooks-pdf/valid");

  beforeEach(() => {
    root.level = "silent";
  });

  it("two-column layout: archetype parses cleanly but background options pick up sidebar text", async () => {
    // The fixture mirrors the real playbook layout: CYN as the section's
    // first line, archetype "The X" mid-section, prose between archetype
    // and the Background header. Column fusion happens at the Background
    // section's body, where left-column bullets fuse with right-column
    // sidebar text (Details/Demeanor/Equipment). The archetype itself is
    // captured cleanly because lowercase prose breaks the greedy capture.
    const source = new PDFPlaybookSource(path.join(validDir, "two-column-1.pdf"), "pdf");
    await source.load();
    const [pb] = source.getPlaybooks();
    expect(source.getPlaybooks().length).toBe(1);
    expect(pb!.archetype).toBe("The Brigand");
    // Column fusion shows up in homeOptions: the left-column bullet ends
    // with "a" or "b" but the next character on the same row was the
    // right-column header "Details" or pronoun list. They run together.
    const fusedHomeOptions = pb!.background.homeOptions.filter((opt) =>
      /Details|she\/her|he\/him|they\/them/.test(opt),
    );
    expect(fusedHomeOptions.length).toBeGreaterThan(0);
  });

  it("non-matching archetype: single capitalised word mid-section yields 'Unknown'", async () => {
    // The fixture's archetype is "Vagabond" — single capitalised word with
    // no "The" prefix, not in ALL CAPS, and far from the CYN anchor. None
    // of the four extraction regexes match, so it falls through to
    // "Unknown" while the playbook indicators keep the section.
    const source = new PDFPlaybookSource(path.join(validDir, "unknown-archetype-1.pdf"), "pdf");
    await source.load();
    const [pb] = source.getPlaybooks();
    expect(source.getPlaybooks().length).toBe(1);
    expect(pb!.archetype).toBe("Unknown");
  });

  it("short section below minSectionLength is dropped silently", async () => {
    // The fixture has two "Choose Your Nature" delimiters; the section
    // following the second one ("The Stub" + "tiny.") falls under the
    // 100-char floor and is dropped without a warning, leaving 1 playbook.
    const source = new PDFPlaybookSource(path.join(validDir, "short-section-1.pdf"), "pdf");
    await source.load();
    const [pb] = source.getPlaybooks();
    expect(source.getPlaybooks().length).toBe(1);
    expect(pb!.archetype).toBe("The Ronin");
  });

  it("non-ASCII archetype: Unicode-aware patterns capture diacritics", async () => {
    // The fixture's archetype is "The Nâgualisz". The extraction patterns now
    // use \p{Lu}\p{Ll}+ instead of [A-Z][a-z]+, so the "â" no longer truncates
    // the match.
    const source = new PDFPlaybookSource(path.join(validDir, "non-ascii-archetype-1.pdf"), "pdf");
    await source.load();
    const [pb] = source.getPlaybooks();
    expect(source.getPlaybooks().length).toBe(1);
    expect(pb!.archetype).toBe("The Nâgualisz");
  });
});
