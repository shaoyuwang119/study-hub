// Rightbar component displaying saved notes
import { NoteCard } from './'
import type { Note } from './Types'

// Props type for Rightbar component
type RightbarProps = {
  notes: Note[]
}

// Rightbar component displaying saved notes list
function Rightbar({ notes }: RightbarProps) {
  return (
    <aside className="w-100 border-l border-gray-200 bg-white px-6 py-8">
      <div className="text-2xl text-zinc-800">My saved</div>
      {/* Display each saved note as a card */}
      <div className="flex flex-col items-start mt-4 gap-y-4">
        {notes.map((note, index) => (
          <NoteCard
            key={index}
            title={note.title}
            subject={note.title}
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
