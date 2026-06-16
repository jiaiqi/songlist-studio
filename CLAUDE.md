# CLAUDE.md

Claude Code 应使用 `AGENTS.md` 作为本仓库的主要指令入口。

从以下文件开始阅读：

1. 阅读 `AGENTS.md`。
2. 阅读 `docs/technical/ai-handoff.md`。
3. 阅读 `docs/product/project-status-roadmap.md`。
4. 涉及产品决策时，阅读 `docs/product/songlist-studio-prd.md`。

## 工作期望

- 实现方向与"备忘录式主播工作流"保持一致。
- 坚守"本地优先 MVP"的产品方向。
- 完成代码改动前，必须运行 `npm run check` 和 `npm run build`。
- 每次有意义的改动都用聚焦的 conventional 风格 commit message 提交。
- 新文档放在 `docs/` 下。

## 最高价值的下一步工作

下一个最佳实现任务是 onboarding（首次使用引导）或示例数据导入。这会让完整主流程可端到端验证：

`曲库 -> 生成 -> 编辑 -> 导出 PNG -> 历史`

在本地 MVP 完成前，不要启动云同步、账号系统、音乐播放、歌词、平台对接等工作。
