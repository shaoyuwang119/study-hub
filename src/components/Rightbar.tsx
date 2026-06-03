import { NoteCard } from './'
import type { Note } from './Types'

type RightbarProps = {
  notes: Note[]
}

function Rightbar({ notes }: RightbarProps) {
  return (
    <aside className="w-100 overflow-y-auto border-l border-gray-200 bg-white px-6 py-8">
      <div className="text-2xl text-zinc-800">My saved</div>
      <div className="mt-4 flex flex-col items-start gap-y-4">
        {notes.map((note, index) => (
          <NoteCard key={index} note={note} preview={note.content_url} />
        ))}
      </div>
    </aside>
  )
}

export default Rightbar
