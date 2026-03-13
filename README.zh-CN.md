# RepoArena

> 面向真实代码仓库的本地优先 AI coding agent 评测与回放工具。

[English README](./README.md)

RepoArena 可以让你在同一个真实仓库、同一组任务、同一套评估规则下运行 Claude Code、Codex、Cursor、Devin 以及开源 agent，并统一比较它们的成功率、耗时、成本、diff 和回放轨迹。

## 它能做什么

- 在同一个 task pack 上运行多个 coding agent
- 在隔离 workspace 中记录 trace 和文件改动
- 用统一检查评估结果
- 导出 JSON 和 HTML 报告
- 在 benchmark 开始前暴露环境和鉴权阻塞问题

## 当前状态

当前仓库已经包含一个可运行的原型，具备：
- 本地 `repoarena run` CLI
- 本地 `repoarena doctor` CLI
- 内置 demo adapters
- 可运行的 `codex` adapter
- 已接入的 `claude-code` 与 `cursor` adapters，并能正确记录鉴权失败
- 静态 HTML 与 JSON 报告输出

## 快速开始

```bash
pnpm install
pnpm demo
```

执行后会在 `.repoarena/runs/` 下生成带时间戳的 run 目录，并输出本地 `report.html`。

检查 adapter readiness：

```bash
pnpm doctor
```

只跑 Codex adapter：

```bash
pnpm demo:codex
```

跑完整本地 arena：

```bash
pnpm demo:arena
```

## 示例工作流

```bash
repoarena run \
  --repo . \
  --task examples/taskpacks/demo-repo-health.json \
  --agents codex,claude-code,cursor
```

然后去 `.repoarena/runs/` 中查看生成的报告。

## 设计原则

### 默认公平
每个 agent 都应该在同一个仓库快照、同一个 task 定义、同一套评估规则下运行。

### 面向真实仓库
benchmark 应该对真实维护者有意义，而不是只在 demo 里好看。

### 结果可回放
如果结果很反常，你应该能打开 trace，看到它为什么会这样。

### 诚实展示 readiness
如果 adapter 被鉴权或本地环境问题卡住，RepoArena 应该在比较开始前说清楚。

## 仓库结构

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
  overview.md
```

## 文档

- [项目概览](./docs/overview.md)

## 许可证

[MIT](./LICENSE)
