# RepoArena

> 面向真实代码仓库的本地优先 AI coding agent 对战与评测平台。

[English README](./README.md)

RepoArena 可以让你在同一个真实仓库、同一组任务、同一套评估规则下运行 Claude Code、Codex、Cursor、Devin 以及开源 agent，并统一比较它们的成功率、耗时、成本、diff 和回放轨迹。

## 当前版本

当前仓库已经有一个可运行的第一版纵向切片，包含：
- 本地 `repoarena run` CLI
- 本地 `repoarena doctor` CLI
- 仓库复制与隔离 workspace
- 内置 demo adapters
- 可运行的 `codex` 外部 adapter
- 已接入的 `claude-code` 外部 adapter，并能正确记录鉴权失败
- 已接入的 `cursor` 外部 adapter，并通过 Cursor 内置 CLI 桥接
- success-command judges
- 文件 diff 检测
- JSON 和 HTML 报告输出

本地试跑：

```bash
pnpm install
pnpm demo
```

执行后会在 `.repoarena/runs/` 下生成带时间戳的 run 目录，并输出可分享的 `report.html`。

检查 adapter readiness：

```bash
pnpm doctor
```

只跑真实 Codex adapter：

```bash
pnpm demo:codex
```

跑完整本地 arena：

```bash
pnpm demo:arena
```

说明：
- `claude-code` adapter 已接入，但依赖你本机的 Claude Code 鉴权状态。
- `cursor` adapter 也已接入。在这台机器上它走的是 Cursor 内置的 `claude-agent-sdk` CLI，而不是公开的 `cursor agent` 命令，同样依赖本地鉴权状态。

## 这个项目解决什么问题

大家都在争论哪个 coding agent “最好”。
但大多数团队并没有一个真正公平、能在自己仓库里复现的比较方式。

RepoArena 的定位不是再造一个 agent，而是做所有 agent 的：
- 裁判
- 飞行记录仪
- 可回放 benchmark 层

## 你能得到什么

- 在同一个 task pack 上运行多个 coding agent
- 记录 agent 每一步做了什么
- 用测试、lint、diff、成本统一评估结果
- 导出本地 HTML 报告用于分享
- 自己扩展 adapters、judges 和 task packs

## 计划中的工作流

```bash
repoarena run \
  --repo . \
  --task examples/taskpacks/demo-repo-health.json \
  --agents codex,claude-code,cursor
```

然后去 `.repoarena/runs/` 里查看生成的报告。

## MVP 范围

第一版聚焦一件事：

在真实仓库里，对多个 coding agents 做公平的本地 benchmark，并生成可回放的报告。

### V0 已包含
- 本地 CLI runner
- 每次 run 的隔离 workspace
- adapter 接口和内置 demo adapters
- task pack 格式
- judge 机制
- JSON + HTML 报告输出
- token / cost 记录
- adapter preflight 检查

### V0 不做
- 纯云端托管执行
- 企业治理与权限体系
- 巨大的合成 benchmark 数据集
- 再做一个通用 coding agent

## 项目结构

```text
apps/
  web-report/
packages/
  cli/
  core/
  runner/
  adapters/
  judges/
  taskpacks/
  trace/
  report/
docs/
  founder-blueprint.md
```

## 设计原则

### 默认公平
每个 agent 都应该在同一个 repo snapshot、同一个 task 定义、同一套评估规则下运行。

### 优先真实仓库
benchmark 应该对真实维护者有意义，而不是只在 demo 里好看。

### 回放比口号重要
如果结果很反常，你应该能点开 trace，看到它到底为什么这样。

### 本地优先
最有价值的工作流，是直接在你自己的仓库里做 benchmark，而不是把源码交给第三方平台。

### 先诊断，再比较
如果 adapter 被鉴权、缺失二进制或本地环境问题卡住，RepoArena 应该在 benchmark 开始前就讲清楚。

## 可扩展性

RepoArena 天然适合社区扩展：
- 新 agent adapter
- 新 task pack
- 新 judge
- 公开 benchmark 套件
- 报告主题和 UI 视图

## 当前状态

这个仓库已经不是纯文档阶段，而是“可运行的基础版”。
项目定位、MVP 边界和架构思路在 [docs/founder-blueprint.md](/D:/project/AgentArena/docs/founder-blueprint.md)。

## 为什么它有机会

agent infra 里最值得做的，未必是下一个 agent。
也可能是所有团队都要用来判断“哪个 agent 值得信”的那一层。

RepoArena 就是朝这个方向做的。
