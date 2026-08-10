import { Link } from 'react-router-dom'

import { NoteCardMini } from '@/components'
import type { Note } from '@/types'

type RightbarProps = {
  notes: Note[]
}

function Rightbar({ notes }: RightbarProps) {
  return (
    <aside className="w-72 overflow-y-auto border-l border-gray-200 bg-white px-4 py-8">
      <div className="text-xl text-zinc-800">My saved</div>
      <div className="mt-4 flex flex-col gap-y-2">
        {notes.map((note) => (
          <Link key={note.id} to={`/notes/${note.id}`} className="block">
            <NoteCardMini note={note} />
          </Link>
        ))}
      </div>
    </aside>
  )
}

export default Rightbar
