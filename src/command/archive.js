const RedmineService = require("../service/redmine.js");

module.exports = [
  "a",
  "归档Issue到对应Target",
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
      increase: {
        alias: "n",
        describe: "是否为新增",
        demandOption: false,
      },
    });
  },
  async (argv) => {
    const issues = argv.issue
      .toString()
      .split(",")
      .map((item) => Number(item.trim()))
      .filter((item) => !!item);
    await new RedmineService().archiveIssuesByVersion(
      issues,
      argv.target,
      argv.increase
    );
  },
];
