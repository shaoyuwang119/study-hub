import { Route, Routes } from 'react-router-dom'
import { ProtectedRoute } from '@/components'
import ExplorePage from '@/pages/ExplorePage'
import Home from '@/pages/Home'
import Login from '@/pages/Login'
import NotePage from '@/pages/NotePage'

function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<Login />} />

      {/* Protected routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<Home />} />
        <Route path="/explore" element={<ExplorePage />} />
        <Route path="/notes/:id" element={<NotePage />} />
      </Route>
    </Routes>
  )
}

export default App
