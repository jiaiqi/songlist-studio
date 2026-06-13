import type { CategoryDimension, PlaylistDraft, PlaylistPurpose, Song } from '@/types'
import { classifySongs } from './classify'
import { createId } from './id'

const defaultBackground = {
  type: 'solid',
  value: '#FFFDF7',
} as const

export function buildPlaylistDraft(input: {
  title: string
  subtitle?: string
  purpose: PlaylistPurpose
  dimension: CategoryDimension
  songs: Song[]
}): PlaylistDraft {
  const groups = classifySongs(input.songs, input.dimension)

  return {
    title: input.title.trim(),
    subtitle: input.subtitle?.trim() || undefined,
    purpose: input.purpose,
    categoryDimension: input.dimension,
    sections: groups.map((group, index) => ({
      id: createId('section'),
      title: group.title,
      songIds: group.songs.map((song) => song.id),
      hidden: false,
      order: index,
    })),
    rulesText: '点歌前请先确认歌单状态，练习中歌曲暂不开放。',
    skinId: 'memo-cream',
    background: defaultBackground,
    lifecycleStatus: 'draft',
  }
}
