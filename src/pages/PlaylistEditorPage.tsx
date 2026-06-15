import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { getPlaylist, listSongs, publishPlaylist, updatePlaylist } from '@/lib/db'
import type { Playlist, Song } from '@/types'

function formatStatus(status: Playlist['lifecycleStatus']) {
  if (status === 'published') return '已发布'
  if (status === 'template') return '模板'
  return '草稿'
}

function PlaylistEditorPage() {
  const navigate = useNavigate()
  const { playlistId } = useParams()
  const [playlist, setPlaylist] = useState<Playlist>()
  const [songs, setSongs] = useState<Song[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [message, setMessage] = useState('')

  const songMap = useMemo(() => new Map(songs.map((song) => [song.id, song])), [songs])

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
            <button className="secondary-button" type="button" onClick={() => navigate('/history')}>
              返回历史
            </button>
          </div>
          {message ? <p className="inline-message">{message}</p> : null}
        </section>

        <section className="playlist-preview" aria-label="歌单发布预览">
          <div className="song-board-header">
            <div>
              <p className="section-label">Preview</p>
              <h2>{playlist.title}</h2>
            </div>
            <span>{playlist.sections.length} 个分组</span>
          </div>
          <p className="preview-subtitle">{playlist.subtitle || '未填写副标题'}</p>
          <div className="preview-rules">{playlist.rulesText || '未填写点歌规则'}</div>
          <div className="preview-sections">
            {playlist.sections
              .filter((section) => !section.hidden)
              .sort((a, b) => a.order - b.order)
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
