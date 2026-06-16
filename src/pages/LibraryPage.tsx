import { type FormEvent, useMemo, useState } from 'react'
import { useSongs } from '@/hooks/useSongs'
import { addSong, addSongs, deleteSong, seedSampleData } from '@/lib/db'
import { createSongDraft, parseSongImport } from '@/lib/songImport'
import type { Song, SongDraft } from '@/types'

const statusLabels: Record<Song['status'], string> = {
  requestable: '可点歌',
  practicing: '练习中',
  paused: '暂不唱',
}

const statusOptions: Array<{ label: string; value: 'all' | Song['status'] }> = [
  { label: '全部', value: 'all' },
  { label: '可点歌', value: 'requestable' },
  { label: '练习中', value: 'practicing' },
  { label: '暂不唱', value: 'paused' },
]

function LibraryPage() {
  const { filters, filteredSongs, isLoading, refresh, setFilters, songs } = useSongs()
  const [singleSong, setSingleSong] = useState<SongDraft>(() => createSongDraft(''))
  const [bulkText, setBulkText] = useState('')
  const [message, setMessage] = useState('')

  const parsedSongs = useMemo(() => parseSongImport(bulkText), [bulkText])

  async function handleAddSong(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const title = singleSong.title.trim()

    if (!title) {
      setMessage('歌名不能为空。')
      return
    }

    await addSong({
      ...singleSong,
      title,
      artist: singleSong.artist?.trim() || undefined,
      genre: singleSong.genre?.trim() || undefined,
      language: singleSong.language?.trim() || undefined,
      mood: singleSong.mood?.trim() || undefined,
    })
    setSingleSong(createSongDraft(''))
    setMessage(`已添加《${title}》。`)
    await refresh()
  }

  async function handleBulkImport() {
    if (parsedSongs.length === 0) {
      setMessage('没有识别到可导入的歌曲。')
      return
    }

    await addSongs(parsedSongs)
    setBulkText('')
    setMessage(`已批量导入 ${parsedSongs.length} 首歌曲。`)
    await refresh()
  }

  async function handleDeleteSong(song: Song) {
    await deleteSong(song.id)
    setMessage(`已删除《${song.title}》。`)
    await refresh()
  }

  async function handleLoadSampleData() {
    const songs = await seedSampleData()
    setMessage(`已加载 ${songs.length} 首示例歌曲。`)
    await refresh()
  }

  return (
    <main className="app-shell">
      <section className="library-hero">
        <div>
          <p className="eyebrow">Library</p>
          <h1>我的曲库</h1>
          <p className="summary">先把会唱的歌收进来，后续分类、生成歌单和发布历史都从这里开始。</p>
        </div>
        <div className="library-count">
          <strong>{songs.length}</strong>
          <span>首已录入</span>
        </div>
      </section>

      <section className="library-layout">
        <div className="library-tools">
          <form className="tool-panel" onSubmit={handleAddSong}>
            <div>
              <p className="section-label">单首添加</p>
              <h2>录入一首会唱的歌</h2>
            </div>
            <label>
              歌名
              <input
                value={singleSong.title}
                onChange={(event) => setSingleSong({ ...singleSong, title: event.target.value })}
                placeholder="例如：稻香"
              />
            </label>
            <label>
              歌手
              <input
                value={singleSong.artist ?? ''}
                onChange={(event) => setSingleSong({ ...singleSong, artist: event.target.value })}
                placeholder="例如：周杰伦"
              />
            </label>
            <div className="field-grid">
              <label>
                风格
                <input
                  value={singleSong.genre ?? ''}
                  onChange={(event) => setSingleSong({ ...singleSong, genre: event.target.value })}
                  placeholder="流行"
                />
              </label>
              <label>
                语言
                <input
                  value={singleSong.language ?? ''}
                  onChange={(event) =>
                    setSingleSong({ ...singleSong, language: event.target.value })
                  }
                  placeholder="国语"
                />
              </label>
            </div>
            <div className="field-grid">
              <label>
                情绪
                <input
                  value={singleSong.mood ?? ''}
                  onChange={(event) => setSingleSong({ ...singleSong, mood: event.target.value })}
                  placeholder="热场"
                />
              </label>
              <label>
                状态
                <select
                  value={singleSong.status}
                  onChange={(event) =>
                    setSingleSong({
                      ...singleSong,
                      status: event.target.value as Song['status'],
                    })
                  }
                >
                  <option value="requestable">可点歌</option>
                  <option value="practicing">练习中</option>
                  <option value="paused">暂不唱</option>
                </select>
              </label>
            </div>
            <button className="primary-button" type="submit">
              添加到曲库
            </button>
          </form>

          <section className="tool-panel">
            <div>
              <p className="section-label">批量导入</p>
              <h2>从备忘录粘贴</h2>
            </div>
            <textarea
              value={bulkText}
              onChange={(event) => setBulkText(event.target.value)}
              placeholder={'稻香 - 周杰伦\n后来 - 刘若英\n小幸运'}
              rows={7}
            />
            <div className="import-footer">
              <span>将导入 {parsedSongs.length} 首</span>
              <button className="secondary-button" type="button" onClick={handleBulkImport}>
                批量导入
              </button>
            </div>
          </section>
        </div>

        <section className="song-board">
          <div className="song-board-header">
            <div>
              <p className="section-label">Songs</p>
              <h2>歌曲列表</h2>
            </div>
            <span>{isLoading ? '读取中...' : `${filteredSongs.length} / ${songs.length}`}</span>
          </div>

          <div className="filter-row">
            <input
              value={filters.query}
              onChange={(event) => setFilters({ ...filters, query: event.target.value })}
              placeholder="搜索歌名、歌手、风格"
            />
            <select
              value={filters.status}
              onChange={(event) =>
                setFilters({ ...filters, status: event.target.value as typeof filters.status })
              }
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {message ? <p className="inline-message">{message}</p> : null}

          <div className="song-list">
            {filteredSongs.map((song) => (
              <article className="song-row" key={song.id}>
                <div>
                  <strong>{song.title}</strong>
                  <span>{song.artist || '未填写歌手'}</span>
                </div>
                <div className="tag-line">
                  <span>{song.genre || '未分类'}</span>
                  <span>{song.language || '未设置语言'}</span>
                  <span>{song.mood || '未设置情绪'}</span>
                  <span>{statusLabels[song.status]}</span>
                </div>
                <button type="button" onClick={() => handleDeleteSong(song)}>
                  删除
                </button>
              </article>
            ))}
            {!isLoading && filteredSongs.length === 0 ? (
              <div className="empty-state">
                <p>还没有匹配的歌曲。先添加几首，下一步才能生成歌单。</p>
                {songs.length === 0 ? (
                  <button
                    className="secondary-button"
                    style={{ marginTop: '12px' }}
                    type="button"
                    onClick={handleLoadSampleData}
                  >
                    加载示例歌曲
                  </button>
                ) : null}
              </div>
            ) : null}
          </div>
        </section>
      </section>
    </main>
  )
}

export default LibraryPage
