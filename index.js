#!/usr/bin/env node
const dotenv = require("dotenv");
const Path = require("node:path");
const fs = require("node:fs");
const yargs = require("yargs/yargs");

const envFilePath = Path.resolve(__dirname, ".env");
dotenv.config({ path: envFilePath });

const commandPath = Path.resolve(__dirname, "src/command");

const myYargs = yargs(process.argv.slice(2))
  .scriptName("redmine")
  .usage("$0 <cmd> [args]");

fs.readdirSync(commandPath)
  .filter((file) => file.endsWith(".js"))
  .forEach((file) => {
    const path = Path.resolve(commandPath, file);
    const command = require(path);
    myYargs.command(...command);
  });

myYargs.help().argv;
