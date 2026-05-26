import { NoteCard } from './'
import type { Note } from './Types'

type RightbarProps = {
  notes: Note[]
}

function Rightbar({ notes }: RightbarProps) {
  return (
    <aside className="w-100 border-l border-gray-200 bg-white px-6 py-8">
      <div className="text-2xl text-zinc-800">My saved</div>
      <div className="flex flex-col items-start mt-4 gap-y-4">
        {notes.map((note, index) => (
          <NoteCard
            key={index}
            title={note.title}
            subject={note.subject}
            author={note.author}
            preview={note.content_url}
            saves={note.saves}
          />
        ))}
      </div>
    </aside>
  )
}

export default Rightbar
