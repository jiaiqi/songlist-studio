# AGENTS.md

This file is the primary instruction entrypoint for AI coding agents working in this repository.

## Project

SongList Studio is a local-first playlist and song-library tool for music livestream hosts.

Repository: `F:\code\songlist-studio`

## Product Direction

- Keep the app simple, practical, and note-app inspired.
- The target user is a livestream host who needs to manage singable songs, generate requestable playlists, track past playlists, and record viewer-requested songs to learn.
- Do not turn the product into a music player, lyrics app, freeform poster editor, social platform, OBS plugin, or live-platform integration.
- Prefer clear form controls and mobile-friendly interactions over complex drag/canvas behavior.

## Required Reading Before Major Changes

Read these files first:

1. `docs/product/songlist-studio-prd.md`
2. `docs/product/project-status-roadmap.md`
3. `docs/technical/ai-handoff.md`
4. `docs/technical/ai-tooling-guide.md`

## Tech Stack

- React 19
- TypeScript
- Vite
- npm
- Dexie / IndexedDB
- React Router
- Biome
- html-to-image

## Commands

Install dependencies:

```bash
npm install
```

Run locally:

```bash
npm run dev
```

Check before commit:

```bash
npm run check
npm run build
```

## Git Rules

- Keep commits focused and meaningful.
- Use conventional-style commit messages, for example:
  - `feat: add playlist PNG export`
  - `docs: add project handoff and roadmap`
  - `chore: configure React Vite tooling`
- Do not mix unrelated product, UI, and infrastructure changes in one commit.
- Do not revert user changes unless explicitly requested.

## Documentation Rules

All project documentation must stay under `docs/`:

- Product docs: `docs/product/`
- Design docs: `docs/design/`
- Technical docs: `docs/technical/`

When adding substantial features, update handoff/status docs if the project state changes.

## Current Important Routes

- `/`
- `/library`
- `/generate`
- `/history`
- `/playlists/:playlistId`
- `/learning`
- `/docs`

## Current Known Gaps

- Real end-to-end PNG export needs testing with a user-created playlist.
- Onboarding or sample-data import is not implemented.
- Local background image upload is not implemented.
- Full data backup and restore are not implemented.
- Long playlist pagination is not implemented.
- Automated tests are not yet added.

## Next Recommended Task

Build first-use onboarding or sample-data import so a new user or AI tester can quickly create songs, generate a playlist, edit it, and test PNG export end to end.
