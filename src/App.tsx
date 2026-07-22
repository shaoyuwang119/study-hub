import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import NotePage from './pages/NotePage'
import ExplorePage from './pages/ExplorePage'
import Login from './pages/Login'

import { ProtectedRoute } from './components'

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
