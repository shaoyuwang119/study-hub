import { useState } from 'react'
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

function NoteCard({ note, isSaved, onToggleSave }: NoteCardProps) {
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

  return (
    <div
      className={`flex h-24 w-md cursor-pointer flex-col overflow-hidden rounded-lg border border-l-4 border-slate-200 p-2.5 transition-shadow duration-100 hover:shadow-md ${color.accent} ${color.wash}`}
    >
      <div className="flex h-full gap-3">
        <div
          className={`flex h-full items-center border-r-2 ${color.text} pr-3`}
        >
          <FontAwesomeIcon
            icon={icon}
            className={`shrink-0 text-lg ${color.text}`}
          />
        </div>
        <div className="flex h-full flex-1 flex-col">
          <div className="flex items-start justify-between gap-2">
            <h3 className="line-clamp-2 font-serif text-base font-semibold text-slate-800">
              {note.title}
            </h3>
            <span
              className={`w-fit shrink-0 rounded-md px-3 py-1 text-xs font-medium whitespace-nowrap ${color.bg} ${color.text}`}
            >
              {note.subject?.name}
            </span>
          </div>
          <div className="mt-auto flex">
            <p className="mt-1 text-xs font-semibold text-slate-600">
              {note.author}
            </p>

            <button
              onClick={handleToggleSave}
              title={optimisticSaved ? 'Unsave this note' : 'Save this note'}
              className={`mt-auto ml-auto flex cursor-pointer items-center gap-1 text-xs transition-all duration-75 active:scale-110 ${
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
