import type { Note } from './Types'

type NoteCardProps = {
  note: Note
  preview: string
  color?: string
}

const fallbackImg = 'https://placehold.co/100x150/?text=No\\nPreview'

function NoteCard({ note, preview, color = '#3b82f6' }: NoteCardProps) {
  //console.log('preview url: ' + author)
  preview = note.content_url
  return (
    <div className="hover:bg-zinc-0 flex h-32 w-full cursor-pointer items-start gap-3 rounded-lg border border-gray-200 bg-white p-4 transition-shadow duration-200 hover:shadow-xs">
      <div
        className="h-full w-1 rounded-full"
        style={{ backgroundColor: color }}
      />

      <img
        src={preview && preview.trim() ? preview : fallbackImg}
        className="h-full"
        onError={(e) => {
          e.currentTarget.src = fallbackImg
        }}
      />

      <div className="flex-1">
        <h3 className="text-md font-semibold text-gray-900">{note.title}</h3>
        <p className="text-md mt-1 text-gray-400">{note.subject}</p>
        <p className="mt-2 text-sm text-gray-400">
          {note.author} · {note.saves} saves
        </p>
      </div>
    </div>
  )
}

export default NoteCard
