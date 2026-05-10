import { build, context } from "esbuild";

const config = {
  entryPoints: ["src/module.ts"],
  bundle: true,
  format: "esm",
  target: "es2022",
  platform: "browser",
  outfile: "dist/module.js",
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
