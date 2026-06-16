import { type FormEvent, useMemo, useState } from 'react'
import ConfirmDialog from '@/components/ConfirmDialog'
import EmptyState from '@/components/EmptyState'
import { useAutoClearMessage } from '@/hooks/useAutoClearMessage'
import { useSongs } from '@/hooks/useSongs'
import {
  addLearningRequest,
  addSong,
  addSongs,
  deleteSong,
  deleteSongs,
  seedSampleData,
  updateSong,
} from '@/lib/db'
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
  const [editingSongId, setEditingSongId] = useState<string | null>(null)
  const [editDraft, setEditDraft] = useState<SongDraft | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Song | null>(null)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [showBatchDeleteConfirm, setShowBatchDeleteConfirm] = useState(false)
  const [showLearningPrompt, setShowLearningPrompt] = useState(false)
  const [lastAddedSong, setLastAddedSong] = useState<Song | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isBulkImporting, setIsBulkImporting] = useState(false)
  const [isSavingEdit, setIsSavingEdit] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isBatchDeleting, setIsBatchDeleting] = useState(false)
  const [isLoadingSample, setIsLoadingSample] = useState(false)
  const [isBatchUpdating, setIsBatchUpdating] = useState(false)
  const [batchStatusTarget, setBatchStatusTarget] = useState<Song['status'] | null>(null)

  useAutoClearMessage(message, () => setMessage(''))

  const parsedSongs = useMemo(() => parseSongImport(bulkText), [bulkText])

  async function handleAddSong(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const title = singleSong.title.trim()

    if (!title) {
      setMessage('歌名不能为空。')
      return
    }

    if (isSubmitting) return
    setIsSubmitting(true)

    const duplicate = songs.find(
      (s) =>
        s.title.toLowerCase() === title.toLowerCase() &&
        s.artist?.toLowerCase() === singleSong.artist?.trim().toLowerCase(),
    )
    if (duplicate) {
      setMessage(`《${title}》可能已存在于曲库（歌手：${duplicate.artist || '未填写'}）。`)
      setIsSubmitting(false)
      return
    }

    try {
      const song = await addSong({
        ...singleSong,
        title,
        artist: singleSong.artist?.trim() || undefined,
        genre: singleSong.genre?.trim() || undefined,
        language: singleSong.language?.trim() || undefined,
        mood: singleSong.mood?.trim() || undefined,
      })
      setSingleSong(createSongDraft(''))
      setMessage(`已添加《${title}》。`)
      if (singleSong.status === 'practicing') {
        setLastAddedSong(song)
        setShowLearningPrompt(true)
      }
      await refresh()
    } catch (error) {
      console.error(error)
      setMessage('添加歌曲失败，请重试。')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleBulkImport() {
    if (parsedSongs.length === 0) {
      setMessage('没有识别到可导入的歌曲。')
      return
    }

    if (isBulkImporting) return
    setIsBulkImporting(true)

    const existingTitles = new Set(songs.map((s) => s.title.toLowerCase()))
    const newSongs = parsedSongs.filter((s) => !existingTitles.has(s.title.toLowerCase()))
    const skippedCount = parsedSongs.length - newSongs.length

    if (newSongs.length === 0) {
      setMessage(`所有 ${parsedSongs.length} 首歌曲都已存在于曲库，未导入。`)
      setIsBulkImporting(false)
      return
    }

    try {
      await addSongs(newSongs)
      setBulkText('')
      setMessage(
        `已导入 ${newSongs.length} 首新歌曲${skippedCount > 0 ? `，跳过 ${skippedCount} 首重复` : ''}。`,
      )
      await refresh()
    } catch (error) {
      console.error(error)
      setMessage('批量导入失败，请重试。')
    } finally {
      setIsBulkImporting(false)
    }
  }

  function handleStartEdit(song: Song) {
    setEditingSongId(song.id)
    setEditDraft({
      artist: song.artist,
      genre: song.genre,
      language: song.language,
      mood: song.mood,
      note: song.note,
      proficiency: song.proficiency,
      status: song.status,
      tags: song.tags,
      title: song.title,
    })
    setMessage('')
  }

  function handleCancelEdit() {
    setEditingSongId(null)
    setEditDraft(null)
  }

  async function handleSaveEdit() {
    if (!editingSongId || !editDraft) return
    const title = editDraft.title.trim()
    if (!title) {
      setMessage('歌名不能为空。')
      return
    }

    if (isSavingEdit) return
    setIsSavingEdit(true)

    try {
      await updateSong(editingSongId, {
        ...editDraft,
        title,
        artist: editDraft.artist?.trim() || undefined,
        genre: editDraft.genre?.trim() || undefined,
        language: editDraft.language?.trim() || undefined,
        mood: editDraft.mood?.trim() || undefined,
      })
      setEditingSongId(null)
      setEditDraft(null)
      setMessage(`已更新《${title}》。`)
      await refresh()
    } catch (error) {
      console.error(error)
      setMessage('更新失败，请重试。')
    } finally {
      setIsSavingEdit(false)
    }
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) return
    if (isDeleting) return
    setIsDeleting(true)
    try {
      await deleteSong(deleteTarget.id)
      setMessage(`已删除《${deleteTarget.title}》。`)
      setDeleteTarget(null)
      await refresh()
    } catch (error) {
      console.error(error)
      setMessage('删除失败，请重试。')
    } finally {
      setIsDeleting(false)
    }
  }

  function toggleSelection(songId: string) {
    const next = new Set(selectedIds)
    if (next.has(songId)) {
      next.delete(songId)
    } else {
      next.add(songId)
    }
    setSelectedIds(next)
  }

  function selectAll() {
    if (selectedIds.size === filteredSongs.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(filteredSongs.map((s) => s.id)))
    }
  }

  async function handleBatchDelete() {
    if (selectedIds.size === 0) return
    if (isBatchDeleting) return
    setIsBatchDeleting(true)
    try {
      await deleteSongs(Array.from(selectedIds))
      setMessage(`已批量删除 ${selectedIds.size} 首歌曲。`)
      setSelectedIds(new Set())
      setShowBatchDeleteConfirm(false)
      await refresh()
    } catch (error) {
      console.error(error)
      setMessage('批量删除失败，请重试。')
    } finally {
      setIsBatchDeleting(false)
    }
  }

  function handleBatchStatusChange(status: Song['status']) {
    if (selectedIds.size === 0) return
    setBatchStatusTarget(status)
  }

  async function handleConfirmBatchStatusChange() {
    if (!batchStatusTarget || selectedIds.size === 0) return
    if (isBatchUpdating) return
    setIsBatchUpdating(true)
    try {
      await Promise.all(
        Array.from(selectedIds).map((id) => updateSong(id, { status: batchStatusTarget })),
      )
      setMessage(`已批量更新 ${selectedIds.size} 首歌曲的状态。`)
      setSelectedIds(new Set())
      setBatchStatusTarget(null)
      await refresh()
    } catch (error) {
      console.error(error)
      setMessage('批量更新失败，请重试。')
    } finally {
      setIsBatchUpdating(false)
    }
  }

  async function handleAddToLearningMemo() {
    if (!lastAddedSong) return
    try {
      await addLearningRequest({
        artist: lastAddedSong.artist,
        requestedAt: Date.now(),
        songTitle: lastAddedSong.title,
        status: 'practicing',
      })
      setShowLearningPrompt(false)
      setLastAddedSong(null)
      setMessage(`已把《${lastAddedSong.title}》加入学歌备忘录。`)
    } catch (error) {
      console.error(error)
      setMessage('加入学歌备忘录失败，请重试。')
    }
  }

  async function handleLoadSampleData() {
    if (isLoadingSample) return
    setIsLoadingSample(true)
    try {
      const songs = await seedSampleData()
      setMessage(`已加载 ${songs.length} 首示例歌曲。`)
      await refresh()
    } catch (error) {
      console.error(error)
      setMessage('加载示例数据失败，请重试。')
    } finally {
      setIsLoadingSample(false)
    }
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
            <button className="primary-button" disabled={isSubmitting} type="submit">
              {isSubmitting ? '添加中...' : '添加到曲库'}
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
              <button
                className="secondary-button"
                disabled={isBulkImporting}
                type="button"
                onClick={handleBulkImport}
              >
                {isBulkImporting ? '导入中...' : '批量导入'}
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
            <div className="header-actions">
              {filteredSongs.length > 0 ? (
                <label className="select-all-label">
                  <input
                    checked={selectedIds.size === filteredSongs.length && filteredSongs.length > 0}
                    type="checkbox"
                    onChange={selectAll}
                  />
                  全选
                </label>
              ) : null}
              <span>{isLoading ? '读取中...' : `${filteredSongs.length} / ${songs.length}`}</span>
            </div>
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

          <div className="filter-row advanced-filters">
            <input
              value={filters.genre}
              onChange={(event) => setFilters({ ...filters, genre: event.target.value })}
              placeholder="筛选风格"
            />
            <input
              value={filters.language}
              onChange={(event) => setFilters({ ...filters, language: event.target.value })}
              placeholder="筛选语言"
            />
            <input
              value={filters.mood}
              onChange={(event) => setFilters({ ...filters, mood: event.target.value })}
              placeholder="筛选情绪"
            />
            <select
              value={filters.proficiency}
              onChange={(event) =>
                setFilters({
                  ...filters,
                  proficiency: event.target.value as typeof filters.proficiency,
                })
              }
            >
              <option value="all">全部熟练度</option>
              <option value="beginner">初学</option>
              <option value="intermediate">熟练</option>
              <option value="advanced">精通</option>
            </select>
            <button
              className="icon-button"
              type="button"
              onClick={() =>
                setFilters({
                  genre: '',
                  language: '',
                  mood: '',
                  proficiency: 'all',
                  query: '',
                  status: 'all',
                })
              }
            >
              重置
            </button>
          </div>

          {selectedIds.size > 0 ? (
            <div className="batch-bar">
              <span>已选 {selectedIds.size} 首</span>
              <div className="batch-actions">
                <button
                  className="secondary-button"
                  type="button"
                  onClick={() => handleBatchStatusChange('requestable')}
                >
                  设为可点歌
                </button>
                <button
                  className="secondary-button"
                  type="button"
                  onClick={() => handleBatchStatusChange('practicing')}
                >
                  设为练习中
                </button>
                <button
                  className="secondary-button"
                  type="button"
                  onClick={() => handleBatchStatusChange('paused')}
                >
                  设为暂不唱
                </button>
                <button
                  className="secondary-button danger"
                  type="button"
                  onClick={() => setShowBatchDeleteConfirm(true)}
                >
                  批量删除
                </button>
                <button
                  className="icon-button"
                  type="button"
                  onClick={() => setSelectedIds(new Set())}
                >
                  清除
                </button>
              </div>
            </div>
          ) : null}

          {message ? <p className="inline-message">{message}</p> : null}

          <div className="song-list">
            {filteredSongs.map((song) => (
              <article
                className={editingSongId === song.id ? 'song-row editing' : 'song-row'}
                key={song.id}
              >
                {editingSongId === song.id && editDraft ? (
                  <div className="song-edit-form">
                    <div className="field-grid">
                      <label>
                        歌名
                        <input
                          value={editDraft.title}
                          onChange={(event) =>
                            setEditDraft({ ...editDraft, title: event.target.value })
                          }
                        />
                      </label>
                      <label>
                        歌手
                        <input
                          value={editDraft.artist ?? ''}
                          onChange={(event) =>
                            setEditDraft({ ...editDraft, artist: event.target.value })
                          }
                        />
                      </label>
                      <label>
                        状态
                        <select
                          value={editDraft.status}
                          onChange={(event) =>
                            setEditDraft({
                              ...editDraft,
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
                    <div className="field-grid">
                      <label>
                        风格
                        <input
                          value={editDraft.genre ?? ''}
                          onChange={(event) =>
                            setEditDraft({ ...editDraft, genre: event.target.value })
                          }
                          placeholder="流行"
                        />
                      </label>
                      <label>
                        语言
                        <input
                          value={editDraft.language ?? ''}
                          onChange={(event) =>
                            setEditDraft({ ...editDraft, language: event.target.value })
                          }
                          placeholder="国语"
                        />
                      </label>
                      <label>
                        情绪
                        <input
                          value={editDraft.mood ?? ''}
                          onChange={(event) =>
                            setEditDraft({ ...editDraft, mood: event.target.value })
                          }
                          placeholder="热场"
                        />
                      </label>
                    </div>
                    <div className="row-actions">
                      <button
                        className="primary-button"
                        disabled={isSavingEdit}
                        type="button"
                        onClick={handleSaveEdit}
                      >
                        {isSavingEdit ? '保存中...' : '保存'}
                      </button>
                      <button
                        className="secondary-button"
                        disabled={isSavingEdit}
                        type="button"
                        onClick={handleCancelEdit}
                      >
                        取消
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="song-row-main">
                      <input
                        checked={selectedIds.has(song.id)}
                        type="checkbox"
                        onChange={() => toggleSelection(song.id)}
                      />
                      <div>
                        <strong>{song.title}</strong>
                        <span>{song.artist || '未填写歌手'}</span>
                      </div>
                    </div>
                    <div className="tag-line">
                      <span>{song.genre || '未分类'}</span>
                      <span>{song.language || '未设置语言'}</span>
                      <span>{song.mood || '未设置情绪'}</span>
                      <span>{statusLabels[song.status]}</span>
                    </div>
                    <div className="row-actions">
                      <button
                        className="icon-button"
                        type="button"
                        onClick={() => handleStartEdit(song)}
                      >
                        编辑
                      </button>
                      <button
                        className="icon-button danger"
                        type="button"
                        onClick={() => setDeleteTarget(song)}
                      >
                        删除
                      </button>
                    </div>
                  </>
                )}
              </article>
            ))}
            {!isLoading && filteredSongs.length === 0 ? (
              <EmptyState
                title="还没有匹配的歌曲。先添加几首，下一步才能生成歌单。"
                variant="inline"
              >
                {songs.length === 0 ? (
                  <button
                    className="secondary-button"
                    disabled={isLoadingSample}
                    style={{ marginTop: '12px' }}
                    type="button"
                    onClick={handleLoadSampleData}
                  >
                    {isLoadingSample ? '加载中...' : '加载示例歌曲'}
                  </button>
                ) : null}
              </EmptyState>
            ) : null}
          </div>
        </section>
      </section>

      <ConfirmDialog
        isOpen={deleteTarget !== null}
        title="确认删除"
        message={deleteTarget ? `确定要删除《${deleteTarget.title}》吗？此操作不可撤销。` : ''}
        confirmLabel="删除"
        confirmDisabled={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      <ConfirmDialog
        isOpen={showBatchDeleteConfirm}
        title="确认批量删除"
        message={`确定要删除选中的 ${selectedIds.size} 首歌曲吗？此操作不可撤销。`}
        confirmLabel="批量删除"
        confirmDisabled={isBatchDeleting}
        onConfirm={handleBatchDelete}
        onCancel={() => setShowBatchDeleteConfirm(false)}
      />

      <ConfirmDialog
        isOpen={showLearningPrompt}
        title="加入学歌备忘录？"
        message={`你刚添加了《${lastAddedSong?.title}》并标记为"练习中"。是否同时加入学歌备忘录以便跟踪学习进度？`}
        confirmLabel="加入备忘录"
        cancelLabel="暂不"
        onConfirm={handleAddToLearningMemo}
        onCancel={() => {
          setShowLearningPrompt(false)
          setLastAddedSong(null)
        }}
      />
      <ConfirmDialog
        isOpen={batchStatusTarget !== null}
        title="确认批量修改状态"
        message={`确定要将选中的 ${selectedIds.size} 首歌曲的状态改为"${batchStatusTarget ? statusLabels[batchStatusTarget] : ''}"吗？`}
        confirmLabel="确认修改"
        confirmDisabled={isBatchUpdating}
        onConfirm={handleConfirmBatchStatusChange}
        onCancel={() => setBatchStatusTarget(null)}
      />
    </main>
  )
}

export default LibraryPage
