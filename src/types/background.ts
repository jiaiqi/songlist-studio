export const BACKGROUND_TYPES = ['solid', 'gradient', 'image'] as const

export type BackgroundType = (typeof BACKGROUND_TYPES)[number]

export type BackgroundConfig = {
  type: BackgroundType
  value: string
  opacity?: number
  blur?: number
}
