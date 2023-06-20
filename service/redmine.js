const Redmine = require("../lib/redmine.js");
const { formatChildren } = require("../lib/util.js");
const {
  Redmine: { Watchers, Assignee, Project, Tracker },
} = require("../lib/config.js");

module.exports = class RedmineService {
  /**
   * @type {Redmine}
   */
  redmine;

  assignee = Assignee;

  watchers = Watchers;

  project_id = Project;

  _isCloseAction = true;

  _issue_tracker_ids = `${Tracker.optimization}|${Tracker.requirement}|${Tracker.performance}|${Tracker.production}`;

  constructor() {
    this.redmine = new Redmine(process.env.REDMINE_HOST, {
      apiKey: process.env.REDMINE_APIKEY,
      format: "json",
    });
  }

  /**
   *
   * @param {Hapi.Params.IssueInfo} params
   */
  async createIssue(params = {}) {
    const data = await this.redmine.create_issue({ issue: params });
    return data;
  }

  /**
   *
   * @param {Hapi.Params.IssueList} params
   * @returns {{issues:Hapi.Data.Issue[]}}
   */
  async getIssues(params = {}) {
    const data = await this.redmine.issues({
      project_id: this.project_id,
      ...params,
    });
    return data;
  }

  /**
   *
   * @param {number} issue_id
   * @param {Hapi.Params.IssueInfo & { notes:string;private_notes:string; }} params
   */
  async updateIssue(issue_id, params = {}) {
    const data = await this.redmine.update_issue(issue_id, { issue: params });
    return data;
  }

  /**
   *
   * @returns {{versions:Hapi.Data.Version[]}}
   */
  async getVersions() {
    const data = await this.redmine.version_by_project_id(this.project_id);
    return data;
  }

  /**
   *
   * @param {number} version_id
   * @returns {Hapi.Data.Version}
   */
  async getVersionById(version_id) {
    const data = await this.redmine.version_by_id(version_id);
    return data;
  }

  /**
   *
   * @param {string} version_name
   * @returns {Hapi.Data.Version[]}
   */
  async getVersionByName(version_name) {
    const data = await this.getVersions(this.project_id);
    if (data.versions) {
      const result = data.versions.filter(
        (item) => item.name.trim() === version_name.trim()
      );
      return result;
    } else {
      return data;
    }
  }

  /**
   *
   * @param {Hapi.Params.Version} params
   * @returns {{version:Hapi.Data.Version}}
   */
  async createVersion(params = {}) {
    const data = await this.redmine.create_version(this.project_id, {
      version: params,
    });
    return data;
  }

  /**
   *
   * @param {number} version_id
   * @param {{version:Hapi.Data.Version}} params
   */
  async updateVersion(version_id, params = {}) {
    const data = await this.redmine.update_version(version_id, {
      version: params,
    });
    return data;
  }

  async deleteVersion() {
    // await this.redmine.delete_version
  }

  /**
   *
   * @param {string} version_name
   * @param {string} description
   * @returns {number}
   */
  async _setArchiveVersion(version_name, description) {
    let version_id;
    let [version] = await this.getVersionByName(version_name);
    const params = {
      name: version_name,
      description,
    };
    const data = version
      ? await this.updateVersion(version.id, params)
      : await this.createVersion(params);
    version_id = data ? data.version.id : version.id;
    return version_id;
  }

  /**
   *
   * @param {number} version_id
   * @param {string} description
   */
  async _setArchiveIssueByVersion(version_id, version_name, description) {
    const subject = `${version_name} 上线计划`;
    const { issues } = await this.getIssues({
      tracker_id: Tracker.plan,
      subject,
    });
    const params = {
      project_id: this.project_id,
      subject,
      tracker_id: Tracker.plan,
      description,
      fixed_version_id: version_id,
      assigned_to_id: this.assignee,
      watcher_user_ids: this.watchers,
    };

    issues.length
      ? await this.updateIssue(issues[0].id, params)
      : await this.createIssue(params);
  }

  async getIssuesTreeAndRecord(issue_ids) {
    // 遍历需求下的功能，生成ID树
    const issuesRecord = [];
    const issues = await Promise.all(
      issue_ids.map((id) =>
        this.redmine.get_issue_by_id(id, { include: "children,relations" })
      )
    );

    const issuesTree = issues.map((item, index) => {
      let _tree = [];
      issuesRecord.push({
        id: item.issue.id,
        title: `${index + 1}. #${item.issue.id} ${item.issue.subject}`,
        link: `${process.env.REDMINE_HOST}/issues/${item.issue.id}`,
        subject: item.issue.subject,
        executor: item.issue.custom_fields?.find((f) => f.id === 5).value,
      });
      formatChildren(_tree, item.issue, 0);
      return _tree;
    });
    return {
      issuesTree,
      issuesRecord,
    };
  }

  /**
   * 获取上线计划中包含的Issue
   * @param {string} version_name
   * @returns
   */
  async _getDeploymnetIssuesByVersion(version_name) {
    let [version] = await this.getVersionByName(version_name);
    if (version.id) {
      const { issues } = await this.getIssues({
        fixed_version_id: version.id,
        tracker_id: this._issue_tracker_ids,
      });
      const result = issues.map((item) => item.id);
      console.log("[PLAN][ISSUE_IDS]", result.join(","));
      return result;
    } else {
      console.log("[PLAN][NOTHING]");
      return "";
    }
  }

  /**
   *
   * @param {number[]} issue_ids [699]
   * @param {string} version_name
   * @param {boolean} increase 是否为新增
   * @returns
   */
  async archiveIssuesByVersion(issue_ids, version_name, increase) {
    if (increase) {
      console.log("[ARCHIVE][INCREASING][FROM]", issue_ids.join(","));
      const _list = await this._getDeploymnetIssuesByVersion(version_name);
      if (_list.length) {
        const _s = new Set(issue_ids.concat(_list));
        issue_ids = Array.from(_s);
      }
      console.log("[ARCHIVE][INCREASING][TO]", issue_ids.join(","));
    }

    // 遍历需求下的功能，生成ID树
    console.log("[ARCHIVE][GENERATING]");
    const { issuesTree, issuesRecord } = await this.getIssuesTreeAndRecord(
      issue_ids
    );

    if (issuesTree.length) {
      // console.log(JSON.stringify(issuesRecord, null, 2))
      // return 200

      // 生成版本内容
      const description = issuesRecord.map((item) => item.title).join(" \n");

      // 获取归档的版本ID
      console.log("[ARCHIVE][CHECKING]");
      const version_id = await this._setArchiveVersion(
        version_name,
        description
      );

      // 把所有issue顺序移动到version下
      await Promise.all(
        issuesTree.map(async (item) => {
          let i = item.length - 1;
          while (i >= 0) {
            await Promise.all(
              item[i].map(async (id) => {
                console.log(`[ARCHIVE][UPDAING][#${id}]`);
                return await this.updateIssue(id, {
                  fixed_version_id: version_id,
                });
              })
            );
            i--;
          }
        })
      );

      // 创建上线计划
      console.log(`[ARCHIVE][PLANING]`);
      await this._setArchiveIssueByVersion(
        version_id,
        version_name,
        description
      );

      console.log("[ARCHIVE][SUCCESS]");
    } else {
      console.log("[ARCHIVE][NOTHING]");
    }
  }

  /**
   *
   * @param {number} version_id
   */
  async _toggleIssuesByVersion(version_id, status) {
    const { issues: requirements } = await this.getIssues({
      fixed_version_id: version_id,
      tracker_id: this._issue_tracker_ids,
      status_id: this._isCloseAction ? "open" : "closed",
    });
    if (requirements.length) {
      const issues = await Promise.all(
        requirements.map((r) =>
          this.redmine.get_issue_by_id(r.id, { include: "children,relations" })
        )
      );

      const issuesTree = issues.map((item, index) => {
        let _tree = [];
        formatChildren(_tree, item.issue, 0);
        return _tree;
      });

      await Promise.all(
        issuesTree.map(async (item) => {
          if (this._isCloseAction) {
            let i = item.length - 1;
            while (i >= 0) {
              await Promise.all(
                item[i].map(async (id) => {
                  console.log(`[CLOSING] [ISSUE] #${id}`);
                  await this.updateIssue(id, { status_id: 5 });
                })
              );
              i--;
            }
          } else {
            let i = 0;
            let l = item.length;
            while (i < l) {
              await Promise.all(
                item[i].map(async (id) => {
                  console.log(`[OPENING] [ISSUE] #${id}`);
                  await this.updateIssue(id, { status_id: 1 });
                })
              );
              i++;
            }
          }
        })
      );
    }
  }

  /**
   *
   * @param {number} version_id
   */
  async _toggleOthersByVersion(version_id, status) {
    const { issues } = await this.getIssues({
      fixed_version_id: version_id,
      status_id: this._isCloseAction ? "open" : "closed",
    });
    if (issues.length) {
      await Promise.all(
        issues
          .map((i) => i.id)
          .map(async (id) => {
            console.log(
              `[${this._isCloseAction ? "CLOSING" : "OPENING"}] [OTHERS] #${id}`
            );
            await this.updateIssue(id, {
              status_id: this._isCloseAction ? 5 : 1,
            });
          })
      );
    }
  }

  /**
   *
   * @param {string} version_name
   * @param {number} status close:1 ; open:2
   */
  async toggleIssueAndVersion(version_name, status) {
    const [version] = await this.getVersionByName(version_name);
    this._isCloseAction = status === 1;
    if (version) {
      if (!this._isCloseAction) {
        await this.updateVersion(version.id, { status: "open" });
      }
      await this._toggleIssuesByVersion(version.id);
      await this._toggleOthersByVersion(version.id);
      if (this._isCloseAction) {
        await this.updateVersion(version.id, { status: "closed" });
      }
      console.log(`[${this._isCloseAction ? "CLOSE" : "OPEN"}][SUCCESS]`);
    }
  }
};
