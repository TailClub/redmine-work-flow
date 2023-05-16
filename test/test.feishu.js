const dotenv = require("dotenv");
dotenv.config();
const lark = require("@larksuiteoapi/node-sdk");

const client = new lark.Client({
  appId: process.env.FEISHU_APPID,
  appSecret: process.env.FEISHU_SECRET,
  appType: lark.AppType.SelfBuild,
  domain: lark.Domain.Feishu,
  disableTokenCache: true,
});

let tenant_access_token;
const authResult = await client.auth.tenantAccessToken.internal({
  data: {
    app_id: process.env.FEISHU_APPID,
    app_secret: process.env.FEISHU_SECRET,
  },
});

tenant_access_token = authResult.tenant_access_token;

const recordResult = await client.bitable.appTableRecord.list(
  {
    params: {
      filter: 'OR(CurrentValue.[任务描述]="西游记找不同小游戏")',
    },
    path: {
      app_token: process.env.FEISHU_APPTOKEN,
      table_id: process.env.FEISHU_TABLEID,
    },
  },
  lark.withTenantToken(tenant_access_token)
);

console.log(JSON.stringify(recordResult, null, 2));
