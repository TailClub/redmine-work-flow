const Path = require("node:path");
const inquirer = require("inquirer");
const { writeFileSync } = require("node:fs");
const envFilePath = Path.resolve(__dirname, ".env");

module.exports = [
  "init",
  "初始化配置",
  (yargs) => {
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
      let template = [];
      for (const key in answers) {
        if (Object.hasOwnProperty.call(answers, key)) {
          template.push(`${key}='${answers[key]}'`);
        }
      }
      writeFileSync(envFilePath, template.join("\n"), "utf-8");
    });
  },
];
