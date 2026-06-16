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

function SafeRoute({ children }: { children: React.ReactNode }) {
  return <ErrorBoundary>{children}</ErrorBoundary>
}

function App() {
  const { removeToast, toasts } = useToast()

  return (
    <ErrorBoundary>
      <AppFrame>
        <ScrollToTop />
        <Routes>
          <Route
            path="/"
            element={
              <SafeRoute>
                <DashboardPage />
              </SafeRoute>
            }
          />
          <Route
            path="/docs"
            element={
              <SafeRoute>
                <DocsPage />
              </SafeRoute>
            }
          />
          <Route
            path="/generate"
            element={
              <SafeRoute>
                <GeneratePage />
              </SafeRoute>
            }
          />
          <Route
            path="/history"
            element={
              <SafeRoute>
                <HistoryPage />
              </SafeRoute>
            }
          />
          <Route
            path="/learning"
            element={
              <SafeRoute>
                <LearningMemoPage />
              </SafeRoute>
            }
          />
          <Route
            path="/library"
            element={
              <SafeRoute>
                <LibraryPage />
              </SafeRoute>
            }
          />
          <Route
            path="/playlists/:playlistId"
            element={
              <SafeRoute>
                <PlaylistEditorPage />
              </SafeRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <SafeRoute>
                <SettingsPage />
              </SafeRoute>
            }
          />
        </Routes>
        <ScrollToTopButton />
        <ToastContainer toasts={toasts} onRemove={removeToast} />
      </AppFrame>
    </ErrorBoundary>
  )
}

export default App
