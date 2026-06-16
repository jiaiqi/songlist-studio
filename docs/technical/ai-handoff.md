# SongList Studio AI 交接文档

## 项目位置

- 仓库：`F:\code\songlist-studio`
- 技术栈：React 19、TypeScript、Vite、Dexie、React Router、Biome
- 包管理器：npm
- 开发地址：`http://127.0.0.1:5173/`

## 产品简介

SongList Studio 是一个面向音乐主播的轻量歌单与曲库工具。产品气质应贴近手机备忘录或便签：快、安静、实用，不做成复杂的设计编辑器。

核心用户流程：

1. 维护一份主播自己会唱的歌曲库。
2. 根据场景和分类维度生成歌单。
3. 编辑歌单标题、规则、分组、歌曲顺序、可见性和背景。
4. 发布或保存歌单到历史。
5. 导出适合手机的 PNG。
6. 把观众点歌的请求记录在学歌备忘录里。

## 已实现功能

- React + TypeScript + Vite 项目脚手架。
- 基于 Dexie 的本地 IndexedDB 持久化。
- 响应式 App 外壳与导航。
- 主题切换器，提供 4 种视觉风格：
  - 米白备忘录（memo cream）
  - 粉色便签（pink note）
  - 深夜模式（midnight）
  - 牛皮纸（kraft paper）
- 曲库：
  - 单首添加
  - 批量粘贴导入
  - 搜索与状态筛选
  - 本地删除
- 歌单生成：
  - 生成目标选择
  - 分类维度选择
  - 草稿创建
  - 自动进入歌单编辑器
- 歌单编辑器：
  - 标题、副标题、点歌规则编辑
  - 分组重命名
  - 分组显示 / 隐藏
  - 分组上下移
  - 组内歌曲上下移
  - 从歌单移除歌曲
  - 背景类型 / 值编辑
  - PNG 导出
- 发布历史：
  - 查看已保存歌单
  - 筛选 / 搜索
  - 打开现有歌单
  - 复制为可编辑草稿
- 学歌备忘录：
  - 记录时间、点歌人、歌名、歌手、礼物 / 来源说明、备注
  - 状态流转：待学、练习中、已学会、已放弃
  - 一键将已学会 / 待学歌曲加入曲库
- 主要新页面在 375px 宽度下已做移动端布局检查。
- 首次使用引导与示例数据导入：工作台在曲库为空时显示引导、Library 空态提供回退入口、自动生成歌单草稿。

## 重要源文件

- `AGENTS.md`：面向所有 AI 编程代理的通用仓库指令。
- `CLAUDE.md`：Claude Code 入口文件，指向 `AGENTS.md`。
- `src/App.tsx`：路由注册。
- `src/components/AppFrame.tsx`：全局外壳与导航。
- `src/components/ThemeSwitcher.tsx`：主题选择器 UI。
- `src/theme/ThemeProvider.tsx`：主题状态提供者。
- `src/theme/themes.ts`：主题定义。
- `src/lib/db.ts`：Dexie 数据库 schema 和数据操作。
- `src/lib/classify.ts`：歌曲分类逻辑。
- `src/lib/playlistBuilder.ts`：把选中歌曲转换为歌单草稿。
- `src/lib/sampleData.ts`：示例歌曲与示例歌单配置。
- `src/components/OnboardingPanel.tsx`：工作台首次使用引导卡片。
- `src/pages/LibraryPage.tsx`：曲库 UI。
- `src/pages/GeneratePage.tsx`：歌单生成流程。
- `src/pages/PlaylistEditorPage.tsx`：歌单编辑与 PNG 导出。
- `src/pages/HistoryPage.tsx`：发布历史。
- `src/pages/LearningMemoPage.tsx`：学歌备忘录。
- `src/styles.css`：全局布局、主题、页面样式、响应式 CSS。

## 数据模型说明

应用使用 IndexedDB 数据库，名称为 `songlist-studio`。

数据表：

- `songs`
- `playlists`
- `learningRequests`

当前 Dexie 版本为 `2`。

关键实体类型位于 `src/types/`：

- `Song`
- `Playlist`
- `PlaylistSection`
- `BackgroundConfig`
- `LearningRequest`

## 验证命令

提交前请运行：

```bash
npm run check
npm run build
```

预期结果：两者均通过。

## AI 工具入口

对 Codex、Claude Code、OpenCode/OpenClaw 系工具、Cursor、Windsurf 或类似代理，建议从以下顺序开始：

1. `AGENTS.md`
2. `CLAUDE.md`
3. `docs/technical/ai-tooling-guide.md`
4. `docs/technical/ai-handoff.md`
5. `docs/product/project-status-roadmap.md`
6. `docs/product/songlist-studio-prd.md`

`docs/technical/ai-tooling-guide.md` 中含可直接粘贴的交接提示词。

## 已使用的 Git Commit 规范

使用聚焦的提交，conventional 风格前缀：

- `docs: ...`
- `chore: ...`
- `feat: ...`

近期重要提交：

- `a3fe4c6 feat: add playlist PNG export`
- `ab0ded0 feat: add playlist editor controls`
- `de6ed92 feat: add learning request memo`
- `35e71f8 feat: add playlist history and editor flow`
- `ecf988a feat: add themed responsive app shell`

## 已知缺口

- PNG 导出已实现，但还需要用一份用户自建歌单做端到端下载测试。
- 背景图片支持当前只接受图片 URL，本地文件上传尚未实现。
- 导出为单页 PNG，长歌单分页尚未实现。
- 歌单编辑器使用上下按钮排序，未做拖拽。
- 尚无全量本地数据导入 / 导出备份。
- 尚无首次使用引导或示例数据流。
- 除 TypeScript、Biome、生产构建外，尚无自动化测试。

## 实现偏好

- 保持 UI 实用、备忘录风格。
- 不要把编辑器变成自由排版 / 画布式设计工具。
- 优先使用显式按钮和表单控件，适配移动端。
- 所有产品 / 设计 / 技术文档放在 `docs/` 下。
- 在本地 MVP 完成前，不要引入账号、云同步、音乐播放、歌词、OBS 或直播平台对接。
