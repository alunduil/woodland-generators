#!/usr/bin/env node

import { Command, Option } from "commander";
import { root } from "@woodland-generators/core";
import packageJson from "../package.json";
import pino from "pino";
import { createNameCommand } from "./commands/name";

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

program.hook("preAction", (thisCommand) => {
  const opts = thisCommand.optsWithGlobals();
  const logLevel = opts.logLevel;
  if (logLevel in pino.levels.values) {
    root.level = logLevel;
  }
});

program.addCommand(createNameCommand());

process.on("unhandledRejection", (reason) => {
  console.error("Error:", reason instanceof Error ? reason.message : String(reason));
  process.exit(1);
});

program.parse();
