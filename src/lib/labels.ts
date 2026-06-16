import type { SongProficiency, SongStatus } from '@/types'

export const statusLabels: Record<SongStatus, string> = {
  requestable: '可点歌',
  practicing: '练习中',
  paused: '已暂停',
}

export const statusOptions: Array<{ label: string; value: SongStatus }> = [
  { label: '可点歌', value: 'requestable' },
  { label: '练习中', value: 'practicing' },
  { label: '已暂停', value: 'paused' },
]

export const proficiencyLabels: Record<SongProficiency, string> = {
  rough: '粗略',
  complete: '完整',
  familiar: '熟练',
  signature: '招牌',
}

export const proficiencyOptions: Array<{ label: string; value: SongProficiency }> = [
  { label: '粗略', value: 'rough' },
  { label: '完整', value: 'complete' },
  { label: '熟练', value: 'familiar' },
  { label: '招牌', value: 'signature' },
]

export const learningStatusLabels: Record<'todo' | 'practicing' | 'learned' | 'abandoned', string> =
  {
    todo: '待学',
    practicing: '练习中',
    learned: '已学会',
    abandoned: '已放弃',
  }

export const playlistStatusLabels: Record<'draft' | 'published' | 'template', string> = {
  draft: '草稿',
  published: '已发布',
  template: '模板',
}
