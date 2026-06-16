import Dexie, { type Table } from 'dexie'
import type {
  LearningRequest,
  LearningRequestDraft,
  Playlist,
  PlaylistDraft,
  Song,
  SongDraft,
} from '@/types'
import { createId } from './id'
import { sampleSongs } from './sampleData'
import { now } from './time'

class SongListStudioDatabase extends Dexie {
  songs!: Table<Song, string>
  playlists!: Table<Playlist, string>
  learningRequests!: Table<LearningRequest, string>

  constructor() {
    super('songlist-studio')

    this.version(1).stores({
      songs: 'id, title, artist, genre, language, mood, status, updatedAt',
      playlists:
        'id, title, purpose, categoryDimension, lifecycleStatus, publishedAt, lastExportedAt, updatedAt',
    })

    this.version(2).stores({
      songs: 'id, title, artist, genre, language, mood, status, updatedAt',
      playlists:
        'id, title, purpose, categoryDimension, lifecycleStatus, publishedAt, lastExportedAt, updatedAt',
      learningRequests: 'id, songTitle, requesterName, status, requestedAt, updatedAt',
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

export async function deleteSongs(ids: string[]) {
  await db.songs.bulkDelete(ids)
}

export async function listSongs() {
  return db.songs.orderBy('updatedAt').reverse().toArray()
}

export async function seedSampleData() {
  return addSongs(sampleSongs)
}

export async function clearAllData() {
  await Promise.all([db.songs.clear(), db.playlists.clear(), db.learningRequests.clear()])
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

export async function getPlaylist(id: string) {
  return db.playlists.get(id)
}

export async function listPlaylists() {
  return db.playlists.orderBy('updatedAt').reverse().toArray()
}

export async function listPublishedPlaylists() {
  return db.playlists.where('lifecycleStatus').equals('published').reverse().sortBy('updatedAt')
}

export async function publishPlaylist(id: string) {
  const timestamp = now()

  await db.playlists.update(id, {
    lifecycleStatus: 'published',
    lastExportedAt: timestamp,
    publishedAt: timestamp,
    updatedAt: timestamp,
  })
}

export async function duplicatePlaylist(id: string) {
  const source = await getPlaylist(id)
  if (!source) return undefined

  return addPlaylist({
    ...source,
    title: `${source.title} 副本`,
    lifecycleStatus: 'draft',
    publishedAt: undefined,
    lastExportedAt: undefined,
    sourcePlaylistId: source.id,
    thumbnail: undefined,
  })
}

export async function saveAsTemplate(id: string) {
  const source = await getPlaylist(id)
  if (!source) return undefined

  return addPlaylist({
    ...source,
    title: `${source.title} 模板`,
    lifecycleStatus: 'template',
    publishedAt: undefined,
    lastExportedAt: undefined,
    sourcePlaylistId: source.id,
    thumbnail: undefined,
  })
}

export async function addLearningRequest(draft: LearningRequestDraft) {
  const timestamp = now()
  const request: LearningRequest = {
    ...draft,
    id: createId('learn'),
    createdAt: timestamp,
    updatedAt: timestamp,
  }

  await db.learningRequests.add(request)
  return request
}

export async function updateLearningRequest(id: string, changes: Partial<LearningRequestDraft>) {
  await db.learningRequests.update(id, {
    ...changes,
    updatedAt: now(),
  })
}

export async function deleteLearningRequest(id: string) {
  await db.learningRequests.delete(id)
}

export async function listLearningRequests() {
  return db.learningRequests.orderBy('requestedAt').reverse().toArray()
}

export async function linkLearningRequestToSong(requestId: string, songId: string) {
  await db.learningRequests.update(requestId, {
    linkedSongId: songId,
    status: 'learned',
    updatedAt: now(),
  })
}

export async function getDatabaseStats() {
  const [songCount, playlistCount, publishedPlaylistCount, learningRequestCount] =
    await Promise.all([
      db.songs.count(),
      db.playlists.count(),
      db.playlists.where('lifecycleStatus').equals('published').count(),
      db.learningRequests.where('status').anyOf('todo', 'practicing').count(),
    ])

  return {
    learningRequestCount,
    songCount,
    playlistCount,
    publishedPlaylistCount,
  }
}
