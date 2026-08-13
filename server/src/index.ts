import cors from 'cors'
import express from 'express'
import multer from 'multer'
import { PDFDocument, PDFPage } from 'pdf-lib'
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

import cron from 'node-cron'
import { cleanupOrphanedFiles } from '@/jobs/cleanupJob'

// Runs daily at 3am
cron.schedule('0 3 * * *', async () => {
  try {
    const count = await cleanupOrphanedFiles()
    console.log(`[cleanup] removed ${count} orphaned file(s)`)
  } catch (err) {
    console.error('[cleanup] failed:', err)
  }
})

const app = express()
const PORT = process.env.PORT || 3000 // hosts like Render assign the port dynamically via this env var

const FILES_LIMIT = 200
const MAX_PDF_SIZE = 50 * 1024 * 1024 // applied both per-file (multer) and to the final merged/rebuilt PDF

console.log(process.env.SUPABASE_URL)

app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
  res.send('Study Hub backend is running')
})

// Substring search over notes by title and/or author
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

// Files stay in memory (not written to disk) since we need the raw bytes
// immediately to merge them with pdf-lib
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_PDF_SIZE, files: FILES_LIMIT },
})

const ALLOWED_TYPES = new Set(['application/pdf', 'image/png', 'image/jpeg'])

// upload notes route
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

    // Merge everything into one PDF: PDFs contribute all their pages,
    // images each become a single page sized to the image's own pixel dimensions
    let mergedBytes: Uint8Array
    try {
      const mergedPdf = await PDFDocument.create()

      for (const file of files) {
        if (file.mimetype === 'application/pdf') {
          const srcPdf = await PDFDocument.load(file.buffer)
          // Copying all pages in one call (not one at a time) lets pdf-lib
          // dedupe resources - fonts, images - shared across those pages
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

      // prevent file from exceeding total size limit
      if (mergedBytes.length > MAX_PDF_SIZE) {
        return res.status(400).json({
          error: `The combined PDF is ${(mergedBytes.length / 1024 / 1024).toFixed(1)}MB, which exceeds the ${MAX_PDF_SIZE / 1024 / 1024}MB upload limit.`,
        })
      }
    } catch (err) {
      console.log(err)
      return res.status(400).json({ error: 'Could not merge files into a PDF' })
    }

    // Act as the requesting user so for Supabase's RLS policies
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

    const { data: note, error: noteError } = await supabaseClient
      .from('notes')
      .insert({
        title,
        subject,
        description,
        author,
        saves: 0,
        content_url,
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

    // Generate and attach the preview after responding, so the client
    // doesn't wait on it
    try {
      const previewPng = await renderFirstPageToPng(mergedBytes)
      const preview_url = await uploadPreviewToSupabase(
        previewPng,
        req.user!.id,
        title,
        supabaseClient
      )
      await supabaseClient
        .from('notes')
        .update({ preview_url })
        .eq('id', note.id)
    } catch (err) {
      console.error('Failed to generate note preview:', err)
    }
  }
)

// Describes where one page in an edited note comes from
// index and pageIndex are essentially the same thing, just named differently to avoid confusion
type PageSpec =
  | { source: 'existing'; index: number }
  | { source: 'new'; fileIndex: number; pageIndex: number }

// Edit notes route
app.post(
  '/api/notes/:id/edit',
  requireAuth,
  upload.array('files', FILES_LIMIT),
  async (req: AuthedRequest, res) => {
    const { id } = req.params
    const files = (req.files as Express.Multer.File[]) ?? []
    const newNoteData = JSON.parse(req.body.newNoteData)

    console.log('Editing note', id, 'and new files', files)

    // `pages` arrives as a JSON string - multipart/form-data fields are
    // always plain strings, so the client stringifies the page order
    let spec: PageSpec[]
    try {
      spec = JSON.parse(req.body.pages)
    } catch {
      return res.status(400).json({ error: 'pages must be valid JSON' })
    }
    if (!Array.isArray(spec) || spec.length === 0) {
      return res.status(400).json({ error: 'pages must be a non-empty array' })
    }

    // console.log('Page spec:', spec)

    const invalid = files.find((f) => !ALLOWED_TYPES.has(f.mimetype))
    if (invalid) {
      return res
        .status(400)
        .json({ error: `Unsupported file type: ${invalid.originalname}.` })
    }

    const supabaseClient = getRequestScopedClient(req)

    // Fetch note
    const { data: note, error: noteError } = await supabaseClient
      .from('notes')
      .select('*')
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

      // Lazily load and cache each uploaded file as a PDFDocument, since
      // the same file can contribute more than one page to the spec
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

      // Copy every existing page in one batched call (not one call per
      // page) so pdf-lib dedupes shared resources - fonts, images -
      // across them.
      const existingIndices = spec
        .filter((entry) => entry.source === 'existing')
        .map((entry) => entry.index)
      const copiedExistingPages = await newPdf.copyPages(
        originalPdf,
        existingIndices
      )

      // Same batching per uploaded file for newly-added PDF pages: group
      // the page indices needed from each file before copying, so a file
      // contributing multiple pages only has its resources copied once
      const newPdfPageIndicesByFile = new Map<number, number[]>()
      for (const entry of spec) {
        if (entry.source !== 'new') continue
        const file = files[entry.fileIndex]
        if (!file || file.mimetype !== 'application/pdf') continue

        const indices = newPdfPageIndicesByFile.get(entry.fileIndex) ?? []
        indices.push(entry.pageIndex)
        newPdfPageIndicesByFile.set(entry.fileIndex, indices)
      }

      const copiedNewPagesByFile = new Map<number, PDFPage[]>()
      for (const [fileIndex, pageIndices] of newPdfPageIndicesByFile) {
        const srcPdf = await loadNewPdf(fileIndex)
        copiedNewPagesByFile.set(
          fileIndex,
          await newPdf.copyPages(srcPdf, pageIndices)
        )
      }
      const newPageCursorByFile = new Map<number, number>()

      // Walk the spec in final order, pulling already-copied pages out of
      // the batches above by position instead of re-copying - this is
      // what actually interleaves old and new pages the way the user
      // arranged them
      let existingPageCursor = 0
      for (const entry of spec) {
        if (entry.source === 'existing') {
          newPdf.addPage(copiedExistingPages[existingPageCursor])
          existingPageCursor++
          continue
        }

        const file = files[entry.fileIndex]
        if (!file)
          throw new Error(`Missing uploaded file at index ${entry.fileIndex}`)

        if (file.mimetype === 'application/pdf') {
          const cursor = newPageCursorByFile.get(entry.fileIndex) ?? 0
          const page = copiedNewPagesByFile.get(entry.fileIndex)![cursor]
          newPdf.addPage(page)
          newPageCursorByFile.set(entry.fileIndex, cursor + 1)
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
      // Falls back to the existing title if the client didn't send a new
      // one - only used to name the uploaded file
      publicUrl = await uploadPdfToSupabase(
        resultBytes,
        req.user!.id,
        note.title,
        supabaseClient
      )
    } catch (err) {
      return res.status(500).json({ error: 'Failed to upload PDF to Supabase' })
    }

    // Update the note's row with the new data and urls
    const { data: updatedNote, error: updateError } = await supabaseClient
      .from('notes')
      .update({
        title: newNoteData.title ?? note.title,
        subject: newNoteData.subject ?? note.subject,
        description: newNoteData.description ?? note.description,
        content_url: publicUrl,
        updated_at: new Date().toISOString(),
      })
      .eq('id', note.id)

    if (updateError) {
      console.error('Failed to update note:', updateError)
      return res.status(500).json({ error: 'Failed to update note' })
    }

    res.sendStatus(201)

    // Generate and attach the preview after responding, so the client
    // doesn't wait on it
    try {
      const previewPng = await renderFirstPageToPng(resultBytes)
      const preview_url = await uploadPreviewToSupabase(
        previewPng,
        req.user!.id,
        newNoteData.title,
        supabaseClient
      )
      await supabaseClient
        .from('notes')
        .update({ preview_url })
        .eq('id', note.id)
    } catch (err) {
      console.error('Failed to generate note preview:', err)
    }
  }
)

// Express recognizes this as an error handler specifically because it
// takes 4 arguments (err, req, res, next) - any error thrown in an async
// route or passed to next() ends up here
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
