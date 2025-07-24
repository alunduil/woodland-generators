#!/usr/bin/env node

import { Command } from "commander";
import { createCharacterCommand } from "./cli/commands/character";
import packageJson from "../package.json";

const program = new Command();

program
  .name("woodland-gen")
  .description("CLI tool for generating Root: The Tabletop RPG resources")
  .version(packageJson.version);

program.addCommand(createCharacterCommand());

program.parse();
