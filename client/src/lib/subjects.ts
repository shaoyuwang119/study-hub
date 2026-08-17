import { useEffect, useState } from 'react'

import { supabase } from '@/lib/supabase'
import type { Subject } from '@/types'

export function useSubjects() {
  const [subjects, setSubjects] = useState<Subject[]>([])

  useEffect(() => {
    supabase
      .from('subjects')
      .select('id, name, category')
      .order('name')
      .then(({ data }) => {
        if (data) setSubjects(data)
      })
  }, [])

  return subjects
}
