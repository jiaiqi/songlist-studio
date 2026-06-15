export const THEME_IDS = ['memo', 'blush', 'midnight', 'kraft'] as const

export type ThemeId = (typeof THEME_IDS)[number]

export const themes: Array<{ id: ThemeId; label: string; description: string }> = [
  {
    id: 'memo',
    label: '米白备忘录',
    description: '干净、克制，适合日常点歌单。',
  },
  {
    id: 'blush',
    label: '粉色便签',
    description: '柔和、亲近，适合直播间展示。',
  },
  {
    id: 'midnight',
    label: '深夜模式',
    description: '暗色、高对比，适合夜场和情绪歌单。',
  },
  {
    id: 'kraft',
    label: '牛皮纸',
    description: '温暖、复古，适合民谣和驻唱场景。',
  },
]

export const defaultTheme: ThemeId = 'memo'

export function isThemeId(value: string): value is ThemeId {
  return THEME_IDS.includes(value as ThemeId)
}
