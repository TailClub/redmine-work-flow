const { Redmine, Feishu } = require("./local.config.js");
// const _Users = {
//   // [user_name] : [redmine_user_id]
// };

// const Redmine = {
//   Users: _Users,
//   Project: 0, // project_id,
//   Assignee: 0, // redmine_asigned_to_user_id
//   Watchers: [], // redmine_watchers_id
//   Tracker: {
//     bug: 4,
//     requirement: 8,
//     optimization: 6,
//     function: 2,
//     deployment: 14,
//   },
// };

// const Feishu = {
//   Users: {
//     // [redmine_user_id] : [feishu_user_id]
//   },
// };

module.exports = {
  Redmine,
  Feishu,
};
