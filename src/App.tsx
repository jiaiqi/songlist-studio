import { Route, Routes } from 'react-router-dom'
import AppFrame from '@/components/AppFrame'
import DashboardPage from '@/pages/DashboardPage'
import DocsPage from '@/pages/DocsPage'
import GeneratePage from '@/pages/GeneratePage'
import HistoryPage from '@/pages/HistoryPage'
import LearningMemoPage from '@/pages/LearningMemoPage'
import LibraryPage from '@/pages/LibraryPage'
import PlaylistEditorPage from '@/pages/PlaylistEditorPage'

function App() {
  return (
    <AppFrame>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/docs" element={<DocsPage />} />
        <Route path="/generate" element={<GeneratePage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/learning" element={<LearningMemoPage />} />
        <Route path="/library" element={<LibraryPage />} />
        <Route path="/playlists/:playlistId" element={<PlaylistEditorPage />} />
      </Routes>
    </AppFrame>
  )
}

export default App
