import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { usePlaylists } from '@/hooks/usePlaylists'
import { duplicatePlaylist } from '@/lib/db'
import type { PlaylistLifecycleStatus } from '@/types'

const statusLabels: Record<PlaylistLifecycleStatus, string> = {
  draft: '草稿',
  published: '已发布',
  template: '模板',
}

function formatDate(timestamp?: number) {
  if (!timestamp) return '未发布'
  return new Intl.DateTimeFormat('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(timestamp)
}

function HistoryPage() {
  const navigate = useNavigate()
  const { isLoading, playlists, refresh } = usePlaylists()
  const [status, setStatus] = useState<'all' | PlaylistLifecycleStatus>('all')
  const [query, setQuery] = useState('')

  const filteredPlaylists = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    return playlists.filter((playlist) => {
      const matchesStatus = status === 'all' || playlist.lifecycleStatus === status
      const matchesQuery =
        !normalizedQuery ||
        playlist.title.toLowerCase().includes(normalizedQuery) ||
        playlist.subtitle?.toLowerCase().includes(normalizedQuery)

      return matchesStatus && matchesQuery
    })
  }, [playlists, query, status])

  async function handleDuplicate(id: string) {
    const playlist = await duplicatePlaylist(id)
    await refresh()
    if (playlist) navigate(`/playlists/${playlist.id}`)
  }

  return (
    <main className="app-shell">
      <section className="library-hero">
        <div>
          <p className="eyebrow">History</p>
          <h1>发布历史</h1>
          <p className="summary">查看之前保存的歌单，复制成新草稿，或者继续编辑未发布版本。</p>
        </div>
        <div className="library-count">
          <strong>{isLoading ? '...' : playlists.length}</strong>
          <span>个歌单记录</span>
        </div>
      </section>

      <section className="tool-panel compact-panel">
        <div className="filter-row">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="搜索歌单标题或副标题"
          />
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value as typeof status)}
          >
            <option value="all">全部状态</option>
            <option value="draft">草稿</option>
            <option value="published">已发布</option>
            <option value="template">模板</option>
          </select>
        </div>
      </section>

      {filteredPlaylists.length === 0 ? (
        <section className="empty-workflow">
          <h2>还没有歌单记录</h2>
          <p>先生成一个草稿，发布后会出现在这里。</p>
          <Link className="primary-link" to="/generate">
            去生成歌单
          </Link>
        </section>
      ) : (
        <section className="record-grid" aria-label="歌单历史列表">
          {filteredPlaylists.map((playlist) => (
            <article className="record-card" key={playlist.id}>
              <header>
                <span className="status-pill">{statusLabels[playlist.lifecycleStatus]}</span>
                <small>{formatDate(playlist.publishedAt || playlist.updatedAt)}</small>
              </header>
              <h2>{playlist.title}</h2>
              <p>{playlist.subtitle || '未填写副标题'}</p>
              <dl>
                <div>
                  <dt>分组</dt>
                  <dd>{playlist.sections.length}</dd>
                </div>
                <div>
                  <dt>歌曲</dt>
                  <dd>
                    {playlist.sections.reduce(
                      (total, section) => total + section.songIds.length,
                      0,
                    )}
                  </dd>
                </div>
                <div>
                  <dt>分类</dt>
                  <dd>{playlist.categoryDimension}</dd>
                </div>
              </dl>
              <div className="action-row">
                <Link className="primary-link" to={`/playlists/${playlist.id}`}>
                  打开
                </Link>
                <button
                  className="secondary-button"
                  type="button"
                  onClick={() => handleDuplicate(playlist.id)}
                >
                  复制编辑
                </button>
              </div>
            </article>
          ))}
        </section>
      )}
    </main>
  )
}

export default HistoryPage
