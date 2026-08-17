import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { NoteCard, ErrorDisplay, Title } from '@/components'
import { supabase } from '@/lib/supabase'
import type { Note } from '@/types'
import { usePageTitle } from '@/lib/usePageTitle'
import { useSavedNotes } from '@/lib/useSavedNotes'

function Settings() {
  return (
    <div className="p-6">
      <Title
        title="Settings"
        description="Manage your account settings - TBA"
      />
    </div>
  )
}

export default Settings
