const RedmineService = require("../service/redmine.js");

module.exports = [
  "o",
  "打开Target及下属Issue",
  (yargs) => {
    return yargs.options({
      target: {
        alias: "t",
        describe: "Issue编号，多个以英文逗号分隔",
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
        2
      );
    }

    if (argv.issue) {
      const issues = argv.issue
        .toString()
        .split(",")
        .map((item) => Number(item.trim()))
        .filter((item) => !!item);
      await new RedmineService().toggleIssues(issues, 2);
    }
  },
];
