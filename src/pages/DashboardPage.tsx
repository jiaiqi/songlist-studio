import { Link } from 'react-router-dom'
import { useDatabaseStats } from '@/hooks/useDatabaseStats'

const nextSteps = [
  '建立我的曲库：单首添加和批量导入',
  '选择分类维度：歌手、风格、语言、情绪、字数',
  '生成歌单草稿：调整分组、排序和点歌规则',
  '发布到历史：保存缩略图、发布时间和复用入口',
]

function DashboardPage() {
  const { stats, isLoading } = useDatabaseStats()

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
          <span>本地曲库</span>
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
          <span>存储方式</span>
          <strong>IndexedDB</strong>
        </article>
      </section>

      <section className="workbench">
        <div>
          <p className="section-label">开发顺序</p>
          <h2>现在先把核心闭环搭稳</h2>
        </div>
        <ol className="step-list">
          {nextSteps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
        <div className="action-row">
          <Link className="primary-link" to="/library">
            进入我的曲库
          </Link>
          <Link className="doc-link" to="/docs">
            查看项目文档目录规则
          </Link>
        </div>
      </section>
    </main>
  )
}

export default DashboardPage
