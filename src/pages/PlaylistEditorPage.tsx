import { toPng } from 'html-to-image'
import type { CSSProperties } from 'react'
import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { getPlaylist, listSongs, publishPlaylist, updatePlaylist } from '@/lib/db'
import type { BackgroundConfig, Playlist, PlaylistSection, Song } from '@/types'
import { editorReducer, initialUIState } from './PlaylistEditorPage/reducer'

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
    const opacity = background.opacity ?? 0.82
    const blur = background.blur ?? 0
    return {
      backgroundImage: `linear-gradient(rgba(255,255,255,${opacity}), rgba(255,255,255,${opacity})), url("${background.value}")`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      filter: blur > 0 ? `blur(${blur}px)` : undefined,
    }
  }

  return { background: background.value }
}

const exportSizes = [
  { label: '手机竖图 9:16', value: 'story', width: 1080, height: 1920 },
  { label: '社交长图', value: 'long', width: 1080, height: 2400 },
  { label: '方形图 1:1', value: 'square', width: 1080, height: 1080 },
  { label: '竖版海报 3:4', value: 'poster', width: 1242, height: 1660 },
] as const

type ExportSizeValue = (typeof exportSizes)[number]['value']

function getExportSize(value: ExportSizeValue) {
  return exportSizes.find((size) => size.value === value) ?? exportSizes[0]
}

function getDownloadFilename(title: string) {
  const safeTitle = title.trim().replace(/[\\/:*?"<>|]/g, '-')
  const date = new Date().toISOString().slice(0, 10)
  return `${safeTitle || 'songlist'}-${date}.png`
}

function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

function PlaylistEditorPage() {
  const navigate = useNavigate()
  const { playlistId } = useParams()
  const exportPreviewRef = useRef<HTMLElement | null>(null)
  const [playlist, setPlaylist] = useState<Playlist>()
  const [songs, setSongs] = useState<Song[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [ui, dispatch] = useReducer(editorReducer, initialUIState)

  const songMap = useMemo(() => new Map(songs.map((song) => [song.id, song])), [songs])
  const orderedSections = useMemo(
    () => normalizeSections(playlist?.sections ?? []),
    [playlist?.sections],
  )
  const exportSize = getExportSize(ui.exportSizeValue)
  const visibleSections = orderedSections.filter((section) => !section.hidden)
  const visibleSongCount = visibleSections.reduce(
    (total, section) => total + section.songIds.length,
    0,
  )

  // Estimate if content might overflow export area
  // Header: ~120px, each section header: ~40px, each song row: ~32px
  const estimatedContentHeight = 120 + visibleSections.length * 40 + visibleSongCount * 32
  const mightOverflow = estimatedContentHeight > exportSize.height

  const loadPlaylist = useCallback(async () => {
    if (!playlistId) return
    setIsLoading(true)
    const [nextPlaylist, nextSongs] = await Promise.all([getPlaylist(playlistId), listSongs()])
    setPlaylist(nextPlaylist)
    setSongs(nextSongs)
    setIsLoading(false)
    dispatch({ type: 'clearUnsaved' })
  }, [playlistId])

  useEffect(() => {
    loadPlaylist()
  }, [loadPlaylist])

  // Warn about unsaved changes
  useEffect(() => {
    if (!ui.hasUnsavedChanges) return

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault()
      event.returnValue = ''
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [ui.hasUnsavedChanges])

  // Auto-save after 3 seconds of inactivity
  useEffect(() => {
    if (!ui.hasUnsavedChanges || !playlist) return

    dispatch({ type: 'setAutoSaveStatus', payload: 'idle' })
    const timer = setTimeout(async () => {
      if (!playlist.title.trim()) return
      dispatch({ type: 'setAutoSaveStatus', payload: 'saving' })
      try {
        await updatePlaylist(playlist.id, {
          ...playlist,
          title: playlist.title.trim(),
          subtitle: playlist.subtitle?.trim() || undefined,
          rulesText: playlist.rulesText?.trim() || undefined,
        })
        dispatch({ type: 'clearUnsaved' })
        dispatch({ type: 'setAutoSaveStatus', payload: 'saved' })
      } catch {
        dispatch({ type: 'setAutoSaveStatus', payload: 'idle' })
      }
    }, 3000)

    return () => clearTimeout(timer)
  }, [ui.hasUnsavedChanges, playlist])

  function markUnsaved() {
    dispatch({ type: 'markUnsaved' })
  }

  async function handleSave() {
    if (!playlist) return
    if (!playlist.title.trim()) {
      dispatch({ type: 'setMessage', payload: '歌单标题不能为空。' })
      return
    }

    await updatePlaylist(playlist.id, {
      ...playlist,
      title: playlist.title.trim(),
      subtitle: playlist.subtitle?.trim() || undefined,
      rulesText: playlist.rulesText?.trim() || undefined,
    })
    await loadPlaylist()
    dispatch({ type: 'setMessage', payload: '已保存当前歌单。' })
  }

  async function handlePublish() {
    if (!playlist) return
    if (!playlist.title.trim()) {
      dispatch({ type: 'setMessage', payload: '发布前需要填写歌单标题。' })
      return
    }

    await handleSave()
    await publishPlaylist(playlist.id)
    await loadPlaylist()
    dispatch({ type: 'setMessage', payload: '已发布到历史歌单。' })
  }

  async function handleSaveAsTemplate() {
    if (!playlist) return
    if (!playlist.title.trim()) {
      dispatch({ type: 'setMessage', payload: '保存模板前需要填写歌单标题。' })
      return
    }

    const { saveAsTemplate } = await import('@/lib/db')
    const template = await saveAsTemplate(playlist.id)
    if (template) {
      dispatch({ type: 'setMessage', payload: `已保存为模板《${template.title}》。` })
    }
  }

  async function handleExportPng() {
    if (!playlist || !exportPreviewRef.current) return
    if (!playlist.title.trim()) {
      dispatch({ type: 'setMessage', payload: '导出前需要填写歌单标题。' })
      return
    }
    if (visibleSections.length === 0 || visibleSongCount === 0) {
      dispatch({ type: 'setMessage', payload: '导出前至少要保留 1 个可见分组和 1 首歌曲。' })
      return
    }

    dispatch({ type: 'setExporting', payload: true })
    dispatch({ type: 'setMessage', payload: '正在生成 PNG...' })

    try {
      await updatePlaylist(playlist.id, {
        ...playlist,
        lastExportedAt: Date.now(),
        title: playlist.title.trim(),
      })

      const dataUrl = await toPng(exportPreviewRef.current, {
        cacheBust: true,
        height: exportSize.height,
        pixelRatio: 2,
        style: {
          height: `${exportSize.height}px`,
          maxHeight: 'none',
          maxWidth: 'none',
          minHeight: `${exportSize.height}px`,
          width: `${exportSize.width}px`,
        },
        width: exportSize.width,
      })

      const link = document.createElement('a')
      link.download = getDownloadFilename(playlist.title)
      link.href = dataUrl
      link.click()
      await loadPlaylist()
      dispatch({
        type: 'setMessage',
        payload: `已导出 ${exportSize.width} × ${exportSize.height} PNG（2倍高清）。`,
      })
    } catch {
      dispatch({
        type: 'setMessage',
        payload: '导出失败。请确认图片背景地址可访问，或先切换为纯色/渐变背景。',
      })
    } finally {
      dispatch({ type: 'setExporting', payload: false })
    }
  }

  function updateSections(sections: PlaylistSection[]) {
    if (!playlist) return
    setPlaylist({ ...playlist, sections: normalizeSections(sections) })
    markUnsaved()
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

  function moveSongToSection(
    fromSectionId: string,
    toSectionId: string,
    songId: string,
    targetIndex: number,
  ) {
    updateSections(
      orderedSections.map((section) => {
        if (section.id === fromSectionId) {
          return { ...section, songIds: section.songIds.filter((id) => id !== songId) }
        }
        if (section.id === toSectionId) {
          const newSongIds = [...section.songIds]
          newSongIds.splice(targetIndex, 0, songId)
          return { ...section, songIds: newSongIds }
        }
        return section
      }),
    )
  }

  function handleSectionDragStart(sectionId: string) {
    dispatch({ type: 'dragStartSection', sectionId })
  }

  function handleSectionDragOver(event: React.DragEvent, sectionId: string) {
    event.preventDefault()
    dispatch({ type: 'dragOverSection', sectionId })
  }

  function handleSectionDrop(event: React.DragEvent, targetSectionId: string) {
    event.preventDefault()
    if (!ui.draggingSectionId || ui.draggingSectionId === targetSectionId) {
      dispatch({ type: 'dropSection' })
      return
    }

    const fromIndex = orderedSections.findIndex((s) => s.id === ui.draggingSectionId)
    const toIndex = orderedSections.findIndex((s) => s.id === targetSectionId)
    updateSections(moveItem(orderedSections, fromIndex, toIndex))
    dispatch({ type: 'dropSection' })
  }

  function handleSongDragStart(sectionId: string, songId: string) {
    dispatch({ type: 'dragStartSong', sectionId, songId })
  }

  function handleSongDragOver(event: React.DragEvent, sectionId: string, songId: string) {
    event.preventDefault()
    dispatch({ type: 'dragOverSong', sectionId, songId })
  }

  function handleSongDrop(event: React.DragEvent, targetSectionId: string, targetSongId: string) {
    event.preventDefault()
    if (!ui.draggingSong) {
      dispatch({ type: 'dropSong' })
      return
    }

    const { sectionId: fromSectionId, songId: fromSongId } = ui.draggingSong
    if (fromSectionId === targetSectionId && fromSongId === targetSongId) {
      dispatch({ type: 'dropSong' })
      return
    }

    if (fromSectionId === targetSectionId) {
      // Same section reorder
      const section = orderedSections.find((s) => s.id === targetSectionId)
      if (!section) return
      const fromIndex = section.songIds.indexOf(fromSongId)
      const toIndex = section.songIds.indexOf(targetSongId)
      updateSections(
        orderedSections.map((s) =>
          s.id === targetSectionId ? { ...s, songIds: moveItem(s.songIds, fromIndex, toIndex) } : s,
        ),
      )
    } else {
      // Cross-section move
      const targetSection = orderedSections.find((s) => s.id === targetSectionId)
      if (!targetSection) return
      const targetIndex = targetSection.songIds.indexOf(targetSongId)
      moveSongToSection(fromSectionId, targetSectionId, fromSongId, targetIndex)
    }

    dispatch({ type: 'dropSong' })
  }

  function handleSongDropOnSection(event: React.DragEvent, targetSectionId: string) {
    event.preventDefault()
    if (!ui.draggingSong) {
      dispatch({ type: 'dropSong' })
      return
    }

    const { sectionId: fromSectionId, songId: fromSongId } = ui.draggingSong
    if (fromSectionId === targetSectionId) {
      dispatch({ type: 'dropSong' })
      return
    }

    // Move to end of target section
    const targetSection = orderedSections.find((s) => s.id === targetSectionId)
    if (!targetSection) return
    moveSongToSection(fromSectionId, targetSectionId, fromSongId, targetSection.songIds.length)
    dispatch({ type: 'dropSong' })
  }

  function handleDragEnd() {
    dispatch({ type: 'dragEnd' })
  }

  function getAvailableSongs() {
    const usedIds = new Set(orderedSections.flatMap((s) => s.songIds))
    return songs.filter((song) => !usedIds.has(song.id))
  }

  function getFilteredAvailableSongs() {
    const available = getAvailableSongs()
    const query = ui.addSongQuery.trim().toLowerCase()
    if (!query) return available
    return available.filter(
      (song) =>
        song.title.toLowerCase().includes(query) ||
        song.artist?.toLowerCase().includes(query) ||
        song.genre?.toLowerCase().includes(query),
    )
  }

  function toggleAddSongSelection(songId: string) {
    dispatch({ type: 'toggleAddSongSelection', songId })
  }

  function addSongsToSection(sectionId: string, songIds: string[]) {
    if (!songIds.length) return
    updateSections(
      orderedSections.map((section) =>
        section.id === sectionId
          ? { ...section, songIds: [...section.songIds, ...songIds] }
          : section,
      ),
    )
  }

  function handleAddSelectedSongs() {
    if (!ui.targetSectionId || ui.selectedAddSongIds.size === 0) return
    addSongsToSection(ui.targetSectionId, Array.from(ui.selectedAddSongIds))
    dispatch({ type: 'clearAddSongSelections' })
    dispatch({ type: 'setMessage', payload: `已添加 ${ui.selectedAddSongIds.size} 首歌曲到分组。` })
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
    markUnsaved()
  }

  async function handleImageUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      dispatch({ type: 'setMessage', payload: '请上传图片文件。' })
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      dispatch({ type: 'setMessage', payload: '图片大小不能超过 5MB。' })
      return
    }

    try {
      const dataUrl = await readFileAsDataURL(file)
      dispatch({ type: 'setImagePreview', payload: dataUrl })
      updateBackground({
        ...playlist?.background,
        type: 'image',
        value: dataUrl,
      })
      dispatch({ type: 'setMessage', payload: '图片已加载。' })
    } catch {
      dispatch({ type: 'setMessage', payload: '图片读取失败。' })
    }
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
                onChange={(event) => {
                  setPlaylist({ ...playlist, title: event.target.value })
                  markUnsaved()
                }}
              />
            </label>
            <label>
              副标题
              <input
                value={playlist.subtitle ?? ''}
                onChange={(event) => {
                  setPlaylist({ ...playlist, subtitle: event.target.value })
                  markUnsaved()
                }}
                placeholder="例如：今晚 20:00 直播场"
              />
            </label>
            <label>
              点歌规则
              <textarea
                value={playlist.rulesText ?? ''}
                onChange={(event) => {
                  setPlaylist({ ...playlist, rulesText: event.target.value })
                  markUnsaved()
                }}
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
              <button className="secondary-button" type="button" onClick={handleSaveAsTemplate}>
                存为模板
              </button>
            </div>
            {ui.message ? <p className="inline-message">{ui.message}</p> : null}
            {ui.autoSaveStatus === 'saving' ? (
              <p className="inline-message" style={{ background: 'var(--surface-muted)' }}>
                自动保存中...
              </p>
            ) : ui.autoSaveStatus === 'saved' ? (
              <p className="inline-message" style={{ background: 'var(--surface-muted)' }}>
                已自动保存
              </p>
            ) : ui.hasUnsavedChanges ? (
              <p className="inline-message" style={{ background: 'var(--surface-muted)' }}>
                有未保存的修改
              </p>
            ) : null}
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
                        : event.target.value === 'image'
                          ? ''
                          : '#FFFDF7',
                  })
                }
              >
                <option value="solid">纯色</option>
                <option value="gradient">渐变</option>
                <option value="image">图片</option>
              </select>
            </label>

            {playlist.background.type === 'image' ? (
              <div className="image-upload">
                <label>
                  上传本地图片
                  <input accept="image/*" type="file" onChange={handleImageUpload} />
                </label>
                {ui.imagePreview || playlist.background.value ? (
                  <img
                    alt="背景预览"
                    className="image-upload-preview"
                    src={ui.imagePreview || playlist.background.value}
                  />
                ) : null}
                <label>
                  或输入图片地址
                  <input
                    value={playlist.background.value}
                    onChange={(event) =>
                      updateBackground({ ...playlist.background, value: event.target.value })
                    }
                    placeholder="https://..."
                  />
                </label>
              </div>
            ) : (
              <label>
                背景值
                <input
                  value={playlist.background.value}
                  onChange={(event) =>
                    updateBackground({ ...playlist.background, value: event.target.value })
                  }
                  placeholder={
                    playlist.background.type === 'gradient' ? 'linear-gradient(...)' : '#FFFDF7'
                  }
                />
              </label>
            )}

            {playlist.background.type === 'image' ? (
              <>
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
                <label>
                  模糊度
                  <input
                    max="10"
                    min="0"
                    step="0.5"
                    type="range"
                    value={playlist.background.blur ?? 0}
                    onChange={(event) =>
                      updateBackground({
                        ...playlist.background,
                        blur: Number(event.target.value),
                      })
                    }
                  />
                </label>
              </>
            ) : null}
          </section>

          <section className="tool-panel export-panel">
            <div>
              <p className="section-label">Export</p>
              <h2>导出图片</h2>
            </div>
            <label>
              导出尺寸
              <select
                value={ui.exportSizeValue}
                onChange={(event) =>
                  dispatch({
                    type: 'setExportSize',
                    payload: event.target.value as ExportSizeValue,
                  })
                }
              >
                {exportSizes.map((size) => (
                  <option key={size.value} value={size.value}>
                    {size.label} · {size.width}×{size.height}
                  </option>
                ))}
              </select>
            </label>
            <div className="export-meta">
              <span>{visibleSections.length} 个可见分组</span>
              <span>{visibleSongCount} 首歌曲</span>
            </div>
            {mightOverflow ? (
              <p className="inline-message" style={{ background: '#fff3cd', color: '#856404' }}>
                内容可能超出导出区域（预估 {estimatedContentHeight}px / {exportSize.height}
                px）。建议减少分组或歌曲，或选择更大的尺寸。
              </p>
            ) : null}
            <button
              className="primary-button"
              disabled={ui.isExporting}
              type="button"
              onClick={handleExportPng}
            >
              {ui.isExporting ? '正在导出' : '导出 PNG（2倍高清）'}
            </button>
          </section>

          <section className="tool-panel section-editor">
            <div>
              <p className="section-label">Sections</p>
              <h2>分组整理</h2>
            </div>
            {orderedSections.map((section, sectionIndex) => (
              <article
                className={`section-edit-card ${ui.draggingSectionId === section.id ? 'dragging' : ''} ${ui.dragOverSectionId === section.id ? 'drag-over' : ''}`}
                draggable
                key={section.id}
                onDragEnd={handleDragEnd}
                onDragOver={(event) => handleSectionDragOver(event, section.id)}
                onDragStart={() => handleSectionDragStart(section.id)}
                onDrop={(event) => handleSectionDrop(event, section.id)}
              >
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
                <ul
                  className="song-edit-list"
                  onDragEnd={handleDragEnd}
                  onDragOver={(event) => {
                    event.preventDefault()
                  }}
                  onDrop={(event) => handleSongDropOnSection(event, section.id)}
                >
                  {section.songIds.map((songId, songIndex) => {
                    const song = songMap.get(songId)
                    const isDragging =
                      ui.draggingSong?.sectionId === section.id &&
                      ui.draggingSong?.songId === songId
                    const isDragOver =
                      ui.dragOverSong?.sectionId === section.id &&
                      ui.dragOverSong?.songId === songId
                    return (
                      <li
                        className={`song-edit-row ${isDragging ? 'dragging' : ''} ${isDragOver ? 'drag-over' : ''}`}
                        draggable
                        key={songId}
                        onDragEnd={handleDragEnd}
                        onDragOver={(event) => handleSongDragOver(event, section.id, songId)}
                        onDragStart={() => handleSongDragStart(section.id, songId)}
                        onDrop={(event) => handleSongDrop(event, section.id, songId)}
                      >
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
                      </li>
                    )
                  })}
                </ul>
              </article>
            ))}
          </section>

          <section className="tool-panel add-songs-panel">
            <div>
              <p className="section-label">Add Songs</p>
              <h2>追加歌曲</h2>
            </div>
            <button
              className="secondary-button"
              type="button"
              onClick={() => {
                dispatch({ type: 'toggleAddSongs', defaultTargetId: orderedSections[0]?.id ?? '' })
              }}
            >
              {ui.showAddSongs ? '收起' : '展开'}歌曲选择
            </button>
            {ui.showAddSongs ? (
              <>
                <label>
                  目标分组
                  <select
                    value={ui.targetSectionId}
                    onChange={(event) =>
                      dispatch({ type: 'setTargetSectionId', payload: event.target.value })
                    }
                  >
                    {orderedSections.map((section) => (
                      <option key={section.id} value={section.id}>
                        {section.title} ({section.songIds.length} 首)
                      </option>
                    ))}
                  </select>
                </label>
                <input
                  value={ui.addSongQuery}
                  onChange={(event) =>
                    dispatch({ type: 'setAddSongQuery', payload: event.target.value })
                  }
                  placeholder="搜索歌名、歌手、风格"
                />
                <div className="selector-meta">
                  <span>
                    可选 {getFilteredAvailableSongs().length} 首 / 已选 {ui.selectedAddSongIds.size}{' '}
                    首
                  </span>
                </div>
                <div className="song-select-list compact">
                  {getFilteredAvailableSongs().map((song) => (
                    <label className="song-select-row" key={song.id}>
                      <input
                        checked={ui.selectedAddSongIds.has(song.id)}
                        type="checkbox"
                        onChange={() => toggleAddSongSelection(song.id)}
                      />
                      <div className="song-select-info">
                        <strong>{song.title}</strong>
                        <span>{song.artist || '未填写歌手'}</span>
                      </div>
                      <span className="status-pill">{song.genre || '未分类'}</span>
                    </label>
                  ))}
                  {getFilteredAvailableSongs().length === 0 ? (
                    <p className="empty-hint">没有可添加的歌曲（曲库为空或已全部加入）</p>
                  ) : null}
                </div>
                <button
                  className="primary-button"
                  disabled={ui.selectedAddSongIds.size === 0 || !ui.targetSectionId}
                  type="button"
                  onClick={handleAddSelectedSongs}
                >
                  添加到分组
                </button>
              </>
            ) : null}
          </section>
        </div>

        <section
          className="playlist-preview export-preview"
          aria-label="歌单发布预览"
          ref={exportPreviewRef}
          style={{
            ...getPreviewBackgroundStyle(playlist.background),
            aspectRatio: `${exportSize.width} / ${exportSize.height}`,
          }}
        >
          <div className="song-board-header">
            <div>
              <p className="section-label">Preview</p>
              <h2>{playlist.title}</h2>
            </div>
            <span>
              {exportSize.width} × {exportSize.height}
            </span>
          </div>
          <p className="preview-subtitle">{playlist.subtitle || '未填写副标题'}</p>
          <div className="preview-rules">{playlist.rulesText || '未填写点歌规则'}</div>
          <div className="preview-sections">
            {visibleSections.map((section) => (
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
