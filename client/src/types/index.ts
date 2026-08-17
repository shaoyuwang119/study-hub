export type Subject = {
  id: number
  name: string
  category: string
}

export type Note = {
  id: number
  user_id: string
  title: string
  subject_id: number
  subject?: Subject | null
  description: string
  author?: string
  content_url: string
  preview_url?: string
  saves: number
  created_at: string
  updated_at: string
}
