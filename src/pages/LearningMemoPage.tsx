import { useState } from 'react'
import { useLearningRequests } from '@/hooks/useLearningRequests'
import {
  addLearningRequest,
  addSong,
  deleteLearningRequest,
  linkLearningRequestToSong,
  updateLearningRequest,
} from '@/lib/db'
import type { LearningRequest, LearningRequestStatus, SongDraft } from '@/types'

const statusLabels: Record<LearningRequestStatus, string> = {
  todo: '待学',
  practicing: '练习中',
  learned: '已学会',
  abandoned: '已放弃',
}

function formatDate(timestamp: number) {
  return new Intl.DateTimeFormat('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(timestamp)
}

function toDateTimeLocal(timestamp: number) {
  const date = new Date(timestamp)
  const offset = date.getTimezoneOffset() * 60_000
  return new Date(date.getTime() - offset).toISOString().slice(0, 16)
}

function fromDateTimeLocal(value: string) {
  return value ? new Date(value).getTime() : Date.now()
}

const defaultSongDraft = (request: LearningRequest): SongDraft => ({
  artist: request.artist,
  genre: undefined,
  language: undefined,
  mood: undefined,
  note: request.requesterName ? `来自学歌备忘录：${request.requesterName} 点歌` : '来自学歌备忘录',
  proficiency: 'rough',
  status: 'practicing',
  tags: ['学歌备忘录'],
  title: request.songTitle,
})

function LearningMemoPage() {
  const { filteredRequests, filters, isLoading, refresh, requests, setFilters } =
    useLearningRequests()
  const [songTitle, setSongTitle] = useState('')
  const [artist, setArtist] = useState('')
  const [requesterName, setRequesterName] = useState('')
  const [requestedAt, setRequestedAt] = useState(toDateTimeLocal(Date.now()))
  const [giftNote, setGiftNote] = useState('')
  const [note, setNote] = useState('')
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  async function handleAddRequest() {
    const normalizedTitle = songTitle.trim()
    if (!normalizedTitle) {
      setMessage('至少要填写歌名。')
      return
    }

    if (isSubmitting) return
    setIsSubmitting(true)

    try {
      await addLearningRequest({
        artist: artist.trim() || undefined,
        giftNote: giftNote.trim() || undefined,
        note: note.trim() || undefined,
        requesterName: requesterName.trim() || undefined,
        requestedAt: fromDateTimeLocal(requestedAt),
        songTitle: normalizedTitle,
        status: 'todo',
      })

      setSongTitle('')
      setArtist('')
      setRequesterName('')
      setGiftNote('')
      setNote('')
      setRequestedAt(toDateTimeLocal(Date.now()))
      setMessage(`已记录《${normalizedTitle}》。`)
      await refresh()
    } catch {
      setMessage('记录失败，请重试。')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleStatusChange(request: LearningRequest, status: LearningRequestStatus) {
    try {
      await updateLearningRequest(request.id, { status })
      await refresh()
    } catch {
      setMessage('状态更新失败，请重试。')
    }
  }

  async function handleAddToLibrary(request: LearningRequest) {
    try {
      const song = await addSong(defaultSongDraft(request))
      await linkLearningRequestToSong(request.id, song.id)
      setMessage(`已把《${song.title}》加入曲库。`)
      await refresh()
    } catch {
      setMessage('加入曲库失败，请重试。')
    }
  }

  async function handleDeleteRequest(id: string) {
    if (deletingId) return
    setDeletingId(id)
    try {
      await deleteLearningRequest(id)
      setMessage('已删除学歌记录。')
      await refresh()
    } catch {
      setMessage('删除失败，请重试。')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <main className="app-shell">
      <section className="library-hero">
        <div>
          <p className="eyebrow">Learning Memo</p>
          <h1>学歌备忘录</h1>
          <p className="summary">
            直播中有人刷礼物或留言要求学歌时，先快速记下来，之后再练习和入库。
          </p>
        </div>
        <div className="library-count">
          <strong>{isLoading ? '...' : requests.length}</strong>
          <span>条学歌记录</span>
        </div>
      </section>

      <section className="library-layout">
        <aside className="library-tools">
          <section className="tool-panel">
            <div>
              <p className="section-label">Quick Note</p>
              <h2>记一首待学歌</h2>
            </div>
            <label>
              歌名
              <input
                value={songTitle}
                onChange={(event) => setSongTitle(event.target.value)}
                placeholder="例如：晴天"
              />
            </label>
            <label>
              点歌人
              <input
                value={requesterName}
                onChange={(event) => setRequesterName(event.target.value)}
                placeholder="观众昵称"
              />
            </label>
            <label>
              记录时间
              <input
                type="datetime-local"
                value={requestedAt}
                onChange={(event) => setRequestedAt(event.target.value)}
              />
            </label>
            <label>
              歌手
              <input
                value={artist}
                onChange={(event) => setArtist(event.target.value)}
                placeholder="选填"
              />
            </label>
            <label>
              礼物或来源
              <input
                value={giftNote}
                onChange={(event) => setGiftNote(event.target.value)}
                placeholder="例如：嘉年华 / 直播间留言"
              />
            </label>
            <label>
              备注
              <textarea
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder="例如：学副歌、女生调、下周唱"
                rows={4}
              />
            </label>
            <button
              className="primary-button"
              disabled={isSubmitting}
              type="button"
              onClick={handleAddRequest}
            >
              {isSubmitting ? '保存中...' : '保存记录'}
            </button>
            {message ? <p className="inline-message">{message}</p> : null}
          </section>
        </aside>

        <section className="song-board">
          <div className="song-board-header">
            <div>
              <p className="section-label">Requests</p>
              <h2>待跟进歌曲</h2>
            </div>
            <span>{filteredRequests.length} 条</span>
          </div>
          <div className="filter-row">
            <input
              value={filters.query}
              onChange={(event) => setFilters({ ...filters, query: event.target.value })}
              placeholder="搜索歌名、歌手、点歌人"
            />
            <select
              value={filters.status}
              onChange={(event) =>
                setFilters({
                  ...filters,
                  status: event.target.value as typeof filters.status,
                })
              }
            >
              <option value="all">全部</option>
              <option value="todo">待学</option>
              <option value="practicing">练习中</option>
              <option value="learned">已学会</option>
              <option value="abandoned">已放弃</option>
            </select>
          </div>

          {filteredRequests.length === 0 ? (
            <div className="empty-state">还没有符合条件的学歌记录。</div>
          ) : (
            <div className="learning-list">
              {filteredRequests.map((request) => (
                <article className="learning-card" key={request.id}>
                  <header>
                    <div>
                      <strong>{request.songTitle}</strong>
                      <span>{request.artist || '未填写歌手'}</span>
                    </div>
                    <span className="status-pill">{statusLabels[request.status]}</span>
                  </header>
                  <dl>
                    <div>
                      <dt>点歌人</dt>
                      <dd>{request.requesterName || '未填写'}</dd>
                    </div>
                    <div>
                      <dt>时间</dt>
                      <dd>{formatDate(request.requestedAt)}</dd>
                    </div>
                    <div>
                      <dt>来源</dt>
                      <dd>{request.giftNote || '未填写'}</dd>
                    </div>
                  </dl>
                  {request.note ? <p>{request.note}</p> : null}
                  <div className="action-row">
                    <select
                      value={request.status}
                      onChange={(event) =>
                        handleStatusChange(request, event.target.value as LearningRequestStatus)
                      }
                    >
                      <option value="todo">待学</option>
                      <option value="practicing">练习中</option>
                      <option value="learned">已学会</option>
                      <option value="abandoned">已放弃</option>
                    </select>
                    <button
                      className="secondary-button"
                      disabled={Boolean(request.linkedSongId)}
                      type="button"
                      onClick={() => handleAddToLibrary(request)}
                    >
                      {request.linkedSongId ? '已加入曲库' : '加入曲库'}
                    </button>
                    <button
                      className="secondary-button danger"
                      disabled={deletingId === request.id}
                      type="button"
                      onClick={() => handleDeleteRequest(request.id)}
                    >
                      {deletingId === request.id ? '删除中...' : '删除'}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </section>
    </main>
  )
}

export default LearningMemoPage
