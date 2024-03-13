const FeiShuService = require("../service/feishu.js");

module.exports = [
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
  },
];
