import { Route, Routes } from 'react-router-dom'
import DashboardPage from '@/pages/DashboardPage'
import DocsPage from '@/pages/DocsPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<DashboardPage />} />
      <Route path="/docs" element={<DocsPage />} />
    </Routes>
  )
}

export default App
