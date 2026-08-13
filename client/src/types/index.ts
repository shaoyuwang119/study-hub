export type Note = {
  id: number
  user_id: string
  title: string
  subject: string
  description: string
  author?: string
  content_url: string
  preview_url?: string
  saves: number
  created_at: string
  updated_at: string
}
