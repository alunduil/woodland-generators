import { PDFPlaybookSource } from "../../../src/playbook/sources/pdf";
import { root } from "../../../src/logging";
import path from "path";

// Edge-case fixtures (issue #128) pin the parser's current behavior on inputs
// that the heuristic-heavy regex pipeline does not handle cleanly. They are
// baselines: when the parser is hardened, these assertions should change to
// reflect the new contract.
//
// They live in their own test file so each gets a fresh jest worker;
// pdf-parse's pdf.js v1.10.100 holds module-level state that leaks across
// parses and otherwise corrupts later reads in the same worker.
describe("PDFPlaybookSource - edge cases (issue #128)", () => {
  const validDir = path.join(__dirname, "../../fixtures/playbooks-pdf/valid");

  beforeEach(() => {
    root.level = "silent";
  });

  it("two-column layout: same-row cells fuse into the archetype", async () => {
    // Adjacent columns sharing a row extract as one line, so the archetype
    // regex absorbs the trailing "Choose Your Nature" header that lived on
    // the right side of the title row.
    const source = new PDFPlaybookSource(path.join(validDir, "two-column-1.pdf"), "pdf");
    await source.load();
    const playbooks = source.getPlaybooks();
    expect(playbooks.length).toBe(1);
    expect(playbooks[0]!.archetype).toBe("The Brigand Choose Your Nature");
  });

  it("non-matching archetype: regex latches onto stray 'the X' prose", async () => {
    // The case-insensitive "The [Name] near Choose Your Nature" pattern
    // captures lowercase "the woods" inside the body text even though the
    // header "a wandering stranger of the woods" is not a real archetype.
    const source = new PDFPlaybookSource(path.join(validDir, "unknown-archetype-1.pdf"), "pdf");
    await source.load();
    const playbooks = source.getPlaybooks();
    expect(playbooks.length).toBe(1);
    expect(playbooks[0]!.archetype).toBe("the woods");
  });

  it("short section below minSectionLength is dropped silently", async () => {
    // The fixture has two "Choose Your Nature" delimiters; the section
    // following the second one ("The Stub" + "tiny.") falls under the
    // 100-char floor and is dropped without a warning, leaving 1 playbook.
    const source = new PDFPlaybookSource(path.join(validDir, "short-section-1.pdf"), "pdf");
    await source.load();
    expect(source.getPlaybooks().length).toBe(1);
  });

  it("non-ASCII archetype: regex misses the name and falls through to 'Unknown'", async () => {
    // [A-Z][a-z]+ is ASCII-only, so "The Nâgualisz" stops at "N"; the partial
    // match fails the 3<length<50 sanity check and falls through to
    // "Unknown", while the playbook indicators keep the section.
    const source = new PDFPlaybookSource(path.join(validDir, "non-ascii-archetype-1.pdf"), "pdf");
    await source.load();
    const playbooks = source.getPlaybooks();
    expect(playbooks.length).toBe(1);
    expect(playbooks[0]!.archetype).toBe("Unknown");
  });
});
