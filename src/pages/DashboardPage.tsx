import { useState } from 'react'
import { Link } from 'react-router-dom'
import OnboardingPanel from '@/components/OnboardingPanel'
import { useAutoClearMessage } from '@/hooks/useAutoClearMessage'
import { useDatabaseStats } from '@/hooks/useDatabaseStats'
import { usePlaylists } from '@/hooks/usePlaylists'

function DashboardPage() {
  const { stats, isLoading } = useDatabaseStats()
  const { playlists } = usePlaylists()
  const [message, setMessage] = useState('')

  useAutoClearMessage(message, () => setMessage(''))

  const recentPlaylists = playlists.slice(0, 3)

  return (
    <main className="app-shell">
      <section className="hero-panel">
        <div>
          <p className="eyebrow">SongList Studio</p>
          <h1>个人歌曲库与歌单生成工具</h1>
          <p className="summary">
            管理自己会唱的歌，按场景和分类维度生成歌单，设置简洁背景，并保存历史发布记录。
          </p>
        </div>
        <section className="status-card" aria-label="本地数据统计">
          <span>当前曲库</span>
          <strong>{isLoading ? '...' : stats.songCount}</strong>
          <small>首歌曲</small>
        </section>
      </section>

      <section className="metric-grid" aria-label="项目基础状态">
        <article>
          <span>全部歌单</span>
          <strong>{isLoading ? '...' : stats.playlistCount}</strong>
        </article>
        <article>
          <span>已发布</span>
          <strong>{isLoading ? '...' : stats.publishedPlaylistCount}</strong>
        </article>
        <article>
          <span>待学事项</span>
          <strong>{isLoading ? '...' : stats.learningRequestCount}</strong>
        </article>
        <article>
          <span>可点歌</span>
          <strong>{isLoading ? '...' : stats.requestableSongCount}</strong>
        </article>
      </section>

      {stats.songCount === 0 && !isLoading ? <OnboardingPanel /> : null}

      <section className="workbench">
        <div>
          <p className="section-label">Quick Actions</p>
          <h2>快速操作</h2>
        </div>
        <div className="action-row">
          <Link className="primary-link" to="/library">
            添加歌曲
          </Link>
          <Link className="primary-link muted" to="/generate">
            生成歌单
          </Link>
          <Link className="primary-link muted" to="/learning">
            记待学歌曲
          </Link>
          <Link className="primary-link muted" to="/settings">
            备份数据
          </Link>
        </div>
      </section>

      {recentPlaylists.length > 0 ? (
        <section className="workbench">
          <div>
            <p className="section-label">Recent</p>
            <h2>最近的歌单</h2>
          </div>
          <div className="record-grid" style={{ marginTop: '12px' }}>
            {recentPlaylists.map((playlist) => (
              <article className="record-card" key={playlist.id}>
                <header>
                  <span className="status-pill">
                    {playlist.lifecycleStatus === 'published' ? '已发布' : '草稿'}
                  </span>
                  <small>
                    {playlist.publishedAt
                      ? new Date(playlist.publishedAt).toLocaleDateString('zh-CN')
                      : new Date(playlist.updatedAt).toLocaleDateString('zh-CN')}
                  </small>
                </header>
                <h2>{playlist.title}</h2>
                <p>{playlist.subtitle || '未填写副标题'}</p>
                <div className="action-row">
                  <Link className="primary-link" to={`/playlists/${playlist.id}`}>
                    打开
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {message ? <p className="inline-message">{message}</p> : null}
    </main>
  )
}

export default DashboardPage
