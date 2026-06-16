# AGENTS.md

本文件是 AI 编程代理在本仓库的主要指令入口。

## 项目

SongList Studio 是一个面向音乐主播的、本地优先的歌单与曲库工具。

仓库路径：`F:\code\songlist-studio`

## 产品方向

- 保持简洁、实用、备忘录风格的产品气质。
- 目标用户是音乐主播：需要管理自己会唱的歌曲、生成可点歌的歌单、追踪历史歌单、记录观众要求学的歌曲。
- 不要把产品做成音乐播放器、歌词应用、自由排版的设计器、社区平台、OBS 插件、直播平台对接。
- 优先选择清晰的表单控件和适合手机的交互方式，避免复杂的拖拽 / 画布行为。

## 重大改动前必读

开始之前先阅读：

1. `docs/product/songlist-studio-prd.md`
2. `docs/product/project-status-roadmap.md`
3. `docs/technical/ai-handoff.md`
4. `docs/technical/ai-tooling-guide.md`

## 技术栈

- React 19
- TypeScript
- Vite
- npm
- Dexie / IndexedDB
- React Router
- Biome
- html-to-image

## 命令

安装依赖：

```bash
npm install
```

本地启动：

```bash
npm run dev
```

提交前检查：

```bash
npm run check
npm run build
```

## Git 规则

- 提交要聚焦、有意义。
- 使用 conventional 风格 commit message，例如：
  - `feat: add playlist PNG export`
  - `docs: add project handoff and roadmap`
  - `chore: configure React Vite tooling`
- 不要把无关的产品、UI、基础设施改动混在同一次提交里。
- 除非用户明确要求，不要回退用户已做的改动。

## 文档规则

所有项目文档必须放在 `docs/` 下：

- 产品文档：`docs/product/`
- 设计文档：`docs/design/`
- 技术文档：`docs/technical/`

当添加重要功能导致项目状态变化时，记得更新 handoff / status 类文档。

## 当前主要路由

- `/`
- `/library`
- `/generate`
- `/history`
- `/playlists/:playlistId`
- `/learning`
- `/docs`

## 当前已知缺口

- PNG 导出需要用用户自建歌单做端到端实测。
- 首次使用引导（onboarding）和示例数据导入尚未实现。
- 本地背景图片上传尚未实现。
- 完整的数据备份与恢复尚未实现。
- 长歌单分页尚未实现。
- 自动化测试尚未添加。

## 建议的下一项工作

实现首次使用引导或示例数据导入，让新用户或 AI 测试代理能快速完成"录入歌曲 → 生成歌单 → 编辑 → 导出 PNG"的完整流程。
