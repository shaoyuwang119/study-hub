import { useEffect, useState } from 'react'
import { Navigate, Outlet } from 'react-router-dom'

import type { Session } from '@supabase/supabase-js'

import { supabase } from '@/lib/supabase'
import { Sidebar, Loading } from '@/components'

// ProtectedRoute ensures that only authenticated users
// are allowed to view protected pages(dashboard, explore, note pages, etc.)
export default function ProtectedRoute() {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function checkSession() {
      const { data } = await supabase.auth.getSession()

      setSession(data.session)
      setLoading(false)
    }

    checkSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  if (loading) {
    return <Loading />
  }

  if (!session) {
    return <Navigate to="/login" replace />
  }

  return (
    <div className="flex h-screen font-sans">
      <Sidebar />
      <Outlet />
    </div>
  )
}
