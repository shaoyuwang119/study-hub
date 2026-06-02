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

app.post('/api/notes', async (req, res) => {
  console.log('recieved!')
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

  const { error } = await supabase.from('notes').delete().eq('id', id)

  if (error) {
    return res.status(500).json({
      error: error.message,
    })
  }

  res.status(200).json({
    message: 'Note deleted successfully',
  })
})

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`)
})
