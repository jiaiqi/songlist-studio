import { useState } from 'react'
import { Link } from 'react-router-dom'
import ConfirmDialog from '@/components/ConfirmDialog'
import { clearAllData, db, listLearningRequests, listPlaylists, listSongs } from '@/lib/db'

function SettingsPage() {
  const [message, setMessage] = useState('')
  const [showClearConfirm, setShowClearConfirm] = useState(false)

  async function handleExport() {
    try {
      const [songs, playlists, learningRequests] = await Promise.all([
        listSongs(),
        listPlaylists(),
        listLearningRequests(),
      ])

      const backup = {
        exportedAt: Date.now(),
        learningRequests,
        playlists,
        songs,
        version: 1,
      }

      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.download = `songlist-studio-backup-${new Date().toISOString().slice(0, 10)}.json`
      link.href = url
      link.click()
      URL.revokeObjectURL(url)
      setMessage('数据已导出。')
    } catch {
      setMessage('导出失败。')
    }
  }

  async function handleImport(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const text = await file.text()
      const backup = JSON.parse(text)

      if (!backup.songs || !Array.isArray(backup.songs)) {
        setMessage('备份文件格式不正确。')
        return
      }

      await db.transaction('rw', db.songs, db.playlists, db.learningRequests, async () => {
        await db.songs.clear()
        await db.playlists.clear()
        await db.learningRequests.clear()

        if (backup.songs.length > 0) await db.songs.bulkAdd(backup.songs)
        if (backup.playlists?.length > 0) await db.playlists.bulkAdd(backup.playlists)
        if (backup.learningRequests?.length > 0) {
          await db.learningRequests.bulkAdd(backup.learningRequests)
        }
      })

      setMessage(
        `数据已恢复：${backup.songs.length} 首歌曲${backup.playlists?.length ? `、${backup.playlists.length} 个歌单` : ''}。`,
      )
    } catch {
      setMessage('恢复失败，请检查备份文件格式。')
    } finally {
      event.target.value = ''
    }
  }

  async function handleClearAll() {
    await clearAllData()
    setShowClearConfirm(false)
    setMessage('所有本地数据已清空。')
  }

  return (
    <main className="app-shell">
      <section className="library-hero">
        <div>
          <p className="eyebrow">Settings</p>
          <h1>设置</h1>
          <p className="summary">数据备份、恢复和本地存储管理。</p>
        </div>
      </section>

      <section className="settings-section">
        <article className="settings-card">
          <h3>数据备份</h3>
          <p>将曲库、歌单和学歌记录导出为 JSON 文件，保存在本地。</p>
          <button className="primary-button" type="button" onClick={handleExport}>
            导出全部数据
          </button>
        </article>

        <article className="settings-card">
          <h3>数据恢复</h3>
          <p>从之前导出的 JSON 备份文件恢复数据。恢复会覆盖当前所有数据。</p>
          <label>
            选择备份文件
            <input accept=".json,application/json" type="file" onChange={handleImport} />
          </label>
        </article>

        <article className="settings-card danger-zone">
          <h3>危险区域</h3>
          <p>清空所有本地数据，包括歌曲、歌单和学歌记录。此操作不可撤销。</p>
          <button
            className="primary-button danger"
            type="button"
            onClick={() => setShowClearConfirm(true)}
          >
            清空全部数据
          </button>
        </article>

        {message ? <p className="inline-message">{message}</p> : null}

        <div className="action-row">
          <Link className="primary-link" to="/">
            返回工作台
          </Link>
        </div>
      </section>

      <ConfirmDialog
        isOpen={showClearConfirm}
        title="确认清空数据"
        message="确定要清空所有本地数据吗？包括歌曲、歌单和学歌记录。此操作不可撤销。"
        confirmLabel="清空"
        onConfirm={handleClearAll}
        onCancel={() => setShowClearConfirm(false)}
      />
    </main>
  )
}

export default SettingsPage
