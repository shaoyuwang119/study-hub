import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faBookBookmark,
  faHouse,
  faCompass,
  faUser,
  faRightFromBracket,
  faBookOpen,
} from '@fortawesome/free-solid-svg-icons'

import { supabase } from '@/lib/supabase'

type SidebarItem = {
  label: string
  page: string
  icon: typeof faHouse
}

const sidebarItems: SidebarItem[] = [
  { label: 'Home', page: '/', icon: faHouse },
  { label: 'Explore', page: '/explore', icon: faCompass },
  // { label: 'Library', page: '/library', icon: faBookOpen },
  { label: 'Profile', page: '/profile', icon: faUser },
]

function Sidebar() {
  const navigate = useNavigate()
  const location = useLocation()
  const [isHovered, setIsHovered] = useState(false)

  const canMinimize = location.pathname.startsWith('/notes/')
  const isMinimized = canMinimize && !isHovered

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/login')
  }

  return (
    <div
      onMouseLeave={() => setIsHovered(false)}
      className={`h-screen shrink-0 ${canMinimize ? 'w-16' : 'w-64'}`}
    >
      <aside
        className={`fixed top-0 z-20 flex h-screen shrink-0 flex-col border-r border-gray-200 bg-white px-3 py-5 text-nowrap transition-all duration-200 ${
          isMinimized ? 'w-16' : canMinimize ? 'w-64 shadow-lg' : 'w-64'
        } `}
      >
        <NavLink
          key="logo"
          to="/"
          onMouseEnter={() => setIsHovered(true)}
          className="mb-8 flex items-center gap-2 gap-y-2"
        >
          <h1 className="text-3xl font-bold text-blue-800">
            <FontAwesomeIcon
              icon={faBookBookmark}
              className="mr-1.5"
            ></FontAwesomeIcon>
            <span
              className={`whitespace-nowrap transition-opacity duration-200 ${
                isMinimized ? 'opacity-0' : 'opacity-100'
              }`}
            >
              StudyNote
            </span>
          </h1>
        </NavLink>

        <nav onMouseEnter={() => setIsHovered(true)} className="space-y-1">
          {sidebarItems.map((item) => (
            <NavLink
              key={item.page}
              to={item.page}
              title={item.label}
              className={({ isActive }) =>
                `flex h-10 items-center gap-3 rounded-lg px-2 py-2 text-sm ${
                  isActive
                    ? 'bg-blue-100 font-medium text-zinc-900'
                    : 'text-zinc-600 hover:bg-zinc-100'
                }`
              }
            >
              <FontAwesomeIcon
                size="lg"
                icon={item.icon}
                className="w-4 shrink-0"
              />
              {!isMinimized && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>
        <button
          onClick={handleLogout}
          title="Log out"
          onMouseEnter={() => setIsHovered(true)}
          className={`mt-auto flex h-10 w-full cursor-pointer items-center gap-3 rounded-lg px-2 py-2 text-left text-sm font-medium text-zinc-600 hover:bg-zinc-100`}
        >
          <FontAwesomeIcon
            size="lg"
            icon={faRightFromBracket}
            className="w-4 shrink-0"
          />
          {!isMinimized && <span className="text-md">Log out</span>}
        </button>
      </aside>
    </div>
  )
}

export default Sidebar
