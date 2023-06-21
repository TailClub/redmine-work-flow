const lark = require("@larksuiteoapi/node-sdk");
const { Feishu, Redmine } = require("../lib/config.js");
const RedmineService = require("./redmine.js");

module.exports = class FeiShuService {
  client;
  tenant_access_token;
  constructor() {
    this.client = new lark.Client({
      appId: process.env.FEISHU_APPID,
      appSecret: process.env.FEISHU_SECRET,
      appType: lark.AppType.SelfBuild,
      domain: lark.Domain.Feishu,
      disableTokenCache: true,
    });
  }

  async getAuthTenantAccessToken() {
    const { tenant_access_token } =
      await this.client.auth.tenantAccessToken.internal({
        data: {
          app_id: process.env.FEISHU_APPID,
          app_secret: process.env.FEISHU_SECRET,
        },
      });
    this.tenant_access_token = tenant_access_token;
  }

  async getRecords(issuesRecord) {
    const filter = `OR(${issuesRecord
      .map((item) => `CurrentValue.[任务描述]="${item.subject}"`)
      .join(",")})`;

    const recordResult = await this.client.bitable.appTableRecord.list(
      {
        params: { filter },
        path: {
          app_token: process.env.FEISHU_APPTOKEN,
          table_id: process.env.FEISHU_TABLEID,
        },
      },
      lark.withTenantToken(this.tenant_access_token)
    );

    let result = [];
    if (recordResult.data.total) {
      // 过滤飞书已经存在的任务
      result = issuesRecord.filter(
        (issue) =>
          recordResult.data.items.findIndex(
            (r) => r.fields["任务描述"].text === issue.subject
          ) < 0
      );
    } else {
      result = issuesRecord;
    }
    return result;
  }

  async createRecords(issuesRecord) {
    let records = issuesRecord.map((item) => {
      console.log(`[FEISHU][CREATING][#${item.id}]`);
      return {
        fields: {
          任务描述: {
            text: item.subject,
            link: item.link,
          },
          任务执行人: item.executor
            ? item.executor.map((id) => {
                return { id: Feishu.Users[id] };
              })
            : [{ id: Feishu.Users.default }],
          进展: "待开始",
          重要紧急程度: "重要不紧急",
        },
      };
    });

    await this.client.bitable.appTableRecord.batchCreate(
      {
        data: {
          records,
        },
        path: {
          app_token: process.env.FEISHU_APPTOKEN,
          table_id: process.env.FEISHU_TABLEID,
        },
      },
      lark.withTenantToken(this.tenant_access_token)
    );
  }

  async syncTasks(issues) {
    console.log("[FEISHU][AUTHING]");
    await this.getAuthTenantAccessToken();
    console.log("[FEISHU][CHECKING]");
    const { issuesRecord } = await new RedmineService().getIssuesTreeAndRecord(
      issues
    );
    const records = await this.getRecords(issuesRecord);
    if (records.length) {
      await this.createRecords(records);
    }
    console.log("[FEISHU][SUCCESS]");
  }
};
