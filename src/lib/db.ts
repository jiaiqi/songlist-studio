import Dexie, { type Table } from 'dexie'
import type { Playlist, PlaylistDraft, Song, SongDraft } from '@/types'
import { createId } from './id'
import { now } from './time'

class SongListStudioDatabase extends Dexie {
  songs!: Table<Song, string>
  playlists!: Table<Playlist, string>

  constructor() {
    super('songlist-studio')

    this.version(1).stores({
      songs: 'id, title, artist, genre, language, mood, status, updatedAt',
      playlists:
        'id, title, purpose, categoryDimension, lifecycleStatus, publishedAt, lastExportedAt, updatedAt',
    })
  }
}

export const db = new SongListStudioDatabase()

export async function addSong(draft: SongDraft) {
  const timestamp = now()
  const song: Song = {
    ...draft,
    id: createId('song'),
    tags: draft.tags ?? [],
    createdAt: timestamp,
    updatedAt: timestamp,
  }

  await db.songs.add(song)
  return song
}

export async function addSongs(drafts: SongDraft[]) {
  const timestamp = now()
  const songs = drafts.map((draft) => ({
    ...draft,
    id: createId('song'),
    tags: draft.tags ?? [],
    createdAt: timestamp,
    updatedAt: timestamp,
  }))

  await db.songs.bulkAdd(songs)
  return songs
}

export async function updateSong(id: string, changes: Partial<SongDraft>) {
  await db.songs.update(id, {
    ...changes,
    updatedAt: now(),
  })
}

export async function deleteSong(id: string) {
  await db.songs.delete(id)
}

export async function listSongs() {
  return db.songs.orderBy('updatedAt').reverse().toArray()
}

export async function addPlaylist(draft: PlaylistDraft) {
  const timestamp = now()
  const playlist: Playlist = {
    ...draft,
    id: createId('playlist'),
    createdAt: timestamp,
    updatedAt: timestamp,
  }

  await db.playlists.add(playlist)
  return playlist
}

export async function updatePlaylist(id: string, changes: Partial<PlaylistDraft>) {
  await db.playlists.update(id, {
    ...changes,
    updatedAt: now(),
  })
}

export async function deletePlaylist(id: string) {
  await db.playlists.delete(id)
}

export async function getDatabaseStats() {
  const [songCount, playlistCount, publishedPlaylistCount] = await Promise.all([
    db.songs.count(),
    db.playlists.count(),
    db.playlists.where('lifecycleStatus').equals('published').count(),
  ])

  return {
    songCount,
    playlistCount,
    publishedPlaylistCount,
  }
}
