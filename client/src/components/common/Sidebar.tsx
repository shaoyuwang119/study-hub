import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faBookBookmark,
  faGear,
  faHouse,
  faCompass,
  faRightFromBracket,
  faBookOpen,
  faSun,
  faMoon,
} from '@fortawesome/free-solid-svg-icons'

import { supabase } from '@/lib/supabase'
import type { Profile } from '@/components/auth/ProtectedRoute'

type SidebarItem = {
  label: string
  page: string
  icon: typeof faHouse
}

type SidebarProps = {
  profile: Profile
}

const sidebarItems: SidebarItem[] = [
  { label: 'Home', page: '/', icon: faHouse },
  { label: 'Explore', page: '/explore', icon: faCompass },
  { label: 'Library', page: '/library', icon: faBookOpen },
  { label: 'Settings', page: '/settings', icon: faGear },
]

function Sidebar({ profile }: SidebarProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const [isHovered, setIsHovered] = useState(false)
  const [isProfileHovered, setIsProfileHovered] = useState(false)

  const canMinimize = location.pathname.startsWith('/notes/')
  const isMinimized = canMinimize && !isHovered

  const [isDarkMode, setIsDarkMode] = useState(() =>
    document.documentElement.classList.contains('dark')
  )

  function toggleTheme() {
    const root = document.documentElement
    const next = !isDarkMode

    // Momentarily disable every transition in the app so nothing gets stuck
    // mid-transition when the sea-*/slate-*/white variables swap under
    // .dark - then re-enable once the new colors have actually painted.
    root.classList.add('theme-transitioning')
    root.classList.toggle('dark', next)
    localStorage.setItem('theme', next ? 'dark' : 'light')
    setIsDarkMode(next)

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        root.classList.remove('theme-transitioning')
      })
    })
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/login')
  }

  return (
    <div
      onMouseLeave={() => setIsHovered(false)}
      className={`h-[calc(100vh-4rem)] shrink-0 ${canMinimize ? 'w-16' : 'w-64'}`}
    >
      <aside
        className={`fixed top-16 z-20 flex h-[calc(100vh-4rem)] shrink-0 flex-col overflow-hidden border-r border-slate-200 bg-white px-3 py-4 text-nowrap transition-all duration-200 ${
          isMinimized ? 'w-16' : canMinimize ? 'w-64 shadow-lg' : 'w-64'
        } `}
      >
        <NavLink
          to="/profile"
          onMouseEnter={() => {
            setIsHovered(true)
            setIsProfileHovered(true)
          }}
          onMouseLeave={() => setIsProfileHovered(false)}
          className={({ isActive }) =>
            `flex h-10 items-center gap-3 rounded-xl px-1 py-2 text-sm transition-colors duration-200 ${
              isActive
                ? 'bg-sea-teal-dark font-medium text-white'
                : 'hover:bg-sea-lavender text-slate-600'
            }`
          }
        >
          <div className="bg-sea-sky text-sea-teal-dark flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold">
            {profile.name ? profile.name.charAt(0).toUpperCase() : '?'}
          </div>

          <div>
            <div
              className={`-ml-0.5 overflow-hidden whitespace-nowrap transition-opacity duration-100 ${
                isMinimized ? 'opacity-0' : 'opacity-100'
              }`}
            >
              Profile
            </div>
          </div>

          {/* {isProfileHovered && !isMinimized && (
            <button
              onClick={async (e) => {
                e.stopPropagation()
                await handleLogout()
              }}
              title="Log out"
              className="ml-auto flex shrink-0 items-center justify-center rounded-full text-slate-500 hover:bg-slate-200 hover:text-slate-900"
            >
              <FontAwesomeIcon icon={faRightFromBracket} size="sm" />
            </button>
          )} */}
        </NavLink>

        <hr className="my-3 border-slate-200" />

        <nav onMouseEnter={() => setIsHovered(true)} className="space-y-1">
          {sidebarItems.map((item) => (
            <NavLink
              key={item.page}
              to={item.page}
              title={item.label}
              className={({ isActive }) =>
                `flex h-10 items-center gap-4 rounded-xl px-2 py-2 text-sm transition-colors duration-200 ${
                  isActive
                    ? 'bg-sea-teal-dark font-medium text-white'
                    : 'hover:bg-sea-lavender text-slate-600'
                }`
              }
            >
              <FontAwesomeIcon
                size="lg"
                icon={item.icon}
                className="w-4 shrink-0"
              />
              <span
                className={`overflow-hidden whitespace-nowrap transition-opacity duration-100 ${
                  isMinimized ? 'opacity-0' : 'opacity-100'
                }`}
              >
                {item.label}
              </span>
            </NavLink>
          ))}
        </nav>

        <button
          onClick={toggleTheme}
          title="Toggle light/dark theme"
          className="mt-auto flex h-10 w-full cursor-pointer items-center gap-4 rounded-xl px-2 py-2 text-sm text-slate-600 transition-colors duration-100 hover:bg-slate-100"
        >
          <FontAwesomeIcon
            size="lg"
            icon={isDarkMode ? faMoon : faSun}
            className="w-4 shrink-0"
          />
          <span
            className={`flex-1 overflow-hidden text-left whitespace-nowrap transition-opacity duration-100 ${
              isMinimized ? 'opacity-0' : 'opacity-100'
            }`}
          >
            Theme
          </span>
          <span
            className={`relative h-5 w-9 shrink-0 rounded-full transition-all duration-200 ${
              isDarkMode ? 'bg-sea-teal' : 'bg-slate-300'
            } ${isMinimized ? 'opacity-0' : 'opacity-100'}`}
          >
            <span
              className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform duration-200 ${
                isDarkMode ? 'translate-x-4' : 'translate-x-0'
              }`}
            />
          </span>
        </button>
      </aside>
    </div>
  )
}

export default Sidebar
