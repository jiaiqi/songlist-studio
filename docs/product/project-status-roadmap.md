# SongList Studio Status And Roadmap

## Current Status

The project has a working local MVP skeleton with the main product flow partially complete:

1. Songs can be recorded in a local song library.
2. Songs can be classified into playlist drafts.
3. Draft playlists can be edited.
4. Playlists can be published into history.
5. Playlists can be exported as PNG images.
6. Viewer-requested songs can be tracked in a learning memo.

## Completed

- Product requirements document created.
- React + TypeScript + Vite project initialized.
- Documentation directory established.
- Local IndexedDB persistence added.
- Song library page implemented.
- Batch song import implemented.
- Playlist generation page implemented.
- Responsive themed app shell implemented.
- Four visual themes implemented.
- Playlist history page implemented.
- Playlist editor page implemented.
- Learning request memo implemented.
- PNG export implemented with mobile-friendly size presets.
- First-use onboarding with sample-data import implemented.

## Current MVP Flow

Recommended manual test flow:

1. Go to `我的曲库`.
2. Add or batch import at least 5 songs.
3. Go to `生成歌单`.
4. Choose purpose and classification dimension.
5. Save a draft.
6. Edit sections and songs in the playlist editor.
7. Set a background.
8. Export PNG.
9. Publish or view the playlist in `发布历史`.
10. Record one viewer-requested song in `学歌备忘录`.
11. Add that request into the song library.

## Next Development Priorities

### P0 - Finish Core MVP

- Add full local data backup and restore.
- Add local image upload for playlist backgrounds.
- Add export validation messages for oversized playlists.
- Add long playlist pagination or long-image export limits.
- Improve history detail actions: delete, mark template, duplicate with clear naming.

### P1 - Improve Editing Efficiency

- Add drag-and-drop for section and song ordering if up/down buttons become too slow.
- Add bulk actions in the song library.
- Add quick filters for requestable songs, practicing songs, language, genre, and mood.
- Add playlist templates.
- Add section summary export mode for very long song lists.

### P2 - Product Polish

- Add first-use guide.
- Add empty-state examples and safe demo data.
- Add visual export preview closer to final mobile PNG.
- Add keyboard-friendly workflows for desktop.
- Add better mobile bottom action bar for editor/export.

### P3 - Later, Not MVP

- Account system.
- Cloud sync.
- Share links.
- Public playlist page.
- AI song metadata completion.
- Live platform integrations.
- OBS integration.
- Lyrics or music playback.

## Open Product Decisions

- Should publishing to history happen automatically after PNG export, or remain a manual action?
- Should learning memo items count as songs before they are learned?
- Should local image backgrounds be stored permanently in IndexedDB, or only referenced during export?
- What is the default export size for the target livestream platform?
- Should very long playlists export as multiple PNG files or a single long image?

## Handoff Notes

Any AI agent taking over should start by reading:

1. `docs/product/songlist-studio-prd.md`
2. `docs/product/project-status-roadmap.md`
3. `docs/technical/ai-handoff.md`

Then run:

```bash
npm install
npm run check
npm run build
npm run dev
```
