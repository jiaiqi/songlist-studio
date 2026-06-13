import type { CategoryDimension, Song } from '@/types'

export type SongGroup = {
  title: string
  songs: Song[]
}

export function classifySongs(songs: Song[], dimension: CategoryDimension): SongGroup[] {
  const groups = new Map<string, Song[]>()

  for (const song of songs) {
    const key = getGroupKey(song, dimension)
    groups.set(key, [...(groups.get(key) ?? []), song])
  }

  return [...groups.entries()]
    .map(([title, groupedSongs]) => ({ title, songs: groupedSongs }))
    .sort((left, right) => left.title.localeCompare(right.title, 'zh-CN'))
}

function getGroupKey(song: Song, dimension: CategoryDimension) {
  switch (dimension) {
    case 'artist':
      return song.artist?.trim() || '其他歌手'
    case 'genre':
      return song.genre?.trim() || '未分类'
    case 'language':
      return song.language?.trim() || '其他语言'
    case 'mood':
      return song.mood?.trim() || '未设置情绪'
    case 'status':
      return getStatusLabel(song.status)
    case 'titleLength':
      return getTitleLengthLabel(song.title)
  }
}

function getStatusLabel(status: Song['status']) {
  const labels: Record<Song['status'], string> = {
    requestable: '可点歌',
    practicing: '练习中',
    paused: '暂不唱',
  }

  return labels[status]
}

function getTitleLengthLabel(title: string) {
  const length = [...title.trim()].length

  if (length <= 2) return '短歌名'
  if (length <= 4) return '常规歌名'
  if (length <= 7) return '长歌名'
  return '超长歌名'
}
