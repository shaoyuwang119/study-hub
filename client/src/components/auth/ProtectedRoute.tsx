import { useEffect, useState } from 'react'
import { Navigate, Outlet, useNavigate } from 'react-router-dom'

import type { Session } from '@supabase/supabase-js'

import { supabase } from '@/lib/supabase'
import { Sidebar, Header, UploadModal } from '@/components'

export type Profile = {
  name: string
  email: string
}

// ProtectedRoute ensures that only authenticated users
// are allowed to view protected pages(dashboard, explore, note pages, etc.)
export default function ProtectedRoute() {
  const navigate = useNavigate()
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<Profile>({ name: '', email: '' })
  const [showUpload, setShowUpload] = useState(false)

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

  useEffect(() => {
    async function fetchProfile() {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      const { data } = await supabase
        .from('profiles')
        .select('display_name')
        .eq('id', user.id)
        .single()

      setProfile({
        name: data?.display_name || '',
        email: user.email || '',
      })
    }

    fetchProfile()
  }, [session])

  const handleUploadSubmit = async (newNote: {
    title: string
    subjectId: number
    description: string
    files: File[]
  }) => {
    const {
      data: { session: currentSession },
    } = await supabase.auth.getSession()
    if (!currentSession) {
      throw new Error('Not authenticated')
    }

    const formData = new FormData()
    formData.append('title', newNote.title)
    formData.append('subject_id', String(newNote.subjectId))
    formData.append('description', newNote.description)
    newNote.files.forEach((file) => formData.append('files', file))

    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/notes`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${currentSession.access_token}` },
      body: formData,
    })

    if (!res.ok) {
      const body = await res.json().catch(() => null)
      throw new Error(body?.error ?? 'Failed to upload note.')
    }

    const noteData = await res.json()
    navigate(`/notes/${noteData.id}`)
  }

  if (loading) {
    return
  }

  if (!session) {
    return <Navigate to="/login" replace />
  }

  return (
    <div className="flex h-screen flex-col font-sans">
      <Header
        profileName={profile.name}
        onCreateClick={() => setShowUpload(true)}
      />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar profile={profile} />
        <Outlet />
      </div>
      <UploadModal
        open={showUpload}
        onSubmit={handleUploadSubmit}
        onClose={() => setShowUpload(false)}
      />
    </div>
  )
}
