import cors from 'cors'
import express from 'express'
import multer from 'multer'
import { PDFDocument } from 'pdf-lib'
import { createClient, SupabaseClient } from '@supabase/supabase-js'

import { supabase } from '@/config/supabase'
import type { AuthedRequest } from '@/middleware/auth'
import { requireAuth } from '@/middleware/auth'
import {
  uploadPdfToSupabase,
  uploadPreviewToSupabase,
} from './utils/uploadFile'
import { getRequestScopedClient } from './utils/supabaseClient'
import { renderFirstPageToPng } from './utils/generatePreview'
import { get } from 'node:http'

const app = express()
const PORT = process.env.PORT || 3000

const FILES_LIMIT = 200
const MAX_PDF_SIZE = 50 * 1024 * 1024

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
  limits: { fileSize: MAX_PDF_SIZE, files: FILES_LIMIT },
})

const ALLOWED_TYPES = new Set(['application/pdf', 'image/png', 'image/jpeg'])

app.post(
  '/api/notes',
  requireAuth,
  upload.array('files', FILES_LIMIT),
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

      if (mergedBytes.length > MAX_PDF_SIZE) {
        return res.status(400).json({
          error: `The combined PDF is ${(mergedBytes.length / 1024 / 1024).toFixed(1)}MB, which exceeds the ${MAX_PDF_SIZE / 1024 / 1024}MB upload limit.`,
        })
      }
    } catch (err) {
      console.log(err)
      return res.status(400).json({ error: 'Could not merge files into a PDF' })
    }

    // Act as the requesting user so Supabase's RLS applies normally
    const supabaseClient = getRequestScopedClient(req)

    let content_url: string
    try {
      content_url = await uploadPdfToSupabase(
        mergedBytes,
        req.user!.id,
        title,
        supabaseClient
      )
    } catch (err) {
      return res.status(500).json({ error: 'Failed to upload PDF to Supabase' })
    }

    let preview_url: string | null = null
    try {
      const previewPng = await renderFirstPageToPng(mergedBytes)
      preview_url = await uploadPreviewToSupabase(
        previewPng,
        req.user!.id,
        title,
        supabaseClient
      )
    } catch (err) {
      console.error('Failed to generate note preview:', err)
    }

    const { data: note, error: noteError } = await supabaseClient
      .from('notes')
      .insert({
        title,
        subject,
        description,
        author,
        saves: 0,
        content_url,
        preview_url,
        user_id: req.user!.id,
      })
      .select()
      .single()

    if (noteError || !note) {
      return res
        .status(500)
        .json({ error: noteError?.message ?? 'Failed to create note' })
    }

    res.status(201).json(note)
  }
)

type PageSpec =
  | { source: 'existing'; index: number }
  | { source: 'new'; fileIndex: number; pageIndex: number }

app.post(
  '/api/notes/:id/edit',
  requireAuth,
  upload.array('files', FILES_LIMIT),
  async (req: AuthedRequest, res) => {
    const { id } = req.params
    const files = (req.files as Express.Multer.File[]) ?? []
    const { noteTitle } = req.body as { noteTitle: string }

    console.log('Editing note', id, 'with title', noteTitle, 'and files', files)

    let spec: PageSpec[]
    try {
      spec = JSON.parse(req.body.pages)
    } catch {
      return res.status(400).json({ error: 'pages must be valid JSON' })
    }
    if (!Array.isArray(spec) || spec.length === 0) {
      return res.status(400).json({ error: 'pages must be a non-empty array' })
    }

    const invalid = files.find((f) => !ALLOWED_TYPES.has(f.mimetype))
    if (invalid) {
      return res
        .status(400)
        .json({ error: `Unsupported file type: ${invalid.originalname}.` })
    }

    const supabaseClient = getRequestScopedClient(req)

    const { data: note, error: noteError } = await supabaseClient
      .from('notes')
      .select('content_url, title')
      .eq('id', id)
      .single()

    if (noteError || !note) {
      return res.status(404).json({ error: 'Note not found!' })
    }

    let resultBytes: Uint8Array
    try {
      const originalBytes = await fetch(note.content_url).then((r) =>
        r.arrayBuffer()
      )
      const originalPdf = await PDFDocument.load(originalBytes)
      const newPdf = await PDFDocument.create()

      const newPdfCache = new Map<number, PDFDocument>()
      const loadNewPdf = async (fileIndex: number) => {
        if (!newPdfCache.has(fileIndex)) {
          newPdfCache.set(
            fileIndex,
            await PDFDocument.load(files[fileIndex]!.buffer)
          )
        }
        return newPdfCache.get(fileIndex)!
      }

      for (const entry of spec) {
        if (entry.source === 'existing') {
          const [page] = await newPdf.copyPages(originalPdf, [entry.index])
          newPdf.addPage(page)
          continue
        }

        const file = files[entry.fileIndex]
        if (!file)
          throw new Error(`Missing uploaded file at index ${entry.fileIndex}`)

        if (file.mimetype === 'application/pdf') {
          const srcPdf = await loadNewPdf(entry.fileIndex)
          const [page] = await newPdf.copyPages(srcPdf, [entry.pageIndex])
          newPdf.addPage(page)
        } else {
          const image =
            file.mimetype === 'image/png'
              ? await newPdf.embedPng(file.buffer)
              : await newPdf.embedJpg(file.buffer)
          const page = newPdf.addPage([image.width, image.height])
          page.drawImage(image, {
            x: 0,
            y: 0,
            width: image.width,
            height: image.height,
          })
        }
      }

      resultBytes = await newPdf.save()

      if (resultBytes.length > MAX_PDF_SIZE) {
        return res.status(400).json({
          error: `The combined PDF is ${(resultBytes.length / 1024 / 1024).toFixed(1)}MB, which exceeds the ${MAX_PDF_SIZE / 1024 / 1024}MB upload limit.`,
        })
      }
    } catch (err) {
      console.log(err)
      return res
        .status(400)
        .json({ error: 'Could not build PDF from the requested pages' })
    }

    let publicUrl: string
    try {
      publicUrl = await uploadPdfToSupabase(
        resultBytes,
        req.user!.id,
        noteTitle ?? note.title,
        supabaseClient
      )
    } catch (err) {
      return res.status(500).json({ error: 'Failed to upload PDF to Supabase' })
    }

    let previewUrl: string | null = null
    try {
      const previewPng = await renderFirstPageToPng(resultBytes)
      previewUrl = await uploadPreviewToSupabase(
        previewPng,
        req.user!.id,
        noteTitle ?? note.title,
        supabaseClient
      )
    } catch (err) {
      console.error('Failed to generate note preview:', err)
    }

    res.json({ content_url: publicUrl, preview_url: previewUrl })
  }
)

app.use(
  (
    err: unknown,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          error: `One of the files is over the ${MAX_PDF_SIZE / 1024 / 1024}MB per-file limit.`,
        })
      }
      return res.status(400).json({ error: err.message })
    }

    console.error(err)
    res.status(500).json({ error: 'Unexpected server error' })
  }
)

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`)
})
