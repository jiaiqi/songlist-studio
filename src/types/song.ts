export const SONG_STATUSES = ['requestable', 'practicing', 'paused'] as const
export const SONG_PROFICIENCIES = ['rough', 'complete', 'familiar', 'signature'] as const

export type SongStatus = (typeof SONG_STATUSES)[number]
export type SongProficiency = (typeof SONG_PROFICIENCIES)[number]

export type Song = {
  id: string
  title: string
  artist?: string
  genre?: string
  language?: string
  mood?: string
  status: SongStatus
  proficiency?: SongProficiency
  tags: string[]
  note?: string
  createdAt: number
  updatedAt: number
}

export type SongDraft = Omit<Song, 'id' | 'createdAt' | 'updatedAt'>
