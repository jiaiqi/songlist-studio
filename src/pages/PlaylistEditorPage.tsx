import type { CSSProperties } from 'react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { getPlaylist, listSongs, publishPlaylist, updatePlaylist } from '@/lib/db'
import type { BackgroundConfig, Playlist, PlaylistSection, Song } from '@/types'

function formatStatus(status: Playlist['lifecycleStatus']) {
  if (status === 'published') return '已发布'
  if (status === 'template') return '模板'
  return '草稿'
}

function normalizeSections(sections: PlaylistSection[]) {
  return [...sections]
    .sort((a, b) => a.order - b.order)
    .map((section, index) => ({ ...section, order: index }))
}

function moveItem<T>(items: T[], fromIndex: number, toIndex: number) {
  if (toIndex < 0 || toIndex >= items.length) return items
  const nextItems = [...items]
  const [item] = nextItems.splice(fromIndex, 1)
  nextItems.splice(toIndex, 0, item)
  return nextItems
}

function getPreviewBackgroundStyle(background: BackgroundConfig): CSSProperties {
  if (background.type === 'gradient') {
    return { background: background.value }
  }

  if (background.type === 'image') {
    return {
      backgroundImage: `linear-gradient(rgba(255,255,255,${background.opacity ?? 0.82}), rgba(255,255,255,${
        background.opacity ?? 0.82
      })), url("${background.value}")`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    }
  }

  return { background: background.value }
}

function PlaylistEditorPage() {
  const navigate = useNavigate()
  const { playlistId } = useParams()
  const [playlist, setPlaylist] = useState<Playlist>()
  const [songs, setSongs] = useState<Song[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [message, setMessage] = useState('')

  const songMap = useMemo(() => new Map(songs.map((song) => [song.id, song])), [songs])
  const orderedSections = useMemo(
    () => normalizeSections(playlist?.sections ?? []),
    [playlist?.sections],
  )

  const loadPlaylist = useCallback(async () => {
    if (!playlistId) return
    setIsLoading(true)
    const [nextPlaylist, nextSongs] = await Promise.all([getPlaylist(playlistId), listSongs()])
    setPlaylist(nextPlaylist)
    setSongs(nextSongs)
    setIsLoading(false)
  }, [playlistId])

  useEffect(() => {
    loadPlaylist()
  }, [loadPlaylist])

  async function handleSave() {
    if (!playlist) return
    if (!playlist.title.trim()) {
      setMessage('歌单标题不能为空。')
      return
    }

    await updatePlaylist(playlist.id, {
      ...playlist,
      title: playlist.title.trim(),
      subtitle: playlist.subtitle?.trim() || undefined,
      rulesText: playlist.rulesText?.trim() || undefined,
    })
    await loadPlaylist()
    setMessage('已保存当前歌单。')
  }

  async function handlePublish() {
    if (!playlist) return
    if (!playlist.title.trim()) {
      setMessage('发布前需要填写歌单标题。')
      return
    }

    await handleSave()
    await publishPlaylist(playlist.id)
    await loadPlaylist()
    setMessage('已发布到历史歌单。')
  }

  function updateSections(sections: PlaylistSection[]) {
    if (!playlist) return
    setPlaylist({ ...playlist, sections: normalizeSections(sections) })
  }

  function updateSectionTitle(sectionId: string, title: string) {
    updateSections(
      orderedSections.map((section) =>
        section.id === sectionId ? { ...section, title } : section,
      ),
    )
  }

  function toggleSection(sectionId: string) {
    updateSections(
      orderedSections.map((section) =>
        section.id === sectionId ? { ...section, hidden: !section.hidden } : section,
      ),
    )
  }

  function moveSection(sectionId: string, direction: -1 | 1) {
    const fromIndex = orderedSections.findIndex((section) => section.id === sectionId)
    updateSections(moveItem(orderedSections, fromIndex, fromIndex + direction))
  }

  function moveSong(sectionId: string, songId: string, direction: -1 | 1) {
    updateSections(
      orderedSections.map((section) => {
        if (section.id !== sectionId) return section
        const fromIndex = section.songIds.indexOf(songId)
        return {
          ...section,
          songIds: moveItem(section.songIds, fromIndex, fromIndex + direction),
        }
      }),
    )
  }

  function removeSong(sectionId: string, songId: string) {
    updateSections(
      orderedSections.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              songIds: section.songIds.filter((currentSongId) => currentSongId !== songId),
            }
          : section,
      ),
    )
  }

  function updateBackground(background: BackgroundConfig) {
    if (!playlist) return
    setPlaylist({ ...playlist, background })
  }

  if (isLoading) {
    return (
      <main className="app-shell">
        <section className="empty-workflow">
          <h2>正在打开歌单</h2>
          <p>读取本地草稿和曲库歌曲。</p>
        </section>
      </main>
    )
  }

  if (!playlist) {
    return (
      <main className="app-shell">
        <section className="empty-workflow">
          <h2>没有找到这个歌单</h2>
          <p>它可能已经被删除，或者本地数据库没有这条记录。</p>
          <Link className="primary-link" to="/history">
            返回发布历史
          </Link>
        </section>
      </main>
    )
  }

  return (
    <main className="app-shell">
      <section className="library-hero generator-hero">
        <div>
          <p className="eyebrow">Editor</p>
          <h1>歌单编辑器</h1>
          <p className="summary">调整标题、说明和点歌规则，确认后发布到历史歌单。</p>
        </div>
        <div className="library-count">
          <strong>{formatStatus(playlist.lifecycleStatus)}</strong>
          <span>当前状态</span>
        </div>
      </section>

      <section className="generator-layout editor-layout">
        <div className="editor-controls">
          <section className="tool-panel generator-form">
            <div>
              <p className="section-label">Playlist</p>
              <h2>基础信息</h2>
            </div>
            <label>
              歌单标题
              <input
                value={playlist.title}
                onChange={(event) => setPlaylist({ ...playlist, title: event.target.value })}
              />
            </label>
            <label>
              副标题
              <input
                value={playlist.subtitle ?? ''}
                onChange={(event) => setPlaylist({ ...playlist, subtitle: event.target.value })}
                placeholder="例如：今晚 20:00 直播场"
              />
            </label>
            <label>
              点歌规则
              <textarea
                value={playlist.rulesText ?? ''}
                onChange={(event) => setPlaylist({ ...playlist, rulesText: event.target.value })}
                placeholder="例如：点歌前请先确认歌单状态"
                rows={5}
              />
            </label>
            <div className="action-row">
              <button className="primary-button" type="button" onClick={handleSave}>
                保存
              </button>
              <button className="secondary-button" type="button" onClick={handlePublish}>
                发布到历史
              </button>
              <button
                className="secondary-button"
                type="button"
                onClick={() => navigate('/history')}
              >
                返回历史
              </button>
            </div>
            {message ? <p className="inline-message">{message}</p> : null}
          </section>

          <section className="tool-panel background-panel">
            <div>
              <p className="section-label">Background</p>
              <h2>背景设置</h2>
            </div>
            <label>
              背景类型
              <select
                value={playlist.background.type}
                onChange={(event) =>
                  updateBackground({
                    ...playlist.background,
                    type: event.target.value as BackgroundConfig['type'],
                    value:
                      event.target.value === 'gradient'
                        ? 'linear-gradient(135deg, #fff7df 0%, #ffd7c2 100%)'
                        : playlist.background.value,
                  })
                }
              >
                <option value="solid">纯色</option>
                <option value="gradient">渐变</option>
                <option value="image">图片地址</option>
              </select>
            </label>
            <label>
              背景值
              <input
                value={playlist.background.value}
                onChange={(event) =>
                  updateBackground({ ...playlist.background, value: event.target.value })
                }
                placeholder={
                  playlist.background.type === 'image'
                    ? 'https://...'
                    : playlist.background.type === 'gradient'
                      ? 'linear-gradient(...)'
                      : '#FFFDF7'
                }
              />
            </label>
            {playlist.background.type === 'image' ? (
              <label>
                背景压暗
                <input
                  max="0.95"
                  min="0.3"
                  step="0.05"
                  type="range"
                  value={playlist.background.opacity ?? 0.82}
                  onChange={(event) =>
                    updateBackground({
                      ...playlist.background,
                      opacity: Number(event.target.value),
                    })
                  }
                />
              </label>
            ) : null}
          </section>

          <section className="tool-panel section-editor">
            <div>
              <p className="section-label">Sections</p>
              <h2>分组整理</h2>
            </div>
            {orderedSections.map((section, sectionIndex) => (
              <article className="section-edit-card" key={section.id}>
                <header>
                  <label>
                    分组名
                    <input
                      value={section.title}
                      onChange={(event) => updateSectionTitle(section.id, event.target.value)}
                    />
                  </label>
                  <span className={section.hidden ? 'status-pill muted-pill' : 'status-pill'}>
                    {section.hidden ? '已隐藏' : '显示中'}
                  </span>
                </header>
                <div className="section-actions">
                  <button
                    className="secondary-button"
                    disabled={sectionIndex === 0}
                    type="button"
                    onClick={() => moveSection(section.id, -1)}
                  >
                    上移
                  </button>
                  <button
                    className="secondary-button"
                    disabled={sectionIndex === orderedSections.length - 1}
                    type="button"
                    onClick={() => moveSection(section.id, 1)}
                  >
                    下移
                  </button>
                  <button
                    className="secondary-button"
                    type="button"
                    onClick={() => toggleSection(section.id)}
                  >
                    {section.hidden ? '显示' : '隐藏'}
                  </button>
                </div>
                <div className="song-edit-list">
                  {section.songIds.map((songId, songIndex) => {
                    const song = songMap.get(songId)
                    return (
                      <div className="song-edit-row" key={songId}>
                        <div>
                          <strong>{song?.title ?? '已从曲库移除的歌曲'}</strong>
                          <span>{song?.artist || '未填写歌手'}</span>
                        </div>
                        <div>
                          <button
                            className="icon-button"
                            disabled={songIndex === 0}
                            type="button"
                            onClick={() => moveSong(section.id, songId, -1)}
                          >
                            ↑
                          </button>
                          <button
                            className="icon-button"
                            disabled={songIndex === section.songIds.length - 1}
                            type="button"
                            onClick={() => moveSong(section.id, songId, 1)}
                          >
                            ↓
                          </button>
                          <button
                            className="icon-button danger"
                            type="button"
                            onClick={() => removeSong(section.id, songId)}
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </article>
            ))}
          </section>
        </div>

        <section
          className="playlist-preview export-preview"
          aria-label="歌单发布预览"
          style={getPreviewBackgroundStyle(playlist.background)}
        >
          <div className="song-board-header">
            <div>
              <p className="section-label">Preview</p>
              <h2>{playlist.title}</h2>
            </div>
            <span>{orderedSections.filter((section) => !section.hidden).length} 个可见分组</span>
          </div>
          <p className="preview-subtitle">{playlist.subtitle || '未填写副标题'}</p>
          <div className="preview-rules">{playlist.rulesText || '未填写点歌规则'}</div>
          <div className="preview-sections">
            {orderedSections
              .filter((section) => !section.hidden)
              .map((section) => (
                <article className="preview-section" key={section.id}>
                  <header>
                    <strong>{section.title}</strong>
                    <span>{section.songIds.length} 首</span>
                  </header>
                  <ol>
                    {section.songIds.map((songId) => {
                      const song = songMap.get(songId)
                      return (
                        <li key={songId}>
                          <span>{song?.title ?? '已从曲库移除的歌曲'}</span>
                          <small>{song?.artist || '未填写歌手'}</small>
                        </li>
                      )
                    })}
                  </ol>
                </article>
              ))}
          </div>
        </section>
      </section>
    </main>
  )
}

export default PlaylistEditorPage
