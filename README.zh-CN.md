# RepoArena

> 面向真实代码仓库的本地优先 AI coding agent 评测与回放工具。

[English README](./README.md)

RepoArena 可以让你在同一个仓库、同一组任务、同一套 judge 规则下运行多个 coding agent，并统一比较它们的成功率、耗时、token、成本、改动文件和回放结果。

## 当前能力

- 本地 `repoarena run`、`repoarena doctor`、`repoarena list-adapters`、`repoarena init-taskpack`、`repoarena init-ci` CLI
- demo adapters，加上 `codex`、`claude-code`、`cursor` 真实 CLI adapter
- adapter capability matrix 与 preflight
- JSON / YAML task pack
- command、file、glob、snapshot、json judge
- `summary.json`、`summary.md`、`pr-comment.md`、`report.html`、`badge.json`
- 可交互的 `apps/web-report`
- GitHub Actions smoke benchmark 和 PR comment

## 快速开始

```bash
pnpm install
pnpm demo
```

检查 adapter readiness：

```bash
pnpm doctor
```

生成 starter task pack：

```bash
node packages/cli/dist/index.js init-taskpack --template repo-health --output repoarena.taskpack.yaml
```

生成 GitHub Actions benchmark workflow：

```bash
node packages/cli/dist/index.js init-ci --task repoarena.taskpack.yaml --agents demo-fast,codex
```

返回机器可读的 benchmark 结果：

```bash
node packages/cli/dist/index.js run --repo . --task repoarena.taskpack.yaml --agents demo-fast --json
```

## 官方任务库

位于 [examples/taskpacks/official](./examples/taskpacks/official/README.md)，当前包含：

- `repo-health.yaml`
- `failing-test-fix.yaml`
- `snapshot-fix.yaml`
- `config-repair.yaml`
- `small-refactor.yaml`
- `json-contract-repair.yaml`

## 文档

- [项目概览](./docs/overview.md)
- [评测公平性](./docs/fairness.md)
- [Adapter 能力矩阵](./docs/adapter-capabilities.md)
- [Web Report 说明](./apps/web-report/README.md)

## 许可证

[MIT](./LICENSE)
