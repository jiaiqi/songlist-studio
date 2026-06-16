# SongList Studio AI Handoff

## Project Location

- Repository: `F:\code\songlist-studio`
- Stack: React 19, TypeScript, Vite, Dexie, React Router, Biome
- Package manager: npm
- Dev URL: `http://127.0.0.1:5173/`

## Product Summary

SongList Studio is a lightweight playlist and song-library tool for music livestream hosts. The product style should stay close to a mobile notes or sticky-notes app: fast, quiet, practical, and not a complex design editor.

Core user flow:

1. Maintain a library of songs the host can sing.
2. Generate a playlist by scenario and classification dimension.
3. Edit the playlist title, rules, sections, song order, visibility, and background.
4. Publish or save the playlist into history.
5. Export a mobile-friendly PNG.
6. Track songs requested by viewers as a learning memo.

## Implemented Features

- React + TypeScript + Vite project scaffold.
- Local IndexedDB persistence through Dexie.
- App shell with responsive navigation.
- Theme switcher with four visual styles:
  - memo cream
  - pink note
  - midnight
  - kraft paper
- Song library:
  - single song add
  - batch paste import
  - search and status filtering
  - local delete
- Playlist generation:
  - purpose selection
  - category dimension selection
  - draft creation
  - automatic route into playlist editor
- Playlist editor:
  - title, subtitle, rules editing
  - section rename
  - section show/hide
  - section move up/down
  - song move up/down inside a section
  - song removal from a playlist
  - background type/value editing
  - PNG export
- Playlist history:
  - list saved playlists
  - filter/search
  - open existing playlist
  - duplicate as editable draft
- Learning request memo:
  - record time, requester, song title, artist, gift/source note, and note
  - status workflow: todo, practicing, learned, abandoned
  - add learned/requested song into the song library
- Mobile layout checks have been performed for 375px width on the main new pages.
- First-use onboarding with sample-data import: empty-library prompt on Dashboard, fallback entry in Library empty state, automatic playlist draft generation.

## Important Source Files

- `AGENTS.md`: universal repository instructions for AI coding agents.
- `CLAUDE.md`: Claude Code entrypoint that points back to `AGENTS.md`.
- `src/App.tsx`: route registration.
- `src/components/AppFrame.tsx`: global shell and navigation.
- `src/components/ThemeSwitcher.tsx`: theme selector UI.
- `src/theme/ThemeProvider.tsx`: theme state provider.
- `src/theme/themes.ts`: theme definitions.
- `src/lib/db.ts`: Dexie database schema and data operations.
- `src/lib/classify.ts`: song classification logic.
- `src/lib/playlistBuilder.ts`: converts selected songs into playlist drafts.
- `src/pages/LibraryPage.tsx`: song library UI.
- `src/pages/GeneratePage.tsx`: playlist generation flow.
- `src/pages/PlaylistEditorPage.tsx`: playlist editing and PNG export.
- `src/pages/HistoryPage.tsx`: playlist history.
- `src/pages/LearningMemoPage.tsx`: learning request memo.
- `src/styles.css`: global layout, themes, page styles, responsive CSS.

## Data Model Notes

The app uses IndexedDB database name `songlist-studio`.

Tables:

- `songs`
- `playlists`
- `learningRequests`

Current Dexie version is `2`.

Key entity types live under `src/types/`:

- `Song`
- `Playlist`
- `PlaylistSection`
- `BackgroundConfig`
- `LearningRequest`

## Verification Commands

Run these before committing:

```bash
npm run check
npm run build
```

Expected current result: both pass.

## AI Tooling Entrypoints

For Codex, Claude Code, OpenCode/OpenClaw-style tools, Cursor, Windsurf, or similar agents, start with:

1. `AGENTS.md`
2. `CLAUDE.md`
3. `docs/technical/ai-tooling-guide.md`
4. `docs/technical/ai-handoff.md`
5. `docs/product/project-status-roadmap.md`
6. `docs/product/songlist-studio-prd.md`

Use `docs/technical/ai-tooling-guide.md` for a ready-to-paste handoff prompt.

## Git Commit Convention Used So Far

Use focused commits with conventional-style prefixes:

- `docs: ...`
- `chore: ...`
- `feat: ...`

Recent important commits:

- `a3fe4c6 feat: add playlist PNG export`
- `ab0ded0 feat: add playlist editor controls`
- `de6ed92 feat: add learning request memo`
- `35e71f8 feat: add playlist history and editor flow`
- `ecf988a feat: add themed responsive app shell`

## Known Gaps

- PNG export exists, but a real end-to-end download test still needs a user-created playlist.
- Background image support currently accepts an image URL. Local file upload is not implemented.
- Export is single-page. Long playlist pagination is not implemented.
- Playlist editor uses up/down controls, not drag-and-drop.
- No import/export backup for all local data yet.
- No automated tests yet beyond TypeScript, Biome, and production build.

## Implementation Preferences

- Keep the UI utilitarian and note-app inspired.
- Do not turn the editor into a freeform poster/canvas design tool.
- Prefer explicit buttons and form controls that work well on mobile.
- Keep all product/design/technical docs under `docs/`.
- Do not introduce account, cloud sync, music playback, lyrics, OBS, or live-platform integrations until the local MVP is complete.
