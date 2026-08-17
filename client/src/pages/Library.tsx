import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronDown } from '@fortawesome/free-solid-svg-icons'

import { useSubjects } from '@/lib/subjects'
import { getCategoryColor, CATEGORY_COLORS } from '@/lib/categoryColors'
import { usePageTitle } from '@/lib/usePageTitle'
import { Title } from '@/components'

const CATEGORIES = Object.keys(CATEGORY_COLORS)

function Library() {
  const navigate = useNavigate()
  const subjects = useSubjects()
  const [expanded, setExpanded] = useState<Set<string>>(new Set())

  usePageTitle('Library | StudyNote')

  function toggleCategory(category: string) {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(category)) {
        next.delete(category)
      } else {
        next.add(category)
      }
      return next
    })
  }

  return (
    <div className="flex h-full flex-1">
      <div className="flex-1 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-gutter-stable flex-col overflow-y-auto bg-slate-50 p-6">
        <Title
          title="Library"
          description="Browse notes by subject and category"
        />

        <div className="flex flex-col gap-3">
          {CATEGORIES.map((category) => {
            const color = getCategoryColor(category)
            const isOpen = expanded.has(category)
            const categorySubjects = subjects.filter(
              (s) => s.category === category
            )

            return (
              <div
                key={category}
                className="overflow-hidden rounded-xl border border-slate-200 bg-white"
              >
                <button
                  onClick={() => toggleCategory(category)}
                  className={`flex w-full cursor-pointer items-center justify-between px-4 py-3 text-left transition-colors ${color.wash}`}
                >
                  <span
                    className={`font-serif text-lg font-medium ${color.text}`}
                  >
                    {category}
                  </span>
                  <FontAwesomeIcon
                    icon={faChevronDown}
                    className={`text-sm text-slate-400 transition-transform ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                <div
                  className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${
                    isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="flex flex-wrap gap-2 border-t border-slate-100 p-4">
                      {categorySubjects.length === 0 ? (
                        <p className="text-sm text-slate-400">
                          No subjects in this category yet.
                        </p>
                      ) : (
                        categorySubjects.map((subject) => (
                          <button
                            key={subject.id}
                            onClick={() =>
                              navigate(`/search?subject=${subject.id}`)
                            }
                            className={`cursor-pointer rounded-full px-3 py-1.5 text-sm font-medium transition hover:opacity-80 ${color.bg} ${color.text}`}
                          >
                            {subject.name}
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default Library
