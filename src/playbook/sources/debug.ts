/**
 * Debug formatting utilities for PlaybookSource implementations
 */

import chalk from "chalk";
import Graphemer from "graphemer";
import { root } from "../../logging";

// Global grapheme splitter for consistent Unicode handling
const graphemer = new Graphemer();

/**
 * Default radius for context window extraction in createPositionHighlight
 * This determines how many characters to show before and after the target position
 */
export const DEFAULT_WINDOW_RADIUS = 50;

/**
 * Normalize whitespace in text for consistent processing
 * Replaces all whitespace sequences with single spaces and trims leading/trailing whitespace
 */
export function normalizeWhitespace(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

/**
 * Create a debug-friendly text preview showing start and end of content
 * For short text, returns the full content. For long text, returns first and last
 * portions separated by "..." with total grapheme count of (sampleSize * 2 + 3).
 */
export function createTextPreview(text: string, sampleSize = 50): string {
  const clean = normalizeWhitespace(text);

  // If text is short enough, return it in full (using visual grapheme count)
  if (graphemer.countGraphemes(clean) <= sampleSize * 2) {
    return clean;
  }

  // For long text, show start...end sample using visual graphemes
  const graphemes = graphemer.splitGraphemes(clean);
  const start = graphemes.slice(0, sampleSize).join("");
  const end = graphemes.slice(-sampleSize).join("");

  return `${start}...${end}`;
}

/**
 * Create visual highlighting showing position in document context with colors
 * Useful for debugging text parsing and delimiter detection
 *
 * @param text - The complete text being analyzed
 * @param position - The grapheme position to highlight (0-based index)
 * @param description - A human-readable description of what was found at this position (e.g., "delimiter", "section boundary", "Choose Your Nature")
 * @returns Multi-line string with context info, highlighted text window, and position pointer
 */
export function createPositionHighlight(
  text: string,
  position: number,
  description: string,
): string {
  // Convert to graphemes for consistent Unicode handling
  const graphemes = graphemer.splitGraphemes(text);
  const graphemeCount = graphemes.length;

  // Validate position bounds using grapheme count
  if (position < 0 || (graphemeCount > 0 && position >= graphemeCount)) {
    root.warn({
      position,
      graphemeCount,
      description,
      function: "createPositionHighlight",
      msg: "Position is out of bounds",
    });
  }

  // Create window around target grapheme position (visual units)
  const windowStart = Math.max(0, position - DEFAULT_WINDOW_RADIUS);
  const windowEnd = Math.min(graphemeCount, position + DEFAULT_WINDOW_RADIUS);

  const windowGraphemes = graphemes.slice(windowStart, windowEnd);

  // Calculate marker position in visual terms
  const markerGraphemePos = position - windowStart;
  const beforeGraphemes = windowGraphemes.slice(0, markerGraphemePos);
  const targetGrapheme = windowGraphemes[markerGraphemePos]; // Preserve the target character
  const afterGraphemes = windowGraphemes.slice(markerGraphemePos + 1);

  const beforeText = beforeGraphemes.join("").replace(/\n/g, chalk.dim("⏎"));
  const targetText = targetGrapheme ? targetGrapheme.replace(/\n/g, chalk.dim("⏎")) : "";
  const afterText = afterGraphemes.join("").replace(/\n/g, chalk.dim("⏎"));

  // Add ellipsis if truncated
  const prefix = windowStart > 0 ? chalk.dim("...") : "";
  const suffix = windowEnd < graphemeCount ? chalk.dim("...") : "";

  // Create the highlighted context - use bracket highlighting for consistent cross-platform behavior
  const highlightedTargetText = targetText ? `[${targetText}]` : "";
  const highlighted = `${prefix}${beforeText}${highlightedTargetText}${afterText}${suffix}`;

  // Create position indicator line (aligned with the highlighted character position)
  // eslint-disable-next-line no-control-regex
  const cleanBeforeText = beforeText.replace(/\u001b\[[0-9;]*m/g, "");
  // Prefix is either empty string or "..." (3 characters) with ANSI styling
  const prefixLength = prefix ? 3 : 0;
  // Add 1 to account for the opening bracket, so the caret points to the character inside
  const pointerPosition =
    prefixLength + graphemer.countGraphemes(cleanBeforeText) + (targetText ? 1 : 0);
  const pointer = " ".repeat(pointerPosition) + chalk.green(`^ pos:${position}`);

  // Add context info
  const info = chalk.cyan(`Context: "${description}" found at character ${position}`);

  return `\n${info}\n${highlighted}\n${pointer}`;
}
