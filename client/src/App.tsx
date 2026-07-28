import { Route, Routes } from 'react-router-dom'
import { ProtectedRoute } from '@/components'
import Explore from '@/pages/Explore'
import Home from '@/pages/Home'
import Login from '@/pages/Login'
import NotePage from '@/pages/NotePage'
import Profile from '@/pages/Profile'
import NotFound from '@/pages/NotFound'

function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<Login />} />

      {/* Protected routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<Home />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/notes/:id" element={<NotePage />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}

export default App
