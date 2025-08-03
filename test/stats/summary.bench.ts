/**
 * Benchmark tests for summary statistics performance
 * Run with: npm run benchmark
 */

import { benchmarkSuite } from "jest-bench";
import { summary } from "../../src/stats/summary";

benchmarkSuite("summary - Array size scaling", {
  ["100 elements"]: () => {
    const data = Array.from({ length: 100 }, (_, i) => i);
    summary(data);
  },

  ["1,000 elements"]: () => {
    const data = Array.from({ length: 1000 }, (_, i) => i);
    summary(data);
  },

  ["10,000 elements"]: () => {
    const data = Array.from({ length: 10000 }, (_, i) => i);
    summary(data);
  },

  ["100,000 elements"]: () => {
    const data = Array.from({ length: 100000 }, (_, i) => i);
    summary(data);
  },
});

benchmarkSuite("summary - Data distribution patterns", {
  ["Sequential data (1000 elements)"]: () => {
    const data = Array.from({ length: 1000 }, (_, i) => i);
    summary(data);
  },

  ["Random data (1000 elements)"]: () => {
    const data = Array.from({ length: 1000 }, () => Math.random() * 1000);
    summary(data);
  },

  ["Duplicate-heavy data (1000 elements)"]: () => {
    const data = Array.from({ length: 1000 }, (_, i) => Math.floor(i / 10));
    summary(data);
  },

  ["Normal distribution (1000 elements)"]: () => {
    const data = Array.from({ length: 1000 }, () => {
      // Box-Muller transform for normal distribution
      const u1 = Math.random();
      const u2 = Math.random();
      return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    });
    summary(data);
  },
});

benchmarkSuite("summary - Edge cases performance", {
  ["All identical values (1000 elements)"]: () => {
    const data = Array.from({ length: 1000 }, () => 42);
    summary(data);
  },

  ["Reverse sorted (1000 elements)"]: () => {
    const data = Array.from({ length: 1000 }, (_, i) => 1000 - i);
    summary(data);
  },

  ["Floating point precision (1000 elements)"]: () => {
    const data = Array.from({ length: 1000 }, (_, i) => i * 0.001);
    summary(data);
  },
});
