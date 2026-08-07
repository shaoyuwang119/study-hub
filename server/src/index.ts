import cors from 'cors'
import express from 'express'
import multer from 'multer'
import { PDFDocument } from 'pdf-lib'
import { createClient, SupabaseClient } from '@supabase/supabase-js'

import { supabase } from '@/config/supabase'
import type { AuthedRequest } from '@/middleware/auth'
import { requireAuth } from '@/middleware/auth'

const app = express()
const PORT = 3000

console.log(process.env.SUPABASE_URL)

app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
  res.send('Study Hub backend is running')
})

app.get('/api/notes/search', async (req, res) => {
  const { q, author } = req.query

  let query = supabase.from('notes').select('*')

  if (q) {
    query = query.ilike('title', `%${q}%`)
  }

  if (author) {
    query = query.ilike('author', `%${author}%`)
  }

  const { data, error } = await query

  if (error) {
    return res.status(500).json({
      message: 'Search failed',
      error: error.message,
    })
  }

  res.json(data)
})

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024, files: 10 },
})

const ALLOWED_TYPES = new Set(['application/pdf', 'image/png', 'image/jpeg'])

app.post(
  '/api/notes',
  requireAuth,
  upload.array('files', 10),
  async (req: AuthedRequest, res) => {
    const files = req.files as Express.Multer.File[]
    const { title, subject, description, author } = req.body

    if (!title || !subject) {
      return res.status(400).json({ error: 'Fields missing' })
    }

    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'No files provided' })
    }

    const invalid = files.find((f) => !ALLOWED_TYPES.has(f.mimetype))
    if (invalid) {
      return res.status(400).json({
        error: `Unsupported file type: ${invalid.originalname}. Only PDF, PNG, and JPEG are supported right now.`,
      })
    }

    // Merge everything into one PDF
    let mergedBytes: Uint8Array
    try {
      const mergedPdf = await PDFDocument.create()

      for (const file of files) {
        if (file.mimetype === 'application/pdf') {
          const srcPdf = await PDFDocument.load(file.buffer)
          const pages = await mergedPdf.copyPages(
            srcPdf,
            srcPdf.getPageIndices()
          )
          pages.forEach((page) => mergedPdf.addPage(page))
        } else {
          const image =
            file.mimetype === 'image/png'
              ? await mergedPdf.embedPng(file.buffer)
              : await mergedPdf.embedJpg(file.buffer)

          const page = mergedPdf.addPage([image.width, image.height])
          page.drawImage(image, {
            x: 0,
            y: 0,
            width: image.width,
            height: image.height,
          })
        }
      }
      mergedBytes = await mergedPdf.save()
    } catch (err) {
      console.log(err)
      return res.status(400).json({ error: 'Could not merge files into a PDF' })
    }

    // Act as the requesting user so Supabase's RLS applies normally
    const supabaseClient = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_ANON_KEY!,
      { global: { headers: { Authorization: req.headers.authorization! } } }
    )

    const filePath = `${req.user!.id}/${Date.now()}-${title}-bundle.pdf`

    const { error: uploadError } = await supabaseClient.storage
      .from('note-files')
      .upload(filePath, Buffer.from(mergedBytes), {
        contentType: 'application/pdf',
      })

    if (uploadError) {
      return res.status(500).json({ error: uploadError.message })
    }

    const { data: publicUrlData } = supabaseClient.storage
      .from('note-files')
      .getPublicUrl(filePath)

    const { data: note, error: noteError } = await supabaseClient
      .from('notes')
      .insert({
        title,
        subject,
        description,
        author,
        content_url: publicUrlData.publicUrl,
        user_id: req.user!.id,
      })
      .select()
      .single()

    if (noteError) {
      return res.status(500).json({ error: noteError.message })
    }

    res.status(201).json(note)
  }
)

// app.get('/api/notes/:id', async (req, res) => {
//   const { id } = req.params

//   const { data, error } = await supabase
//     .from('notes')
//     .select('*')
//     .eq('id', id)
//     .single()

//   if (error) {
//     return res.status(404).json({
//       message: 'Page not found!',
//     })
//   }

//   res.json(data)
// })

// app.post('/api/notes', requireAuth, async (req: AuthedRequest, res) => {
//   const { title, subject, description, content_url } = req.body
//   const saves = 0

//   // Use the verified user's info instead of trusting anything
//   // the client could put in the request body.
//   const author = req.user!.id

//   const newNote = {
//     title,
//     subject,
//     description,
//     content_url,
//     author,
//     saves,
//   }

//   const { data, error } = await supabase.from('notes').insert(newNote).select()

//   if (error) {
//     console.log(error.message)
//     return res.status(500).json({ error: error.message })
//   }

//   res.json(data[0])
// })

// app.delete('/api/notes/:id', requireAuth, async (req: AuthedRequest, res) => {
//   const { id } = req.params

//   const { data, error } = await supabase
//     .from('notes')
//     .delete()
//     .eq('id', id)
//     .select()

//   if (error) {
//     return res.status(403).json({
//       message: 'Delete failed',
//       error: error.message,
//     })
//   }

//   if (!data || data.length === 0) {
//     return res.status(404).json({
//       message: 'No note deleted (not found or no permission)',
//     })
//   }

//   res.json({
//     message: 'Note deleted successfully',
//   })
// })

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`)
})
