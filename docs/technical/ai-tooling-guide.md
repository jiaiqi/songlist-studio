# AI 工具接入指南

本项目为不同 AI 编程工具之间的接力做了准备，包括 Codex、Claude Code、OpenCode/OpenClaw 系代理、Cursor、Windsurf 以及其他类似的本地编程助手。

## 通用入口文件

以下文件作为交接表面使用：

- `AGENTS.md`：通用编程代理指令。
- `CLAUDE.md`：Claude Code 专用指针文件。
- `docs/technical/ai-handoff.md`：当前项目实现的详细说明。
- `docs/product/project-status-roadmap.md`：已完成工作、路线图、待定决策。
- `docs/product/songlist-studio-prd.md`：产品需求文档。

## 工具相关说明

### Claude Code

Claude Code 通常会读取 `CLAUDE.md`。

预期流程：

1. 阅读 `CLAUDE.md`。
2. 跟随其指针阅读 `AGENTS.md`。
3. 通过 `docs/technical/ai-handoff.md` 获取当前实现上下文。

### Codex / OpenAI 系编码代理

Codex 风格的代理应先阅读 `AGENTS.md`。

预期流程：

1. 阅读 `AGENTS.md`。
2. 执行 `git status --short`。
3. 检查相关文件。
4. 实施聚焦的改动。
5. 运行 `npm run check` 和 `npm run build`。
6. 用聚焦的 commit message 提交。

### OpenCode / OpenClaw 风格代理

如果工具支持仓库级指令文件，请指向：

- `AGENTS.md`
- `docs/technical/ai-handoff.md`

如果工具需要项目简介，可使用以下文案：

> SongList Studio 是一个本地优先的 React/TypeScript/Vite 应用，面向音乐主播，用于管理自己会唱的歌曲、生成分类歌单、编辑并导出歌单图片、管理历史歌单，并记录观众要求学的歌曲。

### Cursor / Windsurf / 其他 IDE 代理

如果工具不会自动读取 `AGENTS.md`，请粘贴或附加以下文件：

1. `AGENTS.md`
2. `docs/technical/ai-handoff.md`
3. `docs/product/project-status-roadmap.md`

不要让代理只从 `README.md` 入手；它有意写得较短，不包含完整的实现上下文。

## 标准交接提示词

当启动另一个 AI 工具时使用以下提示词：

```text
你将接管位于 F:\code\songlist-studio 的 SongList Studio 项目。

在动手之前，请先阅读：
- AGENTS.md
- docs/technical/ai-handoff.md
- docs/product/project-status-roadmap.md
- docs/product/songlist-studio-prd.md

然后执行：
- git status --short
- npm run check
- npm run build

遵循现有的产品方向：面向音乐主播的、备忘录风格的简洁工具，本地优先 MVP，暂不做音乐播放、歌词、云同步或账号体系。

每次有意义的改动都使用聚焦的 conventional 风格 commit message 提交。
```

## 注意事项

- 在本地 MVP 完成前，不要引入云同步、账号、公开分享、音乐播放、歌词、OBS 或直播平台对接。
- 不要把现有 UI 方向替换成营销落地页。
- 不要引入自由画布 / 海报式编辑器。
- 不要提交 `dist/` 下的生成产物。
- 不要把无关功能混在同一次提交里。

## 任何新代理的最佳下一项工作

实现首次使用引导或示例数据导入，让新测试者能快速完成完整流程：

1. 添加示例歌曲。
2. 生成一份歌单。
3. 编辑歌单分组和歌曲。
4. 导出 PNG。
5. 确认歌单出现在历史记录中。
