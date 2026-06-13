import { Route, Routes } from 'react-router-dom'
import DashboardPage from '@/pages/DashboardPage'
import DocsPage from '@/pages/DocsPage'
import LibraryPage from '@/pages/LibraryPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<DashboardPage />} />
      <Route path="/docs" element={<DocsPage />} />
      <Route path="/library" element={<LibraryPage />} />
    </Routes>
  )
}

export default App
