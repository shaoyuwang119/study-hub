import express from 'express'
import cors from 'cors'
import { supabase } from './supabase'

const app = express()
const PORT = 3000

console.log(process.env.SUPABASE_URL)

app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
  res.send('Study Hub backend is running')
})

app.get('/api/notes', async (req, res) => {
  const { data, error } = await supabase.from('notes').select('*')
  if (error) {
    return res.status(500).json({ error: error.message })
  }

  res.json(data)
})

app.get('/api/notes/search', async (req, res) => {
  const { q, author } = req.query
  res.status(404).json({
    message: 'Search backend not implemented yet',
  })
})

app.get('/api/notes/:id', async (req, res) => {
  const { id } = req.params

  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    return res.status(404).json({
      message: 'Page not found!',
    })
  }

  res.json(data)
})

app.post('/api/notes', async (req, res) => {
  const { title, subject, description, url, author } = req.body
  const content_url = url
  const saves = 0

  const newNote = {
    title,
    subject,
    description,
    content_url,
    author,
    saves,
  }

  const { data, error } = await supabase.from('notes').insert(newNote).select()

  if (error) {
    console.log(error.message)
    return res.status(500).json({ error: error.message })
  }

  res.json(data[0])
})

app.delete('/api/notes/:id', async (req, res) => {
  const { id } = req.params

  const { data, error } = await supabase
    .from('notes')
    .delete()
    .eq('id', id)
    .select()

  if (error) {
    return res.status(403).json({
      message: 'Delete failed',
      error: error.message,
    })
  }

  if (!data || data.length === 0) {
    return res.status(404).json({
      message: 'No note deleted (not found or no permission)',
    })
  }

  res.json({
    message: 'Note deleted successfully',
  })
})

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`)
})
