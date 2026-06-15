export const LEARNING_REQUEST_STATUSES = ['todo', 'practicing', 'learned', 'abandoned'] as const

export type LearningRequestStatus = (typeof LEARNING_REQUEST_STATUSES)[number]

export type LearningRequest = {
  id: string
  songTitle: string
  artist?: string
  requesterName?: string
  requestedAt: number
  sourceNote?: string
  giftNote?: string
  note?: string
  status: LearningRequestStatus
  linkedSongId?: string
  createdAt: number
  updatedAt: number
}

export type LearningRequestDraft = Omit<LearningRequest, 'id' | 'createdAt' | 'updatedAt'>
