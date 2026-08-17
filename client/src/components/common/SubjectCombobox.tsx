import { useEffect, useRef, useState } from 'react'

import { useSubjects } from '@/lib/subjects'
import { getCategoryColor } from '@/lib/categoryColors'

type SubjectComboboxProps = {
  value: number | null
  onChange: (subjectId: number) => void
  placeholder?: string
}

function SubjectCombobox({
  value,
  onChange,
  placeholder = 'Subject (required)',
}: SubjectComboboxProps) {
  const subjects = useSubjects()
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const selected = subjects.find((s) => s.id === value) ?? null

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
        setQuery('')
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const filtered = subjects.filter(
    (s) =>
      s.name.toLowerCase().includes(query.toLowerCase()) ||
      s.category.toLowerCase().includes(query.toLowerCase())
  )

  return (
    <div className="relative" ref={containerRef}>
      <input
        type="text"
        value={isOpen ? query : (selected?.name ?? '')}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => {
          setIsOpen(true)
          setQuery('')
        }}
        placeholder={placeholder}
        className={`w-full rounded-lg border border-slate-300 px-2 py-2 placeholder:text-slate-400 focus:border-slate-300 focus:outline-none ${
          selected ? 'text-slate-800' : 'text-slate-400'
        }`}
      />

      {isOpen && (
        <div className="absolute z-10 mt-1 max-h-48 w-full overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-lg">
          {filtered.length === 0 ? (
            <div className="px-3 py-2 text-sm text-slate-400">
              No subjects found
            </div>
          ) : (
            filtered.map((s) => {
              const color = getCategoryColor(s.category)
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => {
                    onChange(s.id)
                    setIsOpen(false)
                    setQuery('')
                  }}
                  className="flex w-full items-center justify-between px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-100"
                >
                  <span>{s.name}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${color.bg} ${color.text}`}
                  >
                    {s.category}
                  </span>
                </button>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}

export default SubjectCombobox
