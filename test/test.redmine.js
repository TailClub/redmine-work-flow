const dotenv = require("dotenv");
dotenv.config();
const RedmineService = require("../service/redmine.js");
const {
  Redmine: { Watchers, Assignee, Project, Tracker },
} = require("../lib/config.js");

(async () => {
  const redmine = new RedmineService();
  const status = { close: 1, open: 2 };
  // await redmine.archiveIssuesByVersion([19818, 19819], "3.2.2023-12-12");
  // await redmine.toggleIssueAndVersion("3.2.2023-12-12", status.close);
  // await redmine.toggleIssueAndVersion("3.2.2023-12-12", status.open);

  // const { issues } = await redmine.getIssues({
  //   fixed_version_id: 666,
  //   tracker_id: `${Tracker.requirement}|${Tracker.optimization}`,
  //   status_id: "open",
  // });
  // console.log(issues);

  await redmine.getDeploymnetIssuesByVersion("3.2.2023-05-29");
})();
