import { useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import AppFrame from '@/components/AppFrame'
import ErrorBoundary from '@/components/ErrorBoundary'
import ScrollToTopButton from '@/components/ScrollToTopButton'
import { ToastContainer, useToast } from '@/components/Toast'
import DashboardPage from '@/pages/DashboardPage'
import DocsPage from '@/pages/DocsPage'
import GeneratePage from '@/pages/GeneratePage'
import HistoryPage from '@/pages/HistoryPage'
import LearningMemoPage from '@/pages/LearningMemoPage'
import LibraryPage from '@/pages/LibraryPage'
import PlaylistEditorPage from '@/pages/PlaylistEditorPage'
import SettingsPage from '@/pages/SettingsPage'

function ScrollToTop() {
  const location = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [location.pathname])
  return null
}

function App() {
  const { removeToast, toasts } = useToast()

  return (
    <ErrorBoundary>
      <AppFrame>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/docs" element={<DocsPage />} />
          <Route path="/generate" element={<GeneratePage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/learning" element={<LearningMemoPage />} />
          <Route path="/library" element={<LibraryPage />} />
          <Route path="/playlists/:playlistId" element={<PlaylistEditorPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
        <ScrollToTopButton />
        <ToastContainer toasts={toasts} onRemove={removeToast} />
      </AppFrame>
    </ErrorBoundary>
  )
}

export default App
