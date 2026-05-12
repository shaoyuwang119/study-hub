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
  const { title, author, imageUrl } = req.body

  const newNote = {
    title,
    author,
    imageUrl,
  }

  const { data, error } = await supabase.from('notes').insert(newNote).select()

  if (error) {
    return res.status(500).json({ error: error.message })
  }

  res.json(data[0])
})

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`)
})
