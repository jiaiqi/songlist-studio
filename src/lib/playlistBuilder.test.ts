import { describe, expect, it } from 'vitest'
import type { Song } from '@/types'
import { buildPlaylistDraft } from './playlistBuilder'

function createSong(partial: Partial<Song> = {}): Song {
  return {
    id: 'test-id',
    title: '测试歌曲',
    artist: '测试歌手',
    genre: '流行',
    language: '国语',
    mood: '欢快',
    proficiency: 'familiar',
    status: 'requestable',
    tags: [],
    updatedAt: Date.now(),
    createdAt: Date.now(),
    ...partial,
  }
}

describe('buildPlaylistDraft', () => {
  it('生成基本歌单草稿', () => {
    const draft = buildPlaylistDraft({
      title: '我的歌单',
      purpose: 'live',
      dimension: 'genre',
      songs: [createSong({ genre: '流行' }), createSong({ genre: '摇滚' })],
    })

    expect(draft.title).toBe('我的歌单')
    expect(draft.purpose).toBe('live')
    expect(draft.categoryDimension).toBe('genre')
    expect(draft.sections).toHaveLength(2)
    expect(draft.lifecycleStatus).toBe('draft')
  })

  it('副标题为空时不包含', () => {
    const draft = buildPlaylistDraft({
      title: '我的歌单',
      purpose: 'live',
      dimension: 'genre',
      songs: [],
    })

    expect(draft.subtitle).toBeUndefined()
  })

  it('副标题去除空白', () => {
    const draft = buildPlaylistDraft({
      title: '我的歌单',
      subtitle: '  直播专用  ',
      purpose: 'live',
      dimension: 'genre',
      songs: [],
    })

    expect(draft.subtitle).toBe('直播专用')
  })

  it('空歌曲生成空分组', () => {
    const draft = buildPlaylistDraft({
      title: '空歌单',
      purpose: 'live',
      dimension: 'genre',
      songs: [],
    })

    expect(draft.sections).toHaveLength(0)
  })

  it('按维度正确分组', () => {
    const songs = [
      createSong({ id: '1', genre: '流行' }),
      createSong({ id: '2', genre: '流行' }),
      createSong({ id: '3', genre: '摇滚' }),
    ]

    const draft = buildPlaylistDraft({
      title: '测试',
      purpose: 'live',
      dimension: 'genre',
      songs,
    })

    expect(draft.sections).toHaveLength(2)
    const popSection = draft.sections.find((s) => s.title === '流行')
    expect(popSection?.songIds).toHaveLength(2)
  })

  it('每个分组有唯一ID', () => {
    const songs = [createSong({ id: '1', genre: '流行' }), createSong({ id: '2', genre: '摇滚' })]

    const draft = buildPlaylistDraft({
      title: '测试',
      purpose: 'live',
      dimension: 'genre',
      songs,
    })

    const ids = draft.sections.map((s) => s.id)
    const uniqueIds = new Set(ids)
    expect(uniqueIds.size).toBe(ids.length)
  })

  it('默认背景配置', () => {
    const draft = buildPlaylistDraft({
      title: '测试',
      purpose: 'live',
      dimension: 'genre',
      songs: [],
    })

    expect(draft.background).toEqual({
      type: 'solid',
      value: '#FFFDF7',
    })
  })

  it('默认皮肤ID', () => {
    const draft = buildPlaylistDraft({
      title: '测试',
      purpose: 'live',
      dimension: 'genre',
      songs: [],
    })

    expect(draft.skinId).toBe('memo-cream')
  })
})
