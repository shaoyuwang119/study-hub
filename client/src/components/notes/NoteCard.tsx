import type { Note } from '@/types'
import { useState } from 'react'

type NoteCardProps = {
  note: Note
  preview: string
  // color?: string
}

const fallbackImg = 'https://placehold.co/100x150/?text=No\\nPreview'

function NoteCard({ note, preview }: NoteCardProps) {
  const [imageError, setImageError] = useState(false)
  const showingFallback = imageError || !preview?.trim()

  return (
    <div className="flex h-54 w-56 cursor-pointer flex-col overflow-hidden rounded-lg border border-gray-200 bg-white transition-shadow duration-100 hover:shadow-md">
      <img
        src={showingFallback ? fallbackImg : preview}
        className={`h-26 w-full object-cover ${
          showingFallback ? 'object-center' : 'object-top'
        }`}
        onError={() => setImageError(true)}
      />

      <div className="flex h-full flex-col p-2.5">
        <h3 className="line-clamp text-sm font-semibold text-gray-800">
          {note.title}
        </h3>
        <p className="mt-1 text-xs">
          <span className="font-semibold text-zinc-600">{note.author}</span> ·{' '}
          <span className="font-normal text-zinc-400">{note.saves} saves</span>
        </p>
        <div className="mt-auto ml-auto w-fit rounded-md bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-700">
          {note.subject}
        </div>
      </div>
    </div>
  )
}

export default NoteCard
