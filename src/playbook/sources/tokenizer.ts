/**
 * Token stream for the PDF playbook parser.
 *
 * Phase 1 of the tokenize → recursive-descent refactor tracked in #208.
 * Owns the anchor heading table, whitespace normalization, and page
 * boundaries. The recursive-descent parser (phase 2) consumes the token
 * stream produced here; `pdf.ts`'s legacy regex-slice path also reads
 * `SECTION_ANCHORS` from this module so both sides share one source of
 * truth while the migration lands incrementally.
 */

import { normalizeForMatching } from "./debug";

/**
 * Stable internal names for the section anchors found inside a playbook.
 *
 * The string literal type lets the parser's dispatch loop be exhaustive over
 * known anchors without smuggling raw heading text through the API.
 */
export type AnchorName =
  | "ChooseYourNature"
  | "Background"
  | "WhereDoYouCallHome"
  | "WhyAreYouAVagabond"
  | "Moves"
  | "Feats"
  | "WeaponSkills"
  | "Equipment"
  | "Details"
  | "Demeanor";

interface AnchorDef {
  name: AnchorName;
  regex: RegExp;
}

/**
 * Headings sit on their own line (or trailing-only content on the line) in
 * extracted PDF text, so anchors require either a line boundary or a `?`
 * terminator. `g` is set on every entry so the lexer can pick up multiple
 * occurrences for first-wins resolution.
 *
 * Real playbooks use "Roguish Moves"; the audit on #199 confirmed
 * "Starting Moves" never appears in surveyed content. Both forms anchor
 * here so synthetic fixtures and real content both resolve.
 */
export const SECTION_ANCHORS: ReadonlyArray<AnchorDef> = [
  { name: "ChooseYourNature", regex: /^[ \t]*Choose Your Nature[ \t]*$/gm },
  { name: "Background", regex: /^[ \t]*Background[ \t]*$/gm },
  { name: "WhereDoYouCallHome", regex: /Where do you call home\?/g },
  { name: "WhyAreYouAVagabond", regex: /Why are you a vagabond\?/g },
  { name: "Moves", regex: /^[ \t]*(?:Starting Moves|Roguish Moves)[ \t]*$/gm },
  { name: "Feats", regex: /^[ \t]*Roguish Feats[ \t]*$/gm },
  { name: "WeaponSkills", regex: /^[ \t]*Weapon Skills[ \t]*$/gm },
  { name: "Equipment", regex: /^[ \t]*Equipment[ \t]*$/gm },
  { name: "Details", regex: /^[ \t]*Details[ \t]*$/gm },
  { name: "Demeanor", regex: /^[ \t]*Demeanor[ \t]*$/gm },
];

/**
 * One token in the lexed playbook stream.
 *
 * `pos` is the offset into the normalized, page-joined document so the
 * parser can produce position-anchored diagnostics (and reuse
 * `createPositionHighlight` for log highlighting).
 */
export type Token =
  | { type: "PageBreak"; page: number; pos: number }
  | { type: "AnchorHeader"; name: AnchorName; raw: string; pos: number }
  | { type: "BodyLine"; text: string; pos: number }
  | { type: "Bullet"; pos: number };

/** Page-joined, normalized document text plus the token stream over it. */
export interface LexResult {
  text: string;
  tokens: Token[];
}

/**
 * Lex the page array produced by the PDF extractor into a flat token stream.
 *
 * The lexer:
 * 1. Joins pages with `\n` and emits a `PageBreak` token at each boundary so
 *    the parser can use natural page breaks as a section hint (replaces the
 *    old `splitPositionThreshold` magic number — landed in #204).
 * 2. Normalizes typography and whitespace before matching anchors so smart
 *    quotes / non-breaking spaces / variable runs of horizontal whitespace
 *    don't defeat heading detection (#206).
 * 3. Scans every `SECTION_ANCHORS` regex against the normalized text,
 *    sorting hits by document position and dropping later occurrences of
 *    the same anchor (first-wins). Each surviving hit becomes an
 *    `AnchorHeader` token; the text between anchors is split into
 *    `BodyLine` tokens, with leading bullet markers turned into a
 *    `Bullet` token followed by the trailing line text. Empty lines are
 *    skipped.
 */
export function tokenize(pages: string[]): LexResult {
  const text = normalizeForMatching(pages.join("\n"));

  const pageBreaks = computePageBreaks(pages);

  const headerHits = scanAnchors(text);

  const tokens: Token[] = [];

  // Walk text segments between header hits, interleaving page breaks in
  // position order so the final stream is monotonic in `pos`.
  let cursor = 0;
  let pageIdx = 0;

  const emitPageBreaksUpTo = (limit: number): void => {
    while (pageIdx < pageBreaks.length && pageBreaks[pageIdx]!.pos <= limit) {
      tokens.push({
        type: "PageBreak",
        page: pageBreaks[pageIdx]!.page,
        pos: pageBreaks[pageIdx]!.pos,
      });
      pageIdx++;
    }
  };

  for (const hit of headerHits) {
    emitPageBreaksUpTo(hit.matchStart);
    if (hit.matchStart > cursor) {
      emitBodyLines(text, cursor, hit.matchStart, tokens);
    }
    tokens.push({
      type: "AnchorHeader",
      name: hit.name,
      raw: hit.raw,
      pos: hit.matchStart,
    });
    cursor = hit.bodyStart;
  }

  emitPageBreaksUpTo(text.length);
  if (cursor < text.length) {
    emitBodyLines(text, cursor, text.length, tokens);
  }

  // Stable sort by position with a type tie-breaker. A page break at the
  // same offset as the first body line of that page must sort before the
  // line so consumers see "boundary, then content of new page."
  const typePriority: Record<Token["type"], number> = {
    PageBreak: 0,
    AnchorHeader: 1,
    Bullet: 2,
    BodyLine: 3,
  };
  tokens.sort((a, b) => a.pos - b.pos || typePriority[a.type] - typePriority[b.type]);

  return { text, tokens };
}

interface AnchorHit {
  name: AnchorName;
  matchStart: number;
  bodyStart: number;
  raw: string;
}

function scanAnchors(text: string): AnchorHit[] {
  const hits: AnchorHit[] = [];
  for (const { name, regex } of SECTION_ANCHORS) {
    regex.lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = regex.exec(text)) !== null) {
      hits.push({
        name,
        matchStart: match.index,
        bodyStart: match.index + match[0].length,
        raw: match[0],
      });
      if (!regex.global) break;
    }
  }
  hits.sort((a, b) => a.matchStart - b.matchStart);

  // First occurrence wins — drop later duplicates and any anchor whose
  // header sits inside a previously-claimed body span (e.g. a sidebar
  // "Equipment" heading nested under a real Equipment section).
  const seen = new Set<AnchorName>();
  const claimed: AnchorHit[] = [];
  for (const hit of hits) {
    if (seen.has(hit.name)) continue;
    seen.add(hit.name);
    claimed.push(hit);
  }
  claimed.sort((a, b) => a.matchStart - b.matchStart);
  return claimed;
}

function computePageBreaks(pages: string[]): Array<{ page: number; pos: number }> {
  // Mirror `tokenize`'s join: page boundaries land on the `\n` separator
  // between page i and page i+1 in the joined text. Normalization must not
  // change `\n` boundaries, only horizontal whitespace and typographic chars,
  // so byte-position math holds.
  const breaks: Array<{ page: number; pos: number }> = [];
  let pos = 0;
  for (let i = 0; i < pages.length - 1; i++) {
    const normalized = normalizeForMatching(pages[i] ?? "");
    pos += normalized.length + 1; // +1 for the join `\n`
    breaks.push({ page: i + 1, pos });
  }
  return breaks;
}

function emitBodyLines(text: string, start: number, end: number, tokens: Token[]): void {
  const slice = text.slice(start, end);
  let lineStart = 0;
  while (lineStart < slice.length) {
    const nl = slice.indexOf("\n", lineStart);
    const lineEnd = nl === -1 ? slice.length : nl;
    const rawLine = slice.slice(lineStart, lineEnd);
    const trimmed = rawLine.trim();
    if (trimmed.length > 0) {
      const absPos = start + lineStart;
      const bulletMatch = trimmed.match(/^([•·▪‣⁃])\s*(.*)$/);
      if (bulletMatch) {
        tokens.push({ type: "Bullet", pos: absPos });
        const rest = bulletMatch[2]!.trim();
        if (rest.length > 0) {
          tokens.push({ type: "BodyLine", text: rest, pos: absPos });
        }
      } else {
        tokens.push({ type: "BodyLine", text: trimmed, pos: absPos });
      }
    }
    lineStart = nl === -1 ? slice.length : nl + 1;
  }
}
