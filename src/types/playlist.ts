import type { BackgroundConfig } from './background'

export const PLAYLIST_PURPOSES = ['live', 'ktv', 'performance', 'practice', 'theme'] as const
export const CATEGORY_DIMENSIONS = [
  'artist',
  'genre',
  'language',
  'mood',
  'titleLength',
  'status',
] as const
export const PLAYLIST_LIFECYCLE_STATUSES = ['draft', 'published', 'template'] as const

export type PlaylistPurpose = (typeof PLAYLIST_PURPOSES)[number]
export type CategoryDimension = (typeof CATEGORY_DIMENSIONS)[number]
export type PlaylistLifecycleStatus = (typeof PLAYLIST_LIFECYCLE_STATUSES)[number]

export type PlaylistSection = {
  id: string
  title: string
  songIds: string[]
  hidden: boolean
  order: number
}

export type Playlist = {
  id: string
  title: string
  subtitle?: string
  purpose: PlaylistPurpose
  categoryDimension: CategoryDimension
  sections: PlaylistSection[]
  rulesText?: string
  skinId: string
  background: BackgroundConfig
  lifecycleStatus: PlaylistLifecycleStatus
  thumbnail?: string
  publishedAt?: number
  lastExportedAt?: number
  sourcePlaylistId?: string
  createdAt: number
  updatedAt: number
}

export type PlaylistDraft = Omit<Playlist, 'id' | 'createdAt' | 'updatedAt'>
