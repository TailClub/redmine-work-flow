# redmine-work-flow

## 使用方法

1. 方式一：npm link 则可使用 redmine 全局命令
2. 方式二：node index.js [cmd]

## 命令

```
  redmine init         初始化配置
  redmine archive | a  归档Issue到对应Target，并同步到飞书TASK！
  redmine open | o     打开Target及下属Issue
  redmine close | c    关闭Target及下属Issue
```

## 首次使用

1. 执行 `redmine init` 录入配置信息
2. 修改 `lib/config.js` 人员信息（暂未想到优雅的录入方案，欢迎指教）

## Demo

```shell
// 关闭版本3.2.2023-12-12及下属问题
redmine c -t 3.2.2023-12-12

// 开启版本3.2.2023-12-12及下属问题
redmine o -t 3.2.2023-12-12

// 创建版本3.2.2023-12-12，归档相关需求，创建上线计划，
redmine a -i  -t 3.2.2023-12-12

// 同步需求功能到飞书任务管理看板
redmine s -i 19818,19819,19900

```
