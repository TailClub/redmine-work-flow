const RedmineService = require("../service/redmine.js");
module.exports = [
  "c",
  "关闭Target及下属Issue",
  (yargs) => {
    return yargs.options({
      target: {
        alias: "t",
        describe: "版本号",
      },
      issue: {
        alias: "i",
        describe: "Issue编号，多个以英文逗号分隔",
      },
    });
  },
  async (argv) => {
    if (argv.target) {
      await new RedmineService().toggleIssueAndVersion(
        argv.target.toString(),
        1
      );
    }

    if (argv.issue) {
      const issues = argv.issue
        .toString()
        .split(",")
        .map((item) => Number(item.trim()))
        .filter((item) => !!item);
      await new RedmineService().toggleIssues(issues, 1);
    }
  },
];
