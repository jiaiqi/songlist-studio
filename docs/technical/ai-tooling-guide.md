# AI Tooling Guide

This project is prepared for handoff between AI coding tools such as Codex, Claude Code, OpenCode/OpenClaw-style agents, Cursor, Windsurf, and similar local coding assistants.

## Universal Entrypoints

Use these files as the handoff surface:

- `AGENTS.md`: universal coding-agent instructions.
- `CLAUDE.md`: Claude Code specific pointer file.
- `docs/technical/ai-handoff.md`: detailed current project understanding.
- `docs/product/project-status-roadmap.md`: completed work, roadmap, and open decisions.
- `docs/product/songlist-studio-prd.md`: product requirements.

## Tool-Specific Notes

### Claude Code

Claude Code commonly reads `CLAUDE.md`.

Expected flow:

1. Read `CLAUDE.md`.
2. Follow its pointer to `AGENTS.md`.
3. Use `docs/technical/ai-handoff.md` for current implementation context.

### Codex / OpenAI Coding Agents

Codex-style agents should read `AGENTS.md` first.

Expected flow:

1. Read `AGENTS.md`.
2. Check `git status --short`.
3. Inspect relevant files.
4. Implement focused changes.
5. Run `npm run check` and `npm run build`.
6. Commit with a focused message.

### OpenCode / OpenClaw-Style Agents

If the tool supports repository instruction files, point it at:

- `AGENTS.md`
- `docs/technical/ai-handoff.md`

If the tool asks for a project brief, use this:

> SongList Studio is a local-first React/TypeScript/Vite app for livestream hosts to manage songs they can sing, generate categorized playlists, edit and export playlist images, manage playlist history, and track viewer-requested songs to learn.

### Cursor / Windsurf / Other IDE Agents

If the tool does not automatically read `AGENTS.md`, paste or attach:

1. `AGENTS.md`
2. `docs/technical/ai-handoff.md`
3. `docs/product/project-status-roadmap.md`

Do not let the agent start from only `README.md`; it is intentionally shorter and does not contain the full implementation context.

## Standard Handoff Prompt

Use this prompt when starting another AI tool:

```text
You are taking over the SongList Studio project at F:\code\songlist-studio.

Before making changes, read:
- AGENTS.md
- docs/technical/ai-handoff.md
- docs/product/project-status-roadmap.md
- docs/product/songlist-studio-prd.md

Then run:
- git status --short
- npm run check
- npm run build

Follow the existing product direction: simple note-app-inspired tool for livestream hosts, local-first MVP, no music playback, no lyrics, no cloud/account work yet.

Commit each meaningful change with a focused conventional-style commit message.
```

## What To Avoid

- Do not add cloud sync, accounts, public sharing, music playback, lyrics, OBS, or live-platform integrations before the local MVP is finished.
- Do not replace the current UI direction with a marketing landing page.
- Do not introduce a freeform canvas/poster editor.
- Do not commit generated build output from `dist/`.
- Do not mix unrelated features in one commit.

## Best Next Task For Any Incoming Agent

Implement first-use onboarding or sample-data import so a new tester can complete the full path quickly:

1. Add sample songs.
2. Generate a playlist.
3. Edit playlist sections and songs.
4. Export PNG.
5. Confirm it appears in history.
