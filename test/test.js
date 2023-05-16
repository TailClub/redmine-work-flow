const FeiShuService = require("../service/feishu.js");
const RedmineService = require("../service/redmine.js");

const { issuesRecord } = await new RedmineService().getIssuesTreeAndRecord([
  19818, 19819, 19900,
]);
if (issuesRecord.length) {
  await new FeiShuService().syncTasks(issuesRecord);
}

console.log("Success");
