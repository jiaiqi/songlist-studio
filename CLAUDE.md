# CLAUDE.md

Claude Code should use `AGENTS.md` as the main repository instruction file.

Start here:

1. Read `AGENTS.md`.
2. Read `docs/technical/ai-handoff.md`.
3. Read `docs/product/project-status-roadmap.md`.
4. For product decisions, read `docs/product/songlist-studio-prd.md`.

## Working Expectations

- Keep implementation aligned with the note-app inspired livestream-host workflow.
- Preserve the local-first MVP direction.
- Run `npm run check` and `npm run build` before finalizing code changes.
- Commit each meaningful change with a focused conventional-style message.
- Put new docs under `docs/`.

## High-Value Next Work

The best next implementation task is onboarding or sample data import. This will make the full path testable:

`library -> generate -> editor -> export PNG -> history`

Avoid starting cloud sync, accounts, music playback, lyrics, or platform integrations before the local MVP is complete.
