/**
 * Typed errors for playbook source parsing failures.
 *
 * Stage-tagged errors let CLI users include the failing stage in bug
 * reports so maintainers can triage without re-running the user's
 * input.
 */

export type PdfParseStage = "read" | "parse" | "split" | "archetype-extract" | "section-parse";

export const PDF_PARSE_STAGES: readonly PdfParseStage[] = [
  "read",
  "parse",
  "split",
  "archetype-extract",
  "section-parse",
] as const;

export class PdfParseError extends Error {
  readonly stage: PdfParseStage;
  readonly path: string;

  constructor(stage: PdfParseStage, path: string, message: string, options?: { cause?: unknown }) {
    super(`[${stage}] ${path}: ${message}`, options);
    this.name = "PdfParseError";
    this.stage = stage;
    this.path = path;
  }
}

/**
 * Wrap an unknown error in a PdfParseError tagged with the given stage.
 * Already-tagged PdfParseErrors are returned unchanged so the original
 * stage propagates outward.
 */
export function asPdfParseError(
  stage: PdfParseStage,
  path: string,
  error: unknown,
  contextPrefix?: string,
): PdfParseError {
  if (error instanceof PdfParseError) {
    return error;
  }
  const baseMessage = error instanceof Error ? error.message : String(error);
  const message = contextPrefix ? `${contextPrefix}: ${baseMessage}` : baseMessage;
  return new PdfParseError(stage, path, message, { cause: error });
}
