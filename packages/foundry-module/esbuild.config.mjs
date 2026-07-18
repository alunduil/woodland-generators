// SPDX-FileCopyrightText: 2025-2026 Alex Brandt
//
// SPDX-License-Identifier: MIT

import { build, context } from "esbuild";

const config = {
  entryPoints: ["src/module.ts", "src/styles/module.css"],
  bundle: true,
  format: "esm",
  target: "es2022",
  platform: "browser",
  outdir: "dist",
  outbase: "src",
  sourcemap: true,
  logLevel: "info",
};

if (process.argv.includes("--watch")) {
  const ctx = await context(config);
  await ctx.watch();
  console.log("esbuild: watching for changes…");
} else {
  await build(config);
}
