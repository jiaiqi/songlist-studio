import { describe, expect, it } from 'vitest'
import { createSongDraft, parseSongImport } from './songImport'

describe('parseSongImport', () => {
  it('解析单行', () => {
    const result = parseSongImport('晴天 - 周杰伦')

    expect(result).toHaveLength(1)
    expect(result[0].title).toBe('晴天')
    expect(result[0].artist).toBe('周杰伦')
  })

  it('解析多行', () => {
    const input = '晴天 - 周杰伦\n稻香 - 周杰伦\n江南 - 林俊杰'
    const result = parseSongImport(input)

    expect(result).toHaveLength(3)
  })

  it('支持多种分隔符', () => {
    const separators = [' - ', ' – ', ' / ', '-', '/']

    for (const sep of separators) {
      const result = parseSongImport(`晴天${sep}周杰伦`)
      expect(result[0].title).toBe('晴天')
      expect(result[0].artist).toBe('周杰伦')
    }
  })

  it('无分隔符时只有歌名', () => {
    const result = parseSongImport('晴天')

    expect(result[0].title).toBe('晴天')
    expect(result[0].artist).toBeUndefined()
  })

  it('去重：相同歌名+歌手只保留第一个', () => {
    const input = '晴天 - 周杰伦\n晴天 - 周杰伦\n稻香 - 周杰伦'
    const result = parseSongImport(input)

    expect(result).toHaveLength(2)
  })

  it('空行和空白字符被过滤', () => {
    const input = '  \n晴天 - 周杰伦\n\n  \n'
    const result = parseSongImport(input)

    expect(result).toHaveLength(1)
  })

  it('支持 Windows 换行符', () => {
    const input = '晴天 - 周杰伦\r\n稻香 - 周杰伦'
    const result = parseSongImport(input)

    expect(result).toHaveLength(2)
  })

  it('空输入返回空数组', () => {
    const result = parseSongImport('')
    expect(result).toHaveLength(0)
  })
})

describe('createSongDraft', () => {
  it('默认状态为 requestable', () => {
    const draft = createSongDraft('晴天')
    expect(draft.status).toBe('requestable')
  })

  it('空歌手转为 undefined', () => {
    const draft = createSongDraft('晴天', '')
    expect(draft.artist).toBeUndefined()
  })

  it('去除首尾空白', () => {
    const draft = createSongDraft('  晴天  ', '  周杰伦  ')
    expect(draft.title).toBe('晴天')
    expect(draft.artist).toBe('周杰伦')
  })
})
