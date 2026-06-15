import { Route, Routes } from 'react-router-dom'
import AppFrame from '@/components/AppFrame'
import DashboardPage from '@/pages/DashboardPage'
import DocsPage from '@/pages/DocsPage'
import GeneratePage from '@/pages/GeneratePage'
import LibraryPage from '@/pages/LibraryPage'

function App() {
  return (
    <AppFrame>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/docs" element={<DocsPage />} />
        <Route path="/generate" element={<GeneratePage />} />
        <Route path="/library" element={<LibraryPage />} />
      </Routes>
    </AppFrame>
  )
}

export default App
