/**
 * Benchmark tests for debug utility functions using jest-bench
 * Run with: npm run benchmark
 */

import { benchmarkSuite } from "jest-bench";
import { createTextPreview, createPositionHighlight } from "../../../src/playbook/sources/debug";

benchmarkSuite("createTextPreview - Input length scaling (maxLength=50)", {
  ["100 chars"]: () => {
    createTextPreview("a".repeat(100), 50);
  },

  ["1,000 chars"]: () => {
    createTextPreview("a".repeat(1000), 50);
  },

  ["10,000 chars"]: () => {
    createTextPreview("a".repeat(10000), 50);
  },

  ["100,000 chars"]: () => {
    createTextPreview("a".repeat(100000), 50);
  },
});

benchmarkSuite("createTextPreview - maxLength scaling (input=10,000 chars)", {
  ["maxLength=10"]: () => {
    createTextPreview("a".repeat(10000), 10);
  },

  ["maxLength=50"]: () => {
    createTextPreview("a".repeat(10000), 50);
  },

  ["maxLength=100"]: () => {
    createTextPreview("a".repeat(10000), 100);
  },

  ["maxLength=500"]: () => {
    createTextPreview("a".repeat(10000), 500);
  },

  ["maxLength=1000"]: () => {
    createTextPreview("a".repeat(10000), 1000);
  },
});

benchmarkSuite("createTextPreview - Edge cases", {
  ["Empty string"]: () => {
    createTextPreview("", 50);
  },

  ["maxLength > input length"]: () => {
    createTextPreview("short", 1000);
  },

  ["maxLength = 0"]: () => {
    createTextPreview("a".repeat(1000), 0);
  },

  ["Very long maxLength"]: () => {
    createTextPreview("a".repeat(1000), 10000);
  },
});

benchmarkSuite("createPositionHighlight - Input length scaling", {
  ["100 chars"]: () => {
    const input = "a".repeat(100);
    createPositionHighlight(input, Math.floor(input.length / 2), "test");
  },

  ["1,000 chars"]: () => {
    const input = "a".repeat(1000);
    createPositionHighlight(input, Math.floor(input.length / 2), "test");
  },

  ["10,000 chars"]: () => {
    const input = "a".repeat(10000);
    createPositionHighlight(input, Math.floor(input.length / 2), "test");
  },

  ["100,000 chars"]: () => {
    const input = "a".repeat(100000);
    createPositionHighlight(input, Math.floor(input.length / 2), "test");
  },
});

benchmarkSuite("createPositionHighlight - Position scaling (input=10,000 chars)", {
  ["Position at start (0)"]: () => {
    const input = "a".repeat(10000);
    createPositionHighlight(input, 0, "test");
  },

  ["Position at 25%"]: () => {
    const input = "a".repeat(10000);
    createPositionHighlight(input, Math.floor(input.length * 0.25), "test");
  },

  ["Position at 50%"]: () => {
    const input = "a".repeat(10000);
    createPositionHighlight(input, Math.floor(input.length * 0.5), "test");
  },

  ["Position at 75%"]: () => {
    const input = "a".repeat(10000);
    createPositionHighlight(input, Math.floor(input.length * 0.75), "test");
  },

  ["Position at end"]: () => {
    const input = "a".repeat(10000);
    createPositionHighlight(input, input.length - 1, "test");
  },
});

benchmarkSuite("createPositionHighlight - Content type variations", {
  ["All newlines"]: () => {
    createPositionHighlight("\n".repeat(1000), 500, "newlines");
  },

  ["Mixed with newlines"]: () => {
    createPositionHighlight("line1\nline2\nline3\nline4\nline5".repeat(200), 500, "mixed");
  },

  ["No newlines"]: () => {
    createPositionHighlight("a".repeat(1000), 500, "plain");
  },

  ["Empty string"]: () => {
    createPositionHighlight("", 0, "empty");
  },
});
