// Output format types
export type OutputFormat = "json";

export const FORMATS: readonly OutputFormat[] = ["json"] as const;

// Default format - single source of truth
export const DEFAULT: OutputFormat = "json";

export type FormatterFunction = (data: unknown) => string;

// Individual formatter functions
export const asJson: FormatterFunction = (data) => JSON.stringify(data, null, 2);

// Format registry with type safety
export const FORMATTERS: Record<OutputFormat, FormatterFunction> = {
  json: asJson,
} as const;

// Format-to-formatter lookup
export function getFormatter(format: OutputFormat): FormatterFunction {
  return FORMATTERS[format];
}

// Convenience method - apply formatter (no validation needed - Commander handles it)
export function run(format: OutputFormat, data: unknown): string {
  const formatter = getFormatter(format);
  return formatter(data);
}
