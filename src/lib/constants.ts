// Timeouts and delays (ms)
export const AUTO_SAVE_DELAY = 3000
export const TOAST_DURATION = 3000
export const MESSAGE_CLEAR_DELAY = 5000
export const SCROLL_TO_TOP_THRESHOLD = 300

// File and image limits
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024 // 5MB
export const MAX_IMAGE_SIZE_MB = 5

// Export dimensions (width x height)
export const EXPORT_DIMENSIONS = {
  story: { width: 1080, height: 1920, label: '9:16 竖版' },
  long: { width: 1080, height: 2400, label: '长图' },
  square: { width: 1242, height: 1242, label: '1:1 方形' },
  poster: { width: 1242, height: 1660, label: '3:4 海报' },
} as const

export const EXPORT_PIXEL_RATIO = 2

// Input constraints
export const MAX_TITLE_LENGTH = 100
export const MAX_ARTIST_LENGTH = 100
export const MAX_NOTE_LENGTH = 500
export const MAX_RULES_TEXT_LENGTH = 1000
export const MAX_TAG_LENGTH = 20
export const MAX_TAGS_COUNT = 10

// Database
export const DB_NAME = 'songlist-studio'
export const DB_SCHEMA_VERSION = 2

// Backup
export const BACKUP_VERSION = 1

// Default values
export const DEFAULT_PLAYLIST_TITLE = '我的点歌单'
export const DEFAULT_RULES_TEXT = '点歌前请先确认歌单状态，练习中歌曲暂不开放。'
export const DEFAULT_SKIN_ID = 'memo-cream'
export const DEFAULT_BACKGROUND = '#FFFDF7'
