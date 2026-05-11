import express from 'express'
import cors from 'cors'

const app = express()
const PORT = 3000

let notes = [
  {
    id: 1,
    title: 'Chemistry Notes',
    author: 'Shaoyu W',
    imageUrl: 'https://placehold.co/100x150',
  },
  {
    id: 2,
    title: 'World History',
    author: 'Shaoyu W',
    imageUrl: 'https://placehold.co/100x150',
  },
  {
    id: 3,
    title: 'Calc',
    author: 'Shaoyu W',
    imageUrl: 'https://placehold.co/100x150',
  },
]

app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
  res.send('Study Hub backend is running')
})

app.get('/api/notes', (req, res) => {
  res.json(notes)
})

app.delete('/api/notes/last', (req, res) => {
  const removedNote = notes.pop()

  if (!removedNote) {
    return res.status(404).json({
      error: 'No notes to delete',
    })
  }

  res.json({
    message: 'Last note deleted',
    deleted: removedNote,
    notes,
  })
})

app.post('/api/notes', (req, res) => {
  const { title, author, imageUrl } = req.body

  const newNote = {
    id: Date.now(),
    title,
    author,
    imageUrl,
  }

  notes.push(newNote)

  res.status(201).json(newNote)
})

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`)
})
