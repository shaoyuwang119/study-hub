import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { ProtectedRoute } from '@/components'

import Explore from '@/pages/Explore'
import Home from '@/pages/Home'
import Login from '@/pages/Login'
import NotePage from '@/pages/NotePage'
import Profile from '@/pages/Profile'
import NotFound from '@/pages/NotFound'
import Library from '@/pages/Library'
import NoteEditPage from '@/pages/NoteEditPage'

const router = createBrowserRouter([
  // Public routes
  { path: '/login', element: <Login /> },

  // Protected routes
  {
    element: <ProtectedRoute />,
    children: [
      { path: '/', element: <Home /> },
      { path: '/explore', element: <Explore /> },
      { path: '/profile', element: <Profile /> },
      { path: '/library', element: <Library /> },
      { path: '/notes/:id/edit', element: <NoteEditPage /> },
      { path: '/notes/:id', element: <NotePage /> },
      { path: '*', element: <NotFound /> },
    ],
  },
])

function App() {
  return <RouterProvider router={router} />
}

export default App
