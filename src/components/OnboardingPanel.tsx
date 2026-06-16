import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { addPlaylist, seedSampleData } from '@/lib/db'
import { buildPlaylistDraft } from '@/lib/playlistBuilder'
import {
  sampleDimension,
  samplePlaylistSubtitle,
  samplePlaylistTitle,
  samplePurpose,
} from '@/lib/sampleData'

function OnboardingPanel() {
  const navigate = useNavigate()
  const [isSeeding, setIsSeeding] = useState(false)
  const [message, setMessage] = useState('')

  async function handleLoadSampleData() {
    if (isSeeding) return

    setIsSeeding(true)
    setMessage('')

    try {
      const songs = await seedSampleData()
      const playlist = await addPlaylist(
        buildPlaylistDraft({
          title: samplePlaylistTitle,
          subtitle: samplePlaylistSubtitle,
          purpose: samplePurpose,
          dimension: sampleDimension,
          songs,
        }),
      )

      navigate(`/playlists/${playlist.id}`)
    } catch {
      setMessage('加载示例数据失败，请刷新后重试。')
      setIsSeeding(false)
    }
  }

  return (
    <section className="tool-panel onboarding-panel">
      <div>
        <p className="section-label">Quick Start</p>
        <h2>3 分钟生成你的第一张歌单</h2>
        <p className="summary compact">
          曲库还是空的。你可以加载一组示例歌曲，系统会自动生成一份可编辑的歌单草稿，立刻进入编辑器预览和导出。
        </p>
      </div>

      <div className="action-row">
        <button
          className="primary-button"
          disabled={isSeeding}
          type="button"
          onClick={handleLoadSampleData}
        >
          {isSeeding ? '正在加载示例数据...' : '加载示例歌曲并生成歌单'}
        </button>
        <Link className="primary-link muted" to="/library">
          手动添加歌曲
        </Link>
      </div>

      <p className="onboarding-note">示例数据仅保存在本地浏览器，可随时清除。</p>

      {message ? <p className="inline-message">{message}</p> : null}
    </section>
  )
}

export default OnboardingPanel
