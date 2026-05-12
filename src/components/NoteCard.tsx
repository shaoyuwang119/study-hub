type NoteCardProps = {
  title: string
  subject: string
  author: string
  preview: string
  saves: number
  color?: string
}

const fallbackImg = 'https://placehold.co/100x150/?text=No\\nPreview'

function NoteCard({
  title,
  subject,
  author,
  preview,
  saves,
  color = '#3b82f6',
}: NoteCardProps) {
  //console.log('preview url: ' + author)
  return (
    <div className="flex items-start gap-3 w-full h-32 rounded-lg border border-gray-200 bg-white p-4 hover:bg-zinc-50 hover:shadow-xs cursor-pointer transition-shadow duration-300">
      <div
        className=" h-2/3 w-1 rounded-full"
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
        <h3 className="text-md font-semibold text-gray-900">{title}</h3>
        <p className="mt-1 text-md text-gray-500">{subject}</p>
        <p className="mt-2 text-sm text-gray-400">
          {author} · {saves} saves
        </p>
      </div>
    </div>
  )
}

export default NoteCard
