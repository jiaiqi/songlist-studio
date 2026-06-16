import type { Song } from '@/types'

export function createSong(overrides: Partial<Song> = {}): Song {
  return {
    id: 'test-song-1',
    title: 'Test Song',
    artist: 'Test Artist',
    genre: '流行',
    language: '国语',
    mood: '热场',
    status: 'requestable',
    proficiency: 'familiar',
    tags: ['test'],
    note: '',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    ...overrides,
  }
}

export function createSongs(count: number): Song[] {
  return Array.from({ length: count }, (_, i) =>
    createSong({
      id: `test-song-${i + 1}`,
      title: `Song ${i + 1}`,
    }),
  )
}
