import { use, useState } from 'react'
import type { Note } from '@/types'
import { getCategoryColor } from '@/lib/categoryColors'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faBook,
  faSquareRootVariable,
  faFlask,
  faBookAtlas,
  faLanguage,
  faComputer,
  faMasksTheater,
  faPersonSwimming,
  faStar as faStarSolid,
  type IconDefinition,
} from '@fortawesome/free-solid-svg-icons'
import { faStar as faStarRegular } from '@fortawesome/free-regular-svg-icons'

type NoteCardProps = {
  note: Note
  isSaved: boolean
  onToggleSave: (noteId: number, isSaved: boolean) => void
  authorLabel?: string
}

const icons: Record<string, IconDefinition> = {
  English: faBook,
  Math: faSquareRootVariable,
  Science: faFlask,
  'Social Studies': faBookAtlas,
  'World Language': faLanguage,
  CTE: faComputer,
  'Fine Arts': faMasksTheater,
  Athletic: faPersonSwimming,
}

function NoteCard({
  note,
  isSaved,
  onToggleSave,
  authorLabel,
}: NoteCardProps) {
  const icon = (note.subject && icons[note.subject.category]) || faBook
  const color = getCategoryColor(note.subject?.category)

  // Optimistic local copies so the star/count update instantly on click,
  // without needing the parent's whole notes list to re-render.
  const [optimisticSaved, setOptimisticSaved] = useState(isSaved)
  const [optimisticCount, setOptimisticCount] = useState(note.saves)

  const handleToggleSave = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setOptimisticSaved(!optimisticSaved)
    setOptimisticCount(optimisticCount + (optimisticSaved ? -1 : 1))
    onToggleSave(note.id, optimisticSaved)
  }

  const [time, setTime] = useState<Date>(
    new Date(note.updated_at ?? note.created_at)
  )

  const displayTime = time.toLocaleDateString()

  return (
    <div
      className={`flex h-20 w-md cursor-pointer flex-col overflow-hidden rounded-lg border border-slate-200 p-2.5 transition-colors duration-200 ${color.hoverBg}`}
    >
      <div className="flex h-full gap-3">
        <div className={`my-1 flex h-full`}>
          <FontAwesomeIcon
            icon={icon}
            className={`shrink-0 text-xl ${color.text}`}
          />
        </div>
        <div className="flex h-full flex-1 flex-col">
          <div className="flex h-full items-start justify-between gap-2">
            <p className="line-clamp-2 flex h-full items-start font-sans text-sm font-semibold text-slate-800">
              {note.title}
            </p>
            <span
              className={`w-fit shrink-0 rounded-md px-3 py-1 text-xs font-medium whitespace-nowrap ${color.bg} ${color.text}`}
            >
              {note.subject?.name}
            </span>
          </div>
          <div className="flex">
            <p className="text-xs font-semibold text-slate-600">
              {authorLabel ?? note.author}
              <span className="text-slate-400"> • {displayTime}</span>
            </p>

            <button
              onClick={handleToggleSave}
              title={optimisticSaved ? 'Unsave this note' : 'Save this note'}
              className={`mt-auto ml-auto flex cursor-pointer items-center gap-1 text-xs transition-all active:scale-105 ${
                optimisticSaved
                  ? 'text-amber-500'
                  : 'text-slate-400 hover:text-amber-500'
              }`}
            >
              {optimisticCount}
              <FontAwesomeIcon
                icon={optimisticSaved ? faStarSolid : faStarRegular}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NoteCard
