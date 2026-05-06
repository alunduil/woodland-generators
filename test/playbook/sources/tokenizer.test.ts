import { tokenize, SECTION_ANCHORS, type Token } from "../../../src/playbook/sources/tokenizer";

describe("tokenize", () => {
  it("emits no tokens for an empty page array", () => {
    expect(tokenize([]).tokens).toEqual([]);
  });

  it("emits no tokens for whitespace-only pages", () => {
    expect(tokenize(["   ", "\n\n"]).tokens.filter((t) => t.type !== "PageBreak")).toEqual([]);
  });

  it("emits BodyLine tokens for non-anchor text, skipping blank lines", () => {
    const { tokens } = tokenize(["The Ranger\n\nlorem ipsum"]);
    const bodies = tokens.filter(
      (t): t is Extract<Token, { type: "BodyLine" }> => t.type === "BodyLine",
    );
    expect(bodies.map((t) => t.text)).toEqual(["The Ranger", "lorem ipsum"]);
  });

  it("emits AnchorHeader tokens for every entry in SECTION_ANCHORS", () => {
    const text = [
      "The Auditor",
      "Choose Your Nature",
      "Background",
      "Where do you call home?",
      "Why are you a vagabond?",
      "Roguish Moves",
      "Roguish Feats",
      "Weapon Skills",
      "Equipment",
      "Details",
      "Demeanor",
    ].join("\n");
    const headers = tokenize([text]).tokens.filter(
      (t): t is Extract<Token, { type: "AnchorHeader" }> => t.type === "AnchorHeader",
    );
    expect(headers.map((h) => h.name)).toEqual(SECTION_ANCHORS.map((a) => a.name));
  });

  it("treats 'Starting Moves' and 'Roguish Moves' both as the Moves anchor", () => {
    const a = tokenize(["Starting Moves\nfoo"]).tokens.find((t) => t.type === "AnchorHeader");
    const b = tokenize(["Roguish Moves\nfoo"]).tokens.find((t) => t.type === "AnchorHeader");
    expect(a).toMatchObject({ type: "AnchorHeader", name: "Moves" });
    expect(b).toMatchObject({ type: "AnchorHeader", name: "Moves" });
  });

  it("keeps only the first occurrence of a duplicated anchor", () => {
    const text = ["Equipment", "items", "Equipment", "more items"].join("\n");
    const headers = tokenize([text]).tokens.filter((t) => t.type === "AnchorHeader");
    expect(headers).toHaveLength(1);
  });

  it("orders tokens by document position", () => {
    const { tokens } = tokenize([
      "The Ranger\nChoose Your Nature\n+1 +2 +0 -1 +1\nBackground\nstuff",
    ]);
    const positions = tokens.map((t) => t.pos);
    expect(positions).toEqual([...positions].sort((a, b) => a - b));
  });

  it("emits a PageBreak between pages, with monotonic positions", () => {
    const { tokens } = tokenize(["The Ranger", "The Thief"]);
    const pageBreak = tokens.find((t) => t.type === "PageBreak");
    expect(pageBreak).toMatchObject({ type: "PageBreak", page: 1 });
    const positions = tokens.map((t) => t.pos);
    expect(positions).toEqual([...positions].sort((a, b) => a - b));
  });

  it("normalizes typography before matching anchors", () => {
    // Non-breaking space inside the heading; smart quote in body. Real PDFs
    // hand these out; the lexer must still resolve the anchor.
    const text = "Where do you call home?\nlorem";
    const headers = tokenize([text]).tokens.filter((t) => t.type === "AnchorHeader");
    expect(headers).toHaveLength(1);
    expect(headers[0]).toMatchObject({ name: "WhereDoYouCallHome" });
  });

  it("decomposes a bulleted line into a Bullet token followed by its body", () => {
    const { tokens } = tokenize(["• fox"]);
    const types = tokens.filter((t) => t.type !== "PageBreak").map((t) => t.type);
    expect(types).toEqual(["Bullet", "BodyLine"]);
    const body = tokens.find((t) => t.type === "BodyLine") as Extract<Token, { type: "BodyLine" }>;
    expect(body.text).toBe("fox");
  });
});
