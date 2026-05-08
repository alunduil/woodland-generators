#!/usr/bin/env node

import { Command, Option } from "commander";
import { root } from "@woodland-generators/core";
import packageJson from "../package.json";
import pino from "pino";

const program = new Command();

program
  .name("woodland-gen")
  .description("CLI tool for generating Root: The Tabletop RPG resources")
  .version(packageJson.version)
  .addOption(
    new Option("-l, --log-level <level>", "set log level")
      .choices(Object.keys(pino.levels.values))
      .default("warn"),
  );

// Set global log level based on the selected level before parsing commands
program.hook("preAction", (thisCommand) => {
  const opts = thisCommand.optsWithGlobals();
  const logLevel = opts.logLevel;
  if (logLevel in pino.levels.values) {
    root.level = logLevel;
  }
});

// Handle unhandled promise rejections (Node.js default behavior is poor for CLI tools)
process.on("unhandledRejection", (reason) => {
  console.error("Error:", reason instanceof Error ? reason.message : String(reason));
  process.exit(1);
});

program.parse();
