import { useState } from 'react'

// TODO: once a `subjects` table exists, replace this with a fetch, e.g.
// useEffect(() => {
//   supabase.from('subjects').select('name').then(({ data }) => {
//     if (data) setSubjects(data.map((s) => s.name).sort())
//   })
// }, [])
const HARDCODED_SUBJECTS = [
  'Math',
  'Science',
  'English',
  'History',
  'Geography',
  'Biology',
  'Chemistry',
  'Physics',
  'Computer Science',
  'Art',
  'Music',
].sort()

export function useSubjects() {
  const [subjects] = useState(HARDCODED_SUBJECTS)
  return subjects
}
