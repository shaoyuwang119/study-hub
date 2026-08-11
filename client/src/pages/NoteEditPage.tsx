import { useEffect, useState, type ComponentProps } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import * as pdfjsLib from 'pdfjs-dist'
import { PDFDocument } from 'pdf-lib'

import { DragDropProvider } from '@dnd-kit/react'
import { isSortable, useSortable } from '@dnd-kit/react/sortable'

import { supabase } from '@/lib/supabase'
import '@/lib/pdf'
import { useSubjects } from '@/lib/subjects'

import type { Note } from '@/types'

type FetchState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; note: Note }

async function renderPdfThumbnails(url: string): Promise<string[]> {
  const pdf = await pdfjsLib.getDocument({ url }).promise
  const thumbnails: string[] = []

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const viewport = page.getViewport({ scale: 0.2 })

    const canvas = document.createElement('canvas')
    canvas.width = viewport.width
    canvas.height = viewport.height
    const context = canvas.getContext('2d')!

    await page.render({ canvasContext: context, canvas, viewport }).promise
    thumbnails.push(canvas.toDataURL())
  }

  return thumbnails
}

function SortablePage({
  pageIndex,
  displayPosition,
  thumbnail,
}: {
  pageIndex: number
  displayPosition: number
  thumbnail: string
}) {
  const { ref, isDragging } = useSortable({
    id: pageIndex,
    index: displayPosition,
  })

  return (
    <div
      ref={ref}
      className={`flex cursor-grab items-center gap-3 rounded-lg border border-gray-200 bg-white p-2 transition-shadow active:cursor-grabbing ${
        isDragging ? 'z-20 shadow-xl' : ''
      }`}
    >
      <span className="w-5 text-center text-xs text-gray-400">
        {displayPosition + 1}
      </span>
      <img
        src={thumbnail}
        alt={`Page ${pageIndex + 1}`}
        className="h-32 w-auto rounded border border-gray-200"
      />
    </div>
  )
}

function NoteEditPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const SUBJECTS = useSubjects()

  const [state, setState] = useState<FetchState>({ status: 'loading' })
  const [title, setTitle] = useState('')
  const [subject, setSubject] = useState('')
  const [description, setDescription] = useState('')

  const [pageThumbnails, setPageThumbnails] = useState<string[]>([])
  const [pageOrder, setPageOrder] = useState<number[]>([])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function fetchNote() {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('id', id)
        .single()

      if (error || !data) {
        setState({
          status: 'error',
          message: error?.message ?? 'Note not found',
        })
        return
      }

      setState({ status: 'ready', note: data })
      setTitle(data.title)
      setSubject(data.subject)
      setDescription(data.description)
    }

    fetchNote()
  }, [id])

  useEffect(() => {
    if (state.status !== 'ready') return

    renderPdfThumbnails(state.note.content_url).then((thumbnails) => {
      setPageThumbnails(thumbnails)
      setPageOrder(thumbnails.map((_, i) => i))
    })
  }, [state])

  const handleDragEnd: NonNullable<
    ComponentProps<typeof DragDropProvider>['onDragEnd']
  > = (event) => {
    if (event.canceled) return

    const { source } = event.operation
    if (!isSortable(source)) return

    const { initialIndex, index } = source
    if (initialIndex === index) return

    setPageOrder((prev) => {
      const newOrder = [...prev]
      const [moved] = newOrder.splice(initialIndex, 1)
      newOrder.splice(index, 0, moved)
      return newOrder
    })
  }

  async function handleSave() {
    if (state.status !== 'ready') return
    const { note } = state
    setSaving(true)

    const originalBytes = await fetch(note.content_url).then((r) =>
      r.arrayBuffer()
    )
    const originalPdf = await PDFDocument.load(originalBytes)

    const newPdf = await PDFDocument.create()
    const copiedPages = await newPdf.copyPages(originalPdf, pageOrder)
    copiedPages.forEach((page) => newPdf.addPage(page))

    const newBytes = await newPdf.save()
    const newBlob = new Blob([newBytes as BlobPart], {
      type: 'application/pdf',
    })
    const filePath = `${note.user_id}/${Date.now()}-${note.title}.pdf`

    const { error: uploadError } = await supabase.storage
      .from('note-files')
      .upload(filePath, newBlob)

    if (uploadError) {
      setSaving(false)
      alert(uploadError.message)
      return
    }

    const { data: urlData } = supabase.storage
      .from('note-files')
      .getPublicUrl(filePath)

    const { error: updateError } = await supabase
      .from('notes')
      .update({
        title,
        subject,
        description,
        content_url: urlData.publicUrl,
        updated_at: new Date().toISOString(),
      })
      .eq('id', note.id)

    setSaving(false)

    if (updateError) {
      alert(updateError.message)
      return
    }

    navigate(`/notes/${note.id}`)
  }

  if (state.status === 'loading') return <div>Loading...</div>
  if (state.status === 'error') return <div>{state.message}</div>

  return (
    <div className="flex h-full w-full gap-8 p-6">
      <div className="flex w-[45%] flex-col gap-2 overflow-y-auto rounded-2xl border border-gray-200 bg-zinc-50 p-3">
        <DragDropProvider onDragEnd={handleDragEnd}>
          {pageOrder.map((pageIndex, displayPosition) => (
            <SortablePage
              key={pageIndex}
              pageIndex={pageIndex}
              displayPosition={displayPosition}
              thumbnail={pageThumbnails[pageIndex]}
            />
          ))}
        </DragDropProvider>
      </div>

      <div className="flex flex-1 flex-col gap-3">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="rounded-lg border border-gray-200 p-2 text-2xl font-bold focus:border-gray-300 focus:outline-none"
        />

        <select
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className={`rounded-lg border border-gray-300 px-2 py-2 focus:border-gray-300 focus:outline-none ${subject === '' ? 'text-zinc-400' : 'text-zinc-800'}`}
        >
          <option value="" disabled>
            Subject (required)
          </option>
          {SUBJECTS.map((s) => (
            <option key={s} value={s} className="text-zinc-700">
              {s}
            </option>
          ))}
        </select>

        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="flex-1 resize-none rounded-lg border border-gray-200 p-2 focus:border-gray-300 focus:outline-none"
        />

        <div className="flex gap-3">
          <button
            onClick={() => navigate(`/notes/${id}`)}
            className="cursor-pointer rounded-md border border-gray-300 px-4 py-2 text-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="cursor-pointer rounded-md bg-blue-500 px-4 py-2 text-sm text-white hover:bg-blue-600 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default NoteEditPage
