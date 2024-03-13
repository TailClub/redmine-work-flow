const dotenv = require("dotenv");
dotenv.config();
const RedmineService = require("../src/service/redmine");

(async () => {
  const redmine = new RedmineService();
  const status = { close: 1, open: 2 };
  // await redmine.getVersionByName("3.2");
  await redmine.archiveIssuesByVersion([23139, 23512, 23348], "3.2.2025-12-12");
  // await redmine.toggleIssueAndVersion("3.2.2023-11-09", status.close);
  // await redmine.toggleIssueAndVersion("3.2.2023-12-12", status.open);

  // const { issues } = await redmine.getIssues({
  //   fixed_version_id: 666,
  //   tracker_id: `${Tracker.requirement}|${Tracker.optimization}`,
  //   status_id: "open",
  // });
  // console.log(issues);

  // await redmine.getDeploymnetIssuesByVersion("3.2.2023-05-29");
})();
