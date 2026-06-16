import { describe, expect, it } from 'vitest'
import { editorReducer, initialUIState } from './reducer'

describe('editorReducer', () => {
  it('setExporting', () => {
    const state = editorReducer(initialUIState, { type: 'setExporting', payload: true })
    expect(state.isExporting).toBe(true)
  })

  it('setMessage', () => {
    const state = editorReducer(initialUIState, { type: 'setMessage', payload: '已保存' })
    expect(state.message).toBe('已保存')
  })

  it('markUnsaved sets hasUnsavedChanges and resets autoSaveStatus', () => {
    const prev = { ...initialUIState, autoSaveStatus: 'saved' as const }
    const state = editorReducer(prev, { type: 'markUnsaved' })
    expect(state.hasUnsavedChanges).toBe(true)
    expect(state.autoSaveStatus).toBe('idle')
  })

  it('clearUnsaved', () => {
    const prev = { ...initialUIState, hasUnsavedChanges: true }
    const state = editorReducer(prev, { type: 'clearUnsaved' })
    expect(state.hasUnsavedChanges).toBe(false)
  })

  it('setAutoSaveStatus', () => {
    const state = editorReducer(initialUIState, { type: 'setAutoSaveStatus', payload: 'saving' })
    expect(state.autoSaveStatus).toBe('saving')
  })

  it('toggleAddSongs opens and sets default target', () => {
    const state = editorReducer(initialUIState, { type: 'toggleAddSongs', defaultTargetId: 'sec-1' })
    expect(state.showAddSongs).toBe(true)
    expect(state.targetSectionId).toBe('sec-1')
  })

  it('toggleAddSongs closes without changing target', () => {
    const prev = { ...initialUIState, showAddSongs: true, targetSectionId: 'sec-1' }
    const state = editorReducer(prev, { type: 'toggleAddSongs' })
    expect(state.showAddSongs).toBe(false)
    expect(state.targetSectionId).toBe('sec-1')
  })

  it('setAddSongQuery', () => {
    const state = editorReducer(initialUIState, { type: 'setAddSongQuery', payload: '周杰伦' })
    expect(state.addSongQuery).toBe('周杰伦')
  })

  it('toggleAddSongSelection adds song', () => {
    const state = editorReducer(initialUIState, { type: 'toggleAddSongSelection', songId: 'song-1' })
    expect(state.selectedAddSongIds.has('song-1')).toBe(true)
  })

  it('toggleAddSongSelection removes existing song', () => {
    const prev = { ...initialUIState, selectedAddSongIds: new Set(['song-1']) }
    const state = editorReducer(prev, { type: 'toggleAddSongSelection', songId: 'song-1' })
    expect(state.selectedAddSongIds.has('song-1')).toBe(false)
  })

  it('clearAddSongSelections', () => {
    const prev = { ...initialUIState, selectedAddSongIds: new Set(['song-1']), addSongQuery: 'query' }
    const state = editorReducer(prev, { type: 'clearAddSongSelections' })
    expect(state.selectedAddSongIds.size).toBe(0)
    expect(state.addSongQuery).toBe('')
  })

  it('setTargetSectionId', () => {
    const state = editorReducer(initialUIState, { type: 'setTargetSectionId', payload: 'sec-2' })
    expect(state.targetSectionId).toBe('sec-2')
  })

  it('dragStartSection', () => {
    const state = editorReducer(initialUIState, { type: 'dragStartSection', sectionId: 'sec-1' })
    expect(state.draggingSectionId).toBe('sec-1')
    expect(state.dragOverSectionId).toBeNull()
  })

  it('dragOverSection only when different section', () => {
    const prev = { ...initialUIState, draggingSectionId: 'sec-1' }
    const state = editorReducer(prev, { type: 'dragOverSection', sectionId: 'sec-2' })
    expect(state.dragOverSectionId).toBe('sec-2')
  })

  it('dragOverSection ignores same section', () => {
    const prev = { ...initialUIState, draggingSectionId: 'sec-1' }
    const state = editorReducer(prev, { type: 'dragOverSection', sectionId: 'sec-1' })
    expect(state.dragOverSectionId).toBeNull()
  })

  it('dropSection clears drag state', () => {
    const prev = { ...initialUIState, draggingSectionId: 'sec-1', dragOverSectionId: 'sec-2' }
    const state = editorReducer(prev, { type: 'dropSection' })
    expect(state.draggingSectionId).toBeNull()
    expect(state.dragOverSectionId).toBeNull()
  })

  it('dragStartSong', () => {
    const state = editorReducer(initialUIState, { type: 'dragStartSong', sectionId: 'sec-1', songId: 'song-1' })
    expect(state.draggingSong).toEqual({ sectionId: 'sec-1', songId: 'song-1' })
  })

  it('dragOverSong only when different target', () => {
    const prev = { ...initialUIState, draggingSong: { sectionId: 'sec-1', songId: 'song-1' } }
    const state = editorReducer(prev, { type: 'dragOverSong', sectionId: 'sec-1', songId: 'song-2' })
    expect(state.dragOverSong).toEqual({ sectionId: 'sec-1', songId: 'song-2' })
  })

  it('dragOverSong ignores same target', () => {
    const prev = { ...initialUIState, draggingSong: { sectionId: 'sec-1', songId: 'song-1' } }
    const state = editorReducer(prev, { type: 'dragOverSong', sectionId: 'sec-1', songId: 'song-1' })
    expect(state.dragOverSong).toBeNull()
  })

  it('dropSong clears drag state', () => {
    const prev = { ...initialUIState, draggingSong: { sectionId: 'sec-1', songId: 'song-1' }, dragOverSong: { sectionId: 'sec-2', songId: 'song-2' } }
    const state = editorReducer(prev, { type: 'dropSong' })
    expect(state.draggingSong).toBeNull()
    expect(state.dragOverSong).toBeNull()
  })

  it('dragEnd clears all drag state', () => {
    const prev = {
      ...initialUIState,
      draggingSectionId: 'sec-1',
      dragOverSectionId: 'sec-2',
      draggingSong: { sectionId: 'sec-1', songId: 'song-1' },
      dragOverSong: { sectionId: 'sec-2', songId: 'song-2' },
    }
    const state = editorReducer(prev, { type: 'dragEnd' })
    expect(state.draggingSectionId).toBeNull()
    expect(state.dragOverSectionId).toBeNull()
    expect(state.draggingSong).toBeNull()
    expect(state.dragOverSong).toBeNull()
  })

  it('reset returns initial state', () => {
    const prev = { ...initialUIState, message: 'test', hasUnsavedChanges: true }
    const state = editorReducer(prev, { type: 'reset' })
    expect(state).toEqual(initialUIState)
  })
})
