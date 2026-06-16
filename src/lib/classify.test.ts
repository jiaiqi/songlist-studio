import { describe, expect, it } from 'vitest'
import type { Song } from '@/types'
import { classifySongs } from './classify'

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

describe('classifySongs', () => {
  it('按歌手分组', () => {
    const songs = [
      createSong({ artist: '周杰伦', title: '晴天' }),
      createSong({ artist: '周杰伦', title: '稻香' }),
      createSong({ artist: '林俊杰', title: '江南' }),
    ]

    const groups = classifySongs(songs, 'artist')

    expect(groups).toHaveLength(2)
    expect(groups[0].title).toBe('林俊杰')
    expect(groups[0].songs).toHaveLength(1)
    expect(groups[1].title).toBe('周杰伦')
    expect(groups[1].songs).toHaveLength(2)
  })

  it('按风格分组', () => {
    const songs = [
      createSong({ genre: '流行', title: 'A' }),
      createSong({ genre: '摇滚', title: 'B' }),
      createSong({ genre: '流行', title: 'C' }),
    ]

    const groups = classifySongs(songs, 'genre')

    expect(groups).toHaveLength(2)
    expect(groups[0].title).toBe('流行')
    expect(groups[1].title).toBe('摇滚')
  })

  it('空歌手归类为"其他歌手"', () => {
    const songs = [createSong({ artist: '' }), createSong({ artist: undefined })]

    const groups = classifySongs(songs, 'artist')

    expect(groups).toHaveLength(1)
    expect(groups[0].title).toBe('其他歌手')
    expect(groups[0].songs).toHaveLength(2)
  })

  it('按歌名长度分组', () => {
    const songs = [
      createSong({ title: 'A' }),
      createSong({ title: 'AB' }),
      createSong({ title: 'ABC' }),
      createSong({ title: 'ABCDE' }),
      createSong({ title: 'ABCDEFG' }),
      createSong({ title: 'ABCDEFGH' }),
    ]

    const groups = classifySongs(songs, 'titleLength')

    expect(groups).toHaveLength(4)
    expect(groups.find((g) => g.title === '短歌名')?.songs).toHaveLength(2)
    expect(groups.find((g) => g.title === '常规歌名')?.songs).toHaveLength(1)
    expect(groups.find((g) => g.title === '长歌名')?.songs).toHaveLength(2)
    expect(groups.find((g) => g.title === '超长歌名')?.songs).toHaveLength(1)
  })

  it('空数组返回空', () => {
    const groups = classifySongs([], 'genre')
    expect(groups).toHaveLength(0)
  })

  it('按中文拼音排序', () => {
    const songs = [
      createSong({ genre: '摇滚' }),
      createSong({ genre: '流行' }),
      createSong({ genre: '民谣' }),
    ]

    const groups = classifySongs(songs, 'genre')
    const titles = groups.map((g) => g.title)

    expect(titles).toEqual(['流行', '民谣', '摇滚'])
  })
})
