import type { Note } from '@/types'

type NoteCardMiniProps = {
  note: Note
}

function NoteCardMini({ note }: NoteCardMiniProps) {
  return (
    <div className="group w-full cursor-pointer rounded-md border border-slate-200 bg-white px-3 py-2 transition duration-200 hover:bg-slate-50">
      <h3 className="truncate text-sm font-medium text-slate-900 group-hover:underline">
        {note.title}
      </h3>
      <p className="mt-0.5 truncate text-xs text-slate-400">
        {note.subject} · {note.author}
      </p>
    </div>
  )
}

export default NoteCardMini
