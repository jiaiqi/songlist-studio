import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSongs } from '@/hooks/useSongs'
import { classifySongs } from '@/lib/classify'
import { addPlaylist } from '@/lib/db'
import { buildPlaylistDraft } from '@/lib/playlistBuilder'
import type { CategoryDimension, PlaylistPurpose } from '@/types'

const purposeOptions: Array<{ label: string; value: PlaylistPurpose }> = [
  { label: '直播点歌单', value: 'live' },
  { label: 'KTV 歌单', value: 'ktv' },
  { label: '演出曲目单', value: 'performance' },
  { label: '练习歌单', value: 'practice' },
  { label: '主题歌单', value: 'theme' },
]

const dimensionOptions: Array<{ label: string; value: CategoryDimension }> = [
  { label: '按歌手', value: 'artist' },
  { label: '按风格', value: 'genre' },
  { label: '按语言', value: 'language' },
  { label: '按情绪', value: 'mood' },
  { label: '按歌名字数', value: 'titleLength' },
  { label: '按歌曲状态', value: 'status' },
]

function GeneratePage() {
  const navigate = useNavigate()
  const { isLoading, songs } = useSongs()
  const [title, setTitle] = useState('我的点歌单')
  const [subtitle, setSubtitle] = useState('')
  const [purpose, setPurpose] = useState<PlaylistPurpose>('live')
  const [dimension, setDimension] = useState<CategoryDimension>('genre')
  const [message, setMessage] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'requestable' | 'practicing' | 'paused'>(
    'all',
  )
  const [selectedSongIds, setSelectedSongIds] = useState<Set<string>>(new Set())
  const [isSaving, setIsSaving] = useState(false)

  const filteredSongs = useMemo(() => {
    if (statusFilter === 'all') return songs
    return songs.filter((song) => song.status === statusFilter)
  }, [songs, statusFilter])

  const allSelected = filteredSongs.length > 0 && selectedSongIds.size === filteredSongs.length
  const someSelected = selectedSongIds.size > 0 && !allSelected

  const selectedSongs = useMemo(() => {
    return filteredSongs.filter((song) => selectedSongIds.has(song.id))
  }, [filteredSongs, selectedSongIds])

  const groups = useMemo(() => classifySongs(selectedSongs, dimension), [dimension, selectedSongs])
  const visibleGroups = groups.filter((group) => group.songs.length > 0)
  const canSave = title.trim().length > 0 && selectedSongs.length > 0 && visibleGroups.length > 0

  async function handleSaveDraft() {
    if (!canSave) {
      setMessage('需要至少选择 1 首歌曲和填写歌单标题，才能保存草稿。')
      return
    }

    if (isSaving) return
    setIsSaving(true)

    try {
      const playlist = await addPlaylist(
        buildPlaylistDraft({
          title,
          subtitle,
          purpose,
          dimension,
          songs: selectedSongs,
        }),
      )

      setMessage(`已保存草稿《${playlist.title}》，共 ${playlist.sections.length} 个分组。`)
      navigate(`/playlists/${playlist.id}`)
    } catch {
      setMessage('保存草稿失败，请重试。')
      setIsSaving(false)
    }
  }

  function toggleSelectAll() {
    if (allSelected) {
      setSelectedSongIds(new Set())
    } else {
      setSelectedSongIds(new Set(filteredSongs.map((s) => s.id)))
    }
  }

  function toggleSongSelection(songId: string) {
    const next = new Set(selectedSongIds)
    if (next.has(songId)) {
      next.delete(songId)
    } else {
      next.add(songId)
    }
    setSelectedSongIds(next)
  }

  return (
    <main className="app-shell">
      <section className="library-hero generator-hero">
        <div>
          <p className="eyebrow">Generate</p>
          <h1>生成歌单</h1>
          <p className="summary">选择生成目标和分类维度，先得到一版可保存的歌单草稿。</p>
        </div>
        <div className="library-count">
          <strong>{isLoading ? '...' : songs.length}</strong>
          <span>首参与生成</span>
        </div>
      </section>

      {songs.length === 0 ? (
        <section className="empty-workflow">
          <h2>曲库还是空的</h2>
          <p>先录入几首自己会唱的歌，或者加载示例数据快速体验。</p>
          <div className="action-row">
            <Link className="primary-link" to="/library">
              去添加歌曲
            </Link>
            <Link className="primary-link muted" to="/">
              加载示例数据
            </Link>
          </div>
        </section>
      ) : (
        <section className="generator-layout">
          <section className="tool-panel generator-form">
            <div>
              <p className="section-label">Config</p>
              <h2>生成配置</h2>
            </div>
            <label>
              歌单标题
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="例如：今晚点歌单"
              />
            </label>
            <label>
              副标题
              <input
                value={subtitle}
                onChange={(event) => setSubtitle(event.target.value)}
                placeholder="例如：2026-06-13 深夜场"
              />
            </label>
            <label>
              生成目标
              <select
                value={purpose}
                onChange={(event) => setPurpose(event.target.value as PlaylistPurpose)}
              >
                {purposeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              分类维度
              <select
                value={dimension}
                onChange={(event) => setDimension(event.target.value as CategoryDimension)}
              >
                {dimensionOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <button
              className="primary-button"
              disabled={!canSave || isSaving}
              type="button"
              onClick={handleSaveDraft}
            >
              {isSaving ? '保存中...' : '保存为草稿歌单'}
            </button>
            {message ? <p className="inline-message">{message}</p> : null}
          </section>

          <section className="tool-panel song-selector">
            <div>
              <p className="section-label">Songs</p>
              <h2>选择歌曲</h2>
            </div>
            <div className="filter-row">
              <select
                value={statusFilter}
                onChange={(event) => {
                  setStatusFilter(event.target.value as typeof statusFilter)
                  setSelectedSongIds(new Set())
                }}
              >
                <option value="all">全部状态</option>
                <option value="requestable">仅可点歌</option>
                <option value="practicing">仅练习中</option>
                <option value="paused">仅暂不唱</option>
              </select>
              <button className="secondary-button" type="button" onClick={toggleSelectAll}>
                {allSelected ? '取消全选' : '全选'}
              </button>
            </div>
            <div className="selector-meta">
              <span>
                已选 {selectedSongIds.size} / {filteredSongs.length} 首
              </span>
              {someSelected ? <span className="hint">部分选择</span> : null}
            </div>
            <div className="song-select-list">
              {filteredSongs.map((song) => (
                <label className="song-select-row" key={song.id}>
                  <input
                    checked={selectedSongIds.has(song.id)}
                    type="checkbox"
                    onChange={() => toggleSongSelection(song.id)}
                  />
                  <div className="song-select-info">
                    <strong>{song.title}</strong>
                    <span>{song.artist || '未填写歌手'}</span>
                  </div>
                  <span className="status-pill">{song.genre || '未分类'}</span>
                </label>
              ))}
            </div>
          </section>

          <section className="playlist-preview" aria-label="歌单分组预览">
            <div className="song-board-header">
              <div>
                <p className="section-label">Preview</p>
                <h2>{title || '未命名歌单'}</h2>
              </div>
              <span>{visibleGroups.length} 个分组</span>
            </div>
            <div className="preview-sections">
              {visibleGroups.map((group) => (
                <article className="preview-section" key={group.title}>
                  <header>
                    <strong>{group.title}</strong>
                    <span>{group.songs.length} 首</span>
                  </header>
                  <ol>
                    {group.songs.map((song) => (
                      <li key={song.id}>
                        <span>{song.title}</span>
                        <small>{song.artist || '未填写歌手'}</small>
                      </li>
                    ))}
                  </ol>
                </article>
              ))}
            </div>
          </section>
        </section>
      )}
    </main>
  )
}

export default GeneratePage
