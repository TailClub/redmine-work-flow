const dotenv = require("dotenv");
dotenv.config();
const RedmineService = require("../service/redmine.js");

(async () => {
  const redmine = new RedmineService();
  const status = { close: 1, open: 2 };
  // await redmine.archiveIssuesByVersion([19818, 19819], "3.2.2023-12-12");
  // await redmine.toggleIssueAndVersion("3.2.2023-12-12", status.close);
  await redmine.toggleIssueAndVersion("3.2.2023-12-12", status.open);
})();
