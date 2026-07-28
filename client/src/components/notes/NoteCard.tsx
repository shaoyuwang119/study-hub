import type { Note } from '@/types'

type NoteCardProps = {
  note: Note
  preview: string
  // color?: string
}

const fallbackImg = 'https://placehold.co/100x150/?text=No\\nPreview'

function NoteCard({ note, preview }: NoteCardProps) {
  return (
    <div className="flex h-50 w-56 cursor-pointer flex-col overflow-hidden rounded-lg border border-gray-200 bg-white transition-shadow duration-200 hover:shadow-md">
      {/* Image */}
      <img
        src={preview && preview.trim() ? preview : fallbackImg}
        className="h-26 w-full bg-gray-100 object-cover"
        onError={(e) => {
          e.currentTarget.src = fallbackImg
        }}
      />

      {/* Content */}
      <div className="flex-1 p-2.5">
        <h3 className="line-clamp text-sm font-semibold text-gray-800">
          {note.title}
        </h3>
        <p className="mt-1 text-xs text-gray-400">
          {note.author} · {note.saves} saves
        </p>
        <div className="mt-3 ml-auto flex w-fit rounded-md bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-700">
          {note.subject}
        </div>
      </div>
    </div>
  )
}

export default NoteCard
