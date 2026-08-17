import { NavLink, useNavigate } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faBookBookmark,
  faMagnifyingGlass,
  faBell,
} from '@fortawesome/free-solid-svg-icons'
import { faSquarePlus } from '@fortawesome/free-regular-svg-icons'

type HeaderProps = {
  searchQuery: string
  onSearchChange: (value: string) => void
  profileName: string
  onCreateClick: () => void
}

export default function Header({
  searchQuery,
  onSearchChange,
  profileName,
  onCreateClick,
}: HeaderProps) {
  const navigate = useNavigate()

  return (
    <header className="flex h-16 w-full shrink-0 items-center gap-4 border-b border-slate-200 bg-white px-6">
      <NavLink
        to={'/'}
        className="text-sea-navy shrink-0 font-serif text-2xl font-bold select-none"
      >
        <FontAwesomeIcon icon={faBookBookmark} className="mr-1.5" />
        StudyNote
      </NavLink>

      <div className="flex flex-1 justify-center">
        <div className="relative w-full max-w-150">
          <FontAwesomeIcon
            icon={faMagnifyingGlass}
            className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm text-slate-400"
          />
          <input
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search notes, classes, subjects..."
            className="focus:border-sea-teal focus:ring-sea-lavender w-full rounded-full border border-slate-200 bg-slate-100 py-2 pr-3 pl-9 text-sm focus:ring-2 focus:outline-none"
          />
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-3">
        <button
          onClick={onCreateClick}
          className="border-sea-teal text-sea-teal hover:bg-sea-teal flex h-10 cursor-pointer items-center gap-2 rounded-full border px-4 text-base font-medium transition-all duration-200 hover:text-white"
        >
          <FontAwesomeIcon icon={faSquarePlus} />
          Create
        </button>

        <button
          title="Notifications"
          className="flex size-10 cursor-pointer items-center justify-center rounded-full text-base text-slate-500 hover:bg-slate-100 hover:text-slate-800"
        >
          <FontAwesomeIcon icon={faBell} />
        </button>

        <div
          onClick={() => navigate('/profile')}
          className="transition:color flex h-10 cursor-pointer items-center gap-3 rounded-full px-1 duration-200 hover:bg-slate-100"
        >
          <div className="bg-sea-sky text-sea-teal-dark flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold">
            {profileName ? profileName.charAt(0).toUpperCase() : '?'}
          </div>
          <span className="mr-2 text-sm font-medium whitespace-nowrap text-slate-900">
            {profileName || 'Loading...'}
          </span>
        </div>
      </div>
    </header>
  )
}
