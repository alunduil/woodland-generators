#!/usr/bin/env node

/**
 * Process jest-bench NDJSON output into benchmarkjs text format
 *
 * Converts from NDJSON format (multiple JSON objects per line) to
 * the text format expected by benchmark-action/github-action-benchmark
 * with tool "benchmarkjs".
 *
 * Expected benchmarkjs format:
 * fib(20) x 11,465 ops/sec ±1.12% (91 runs sampled)
 */

import { readFileSync, writeFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface BenchmarkStats {
  rme: number;
  sample: number[];
}

interface BenchmarkData {
  stats: BenchmarkStats;
  hz: number;
}

type BenchmarkSuite = Map<string, BenchmarkData>;

interface BenchmarkResult {
  [suiteName: string]: BenchmarkSuite;
}

function processBenchmarkResults(): void {
  const inputFile = join(__dirname, "../benchmarks/result.txt");
  const outputFile = join(__dirname, "../benchmarks/result-benchmarkjs.txt");

  if (!existsSync(inputFile)) {
    console.error("Input file not found:", inputFile);
    process.exit(1);
  }

  const content = readFileSync(inputFile, "utf8");
  const lines = content
    .trim()
    .split("\n")
    .filter((line) => line.trim());

  const results: string[] = [];

  for (const line of lines) {
    try {
      const data = JSON.parse(line) as BenchmarkResult;

      // Process each suite in the JSON object
      for (const [suiteName, benchmarks] of Object.entries(data)) {
        for (const [benchmarkName, benchmarkData] of benchmarks) {
          const { stats, hz } = benchmarkData;

          // Format: "suiteName - benchmarkName x {ops/sec} ops/sec ±{rme}% ({samples} runs sampled)"
          const name = `${suiteName} - ${benchmarkName}`;
          const opsPerSec = Math.round(hz).toLocaleString();
          const rme = stats.rme.toFixed(2);
          const samples = stats.sample.length;

          const formattedLine = `${name} x ${opsPerSec} ops/sec ±${rme}% (${samples} runs sampled)`;
          results.push(formattedLine);
        }
      }
    } catch (error) {
      console.error("Error parsing line:", line);
      console.error("Error:", error instanceof Error ? error.message : String(error));
    }
  }

  // Write the results in benchmarkjs format
  writeFileSync(outputFile, results.join("\n") + "\n");

  console.log(`Processed ${results.length} benchmark results`);
  console.log(`Output written to: ${outputFile}`);

  // Log sample of results for verification
  if (results.length > 0) {
    console.log("\nSample results:");
    results.slice(0, 3).forEach((result) => {
      console.log(`- ${result}`);
    });
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  processBenchmarkResults();
}

export { processBenchmarkResults };
