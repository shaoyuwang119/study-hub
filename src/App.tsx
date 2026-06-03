import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import NotePage from './pages/NotePage'
import ExplorePage from './pages/ExplorePage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/explore" element={<ExplorePage />} />
      <Route path="/notes/:id" element={<NotePage />} />
    </Routes>
  )
}

export default App
