#!/usr/bin/env node
const dotenv = require("dotenv");
dotenv.config();
const Path = require("node:path");
const yargs = require("yargs/yargs");
const inquirer = require("inquirer");
const { writeFileSync } = require("node:fs");
const RedmineService = require("./service/redmine.js");
const FeiShuService = require("./service/feishu.js");

yargs(process.argv.slice(2))
  .scriptName("redmine")
  .usage("$0 <cmd> [args]")
  .command("init", "初始化配置", (yargs) => {
    const promptList = [
      "REDMINE_HOST",
      "REDMINE_APIKEY",
      "FEISHU_APPID",
      "FEISHU_SECRET",
      "FEISHU_APPTOKEN",
      "FEISHU_TABLEID",
      "FEISHU_VIEWID",
    ].map((name) => {
      return {
        name,
        type: "input",
        validate: (val) => !!val.length,
      };
    });

    inquirer.prompt(promptList).then((answers) => {
      const envFilePath = Path.resolve(__dirname, ".env");
      let template = [];
      for (const key in answers) {
        if (Object.hasOwnProperty.call(answers, key)) {
          template.push(`${key}='${answers[key]}'`);
        }
      }
      writeFileSync(envFilePath, template.join("\n"), "utf-8");
    });
  })
  .command(
    "a",
    "归档Issue到对应Target，并同步到飞书TASK！",
    (yargs) => {
      return yargs.options({
        issue: {
          alias: "i",
          describe: "Issue编号，多个以英文逗号分隔",
          demandOption: true,
        },
        target: {
          alias: "t",
          describe: "迁移的Target号",
          demandOption: true,
        },
      });
    },
    async (argv) => {
      const issues = argv.issue
        .toString()
        .split(",")
        .map((item) => Number(item.trim()))
        .filter((item) => !!item);
      await new RedmineService().archiveIssuesByVersion(issues, argv.target);
    }
  )
  .command(
    "o",
    "打开Target及下属Issue",
    (yargs) => {
      return yargs.option("target", {
        alias: "t",
        describe: "Issue编号，多个以英文逗号分隔",
        demandOption: true,
      });
    },
    async (argv) => {
      await new RedmineService().toggleIssueAndVersion(argv.target, 2);
    }
  )
  .command(
    "c",
    "关闭Target及下属Issue",
    (yargs) => {
      return yargs.option("target", {
        alias: "t",
        describe: "Issue编号，多个以英文逗号分隔",
        demandOption: true,
      });
    },
    async (argv) => {
      await new RedmineService().toggleIssueAndVersion(argv.target, 1);
    }
  )
  .command(
    "s",
    "同步需求到飞书任务管理看板",
    (yargs) => {
      return yargs.option("issue", {
        alias: "i",
        describe: "Issue编号(需求功能)，多个以英文逗号分隔",
        demandOption: true,
      });
    },
    async (argv) => {
      const issues = argv.issue
        .toString()
        .split(",")
        .map((item) => Number(item.trim()))
        .filter((item) => !!item);
      await new FeiShuService().syncTasks(issues);
    }
  )
  .help().argv;
