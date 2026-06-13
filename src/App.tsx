import { Route, Routes } from 'react-router-dom'
import DashboardPage from '@/pages/DashboardPage'
import DocsPage from '@/pages/DocsPage'
import GeneratePage from '@/pages/GeneratePage'
import LibraryPage from '@/pages/LibraryPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<DashboardPage />} />
      <Route path="/docs" element={<DocsPage />} />
      <Route path="/generate" element={<GeneratePage />} />
      <Route path="/library" element={<LibraryPage />} />
    </Routes>
  )
}

export default App
