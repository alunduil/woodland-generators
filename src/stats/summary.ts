import percentile from "just-percentile";

/**
 * Statistical summary information for a numeric dataset
 */
export interface SummaryStats {
  /** Minimum value */
  min: number;
  /** First quartile (25th percentile) */
  q1: number;
  /** Median (50th percentile) */
  median: number;
  /** Third quartile (75th percentile) */
  q3: number;
  /** Maximum value */
  max: number;
  /** Number of observations */
  count: number;
}

/**
 * Calculate summary statistics for a numeric array
 * Returns the five-number summary (min, Q1, median, Q3, max) plus count
 *
 * @param values - Array of numeric values
 * @returns Summary statistics object
 */
export function summary(values: number[]): SummaryStats {
  if (values.length === 0) {
    return {
      min: 0,
      q1: 0,
      median: 0,
      q3: 0,
      max: 0,
      count: 0,
    };
  }

  const sorted = [...values].sort((a, b) => a - b);

  return {
    min: sorted[0]!,
    q1: percentile(sorted, 0.25),
    median: percentile(sorted, 0.5),
    q3: percentile(sorted, 0.75),
    max: sorted[sorted.length - 1]!,
    count: sorted.length,
  };
}
