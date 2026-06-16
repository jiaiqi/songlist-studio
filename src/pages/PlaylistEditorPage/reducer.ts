import type { ExportSizeValue } from './PlaylistEditorPage'

export type EditorUIState = {
  // UI 状态
  isExporting: boolean
  message: string
  exportSizeValue: ExportSizeValue
  imagePreview: string
  hasUnsavedChanges: boolean
  autoSaveStatus: 'idle' | 'saving' | 'saved'
  // 追加歌曲
  showAddSongs: boolean
  addSongQuery: string
  selectedAddSongIds: Set<string>
  targetSectionId: string
  // 拖拽
  draggingSectionId: string | null
  dragOverSectionId: string | null
  draggingSong: { sectionId: string; songId: string } | null
  dragOverSong: { sectionId: string; songId: string } | null
}

export const initialUIState: EditorUIState = {
  isExporting: false,
  message: '',
  exportSizeValue: 'story',
  imagePreview: '',
  hasUnsavedChanges: false,
  autoSaveStatus: 'idle',
  showAddSongs: false,
  addSongQuery: '',
  selectedAddSongIds: new Set(),
  targetSectionId: '',
  draggingSectionId: null,
  dragOverSectionId: null,
  draggingSong: null,
  dragOverSong: null,
}

export type EditorAction =
  | { type: 'setExporting'; payload: boolean }
  | { type: 'setMessage'; payload: string }
  | { type: 'setExportSize'; payload: ExportSizeValue }
  | { type: 'setImagePreview'; payload: string }
  | { type: 'markUnsaved' }
  | { type: 'clearUnsaved' }
  | { type: 'setAutoSaveStatus'; payload: 'idle' | 'saving' | 'saved' }
  | { type: 'toggleAddSongs'; defaultTargetId?: string }
  | { type: 'setAddSongQuery'; payload: string }
  | { type: 'toggleAddSongSelection'; songId: string }
  | { type: 'clearAddSongSelections' }
  | { type: 'setTargetSectionId'; payload: string }
  | { type: 'dragStartSection'; sectionId: string }
  | { type: 'dragOverSection'; sectionId: string }
  | { type: 'dropSection' }
  | { type: 'dragStartSong'; sectionId: string; songId: string }
  | { type: 'dragOverSong'; sectionId: string; songId: string }
  | { type: 'dropSong' }
  | { type: 'dragEnd' }
  | { type: 'reset' }

export function editorReducer(state: EditorUIState, action: EditorAction): EditorUIState {
  switch (action.type) {
    case 'setExporting':
      return { ...state, isExporting: action.payload }
    case 'setMessage':
      return { ...state, message: action.payload }
    case 'setExportSize':
      return { ...state, exportSizeValue: action.payload }
    case 'setImagePreview':
      return { ...state, imagePreview: action.payload }
    case 'markUnsaved':
      return { ...state, hasUnsavedChanges: true, autoSaveStatus: 'idle' }
    case 'clearUnsaved':
      return { ...state, hasUnsavedChanges: false, autoSaveStatus: 'idle' }
    case 'setAutoSaveStatus':
      return { ...state, autoSaveStatus: action.payload }
    case 'toggleAddSongs':
      return {
        ...state,
        showAddSongs: !state.showAddSongs,
        targetSectionId: !state.showAddSongs ? (action.defaultTargetId ?? '') : state.targetSectionId,
      }
    case 'setAddSongQuery':
      return { ...state, addSongQuery: action.payload }
    case 'toggleAddSongSelection': {
      const next = new Set(state.selectedAddSongIds)
      if (next.has(action.songId)) {
        next.delete(action.songId)
      } else {
        next.add(action.songId)
      }
      return { ...state, selectedAddSongIds: next }
    }
    case 'clearAddSongSelections':
      return { ...state, selectedAddSongIds: new Set(), addSongQuery: '' }
    case 'setTargetSectionId':
      return { ...state, targetSectionId: action.payload }
    case 'dragStartSection':
      return { ...state, draggingSectionId: action.sectionId, dragOverSectionId: null }
    case 'dragOverSection':
      if (state.draggingSectionId && state.draggingSectionId !== action.sectionId) {
        return { ...state, dragOverSectionId: action.sectionId }
      }
      return state
    case 'dropSection':
      return { ...state, draggingSectionId: null, dragOverSectionId: null }
    case 'dragStartSong':
      return {
        ...state,
        draggingSong: { sectionId: action.sectionId, songId: action.songId },
        dragOverSong: null,
      }
    case 'dragOverSong':
      if (
        state.draggingSong &&
        (state.draggingSong.sectionId !== action.sectionId || state.draggingSong.songId !== action.songId)
      ) {
        return { ...state, dragOverSong: { sectionId: action.sectionId, songId: action.songId } }
      }
      return state
    case 'dropSong':
      return { ...state, draggingSong: null, dragOverSong: null }
    case 'dragEnd':
      return {
        ...state,
        draggingSectionId: null,
        dragOverSectionId: null,
        draggingSong: null,
        dragOverSong: null,
      }
    case 'reset':
      return initialUIState
    default:
      return state
  }
}
