import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import { use, useEffect, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faBookBookmark,
  faHouse,
  faCompass,
  faRightFromBracket,
  faBookOpen,
} from '@fortawesome/free-solid-svg-icons'

import { supabase } from '@/lib/supabase'
import { faSquarePlus } from '@fortawesome/free-regular-svg-icons'

type SidebarItem = {
  label: string
  page: string
  icon: typeof faHouse
}

const sidebarItems: SidebarItem[] = [
  { label: 'Home', page: '/', icon: faHouse },
  { label: 'Explore', page: '/explore', icon: faCompass },
  // { label: 'Library', page: '/library', icon: faBookOpen },
]

function Sidebar() {
  const navigate = useNavigate()
  const location = useLocation()
  const [isHovered, setIsHovered] = useState(false)
  const [profile, setProfile] = useState({ name: '', email: '' })
  const [isProfileHovered, setIsProfileHovered] = useState(false)

  const canMinimize = location.pathname.startsWith('/notes/')
  const isMinimized = canMinimize && !isHovered

  useEffect(() => {
    const fetchProfile = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      const { data } = await supabase
        .from('profiles')
        .select('display_name')
        .eq('id', user.id)
        .single()

      setProfile({
        name: data?.display_name || '',
        email: user.email || '',
      })
    }

    fetchProfile()
  }, [])

  useEffect(() => {
    console.log(profile.name)
    console.log(profile)
  }, [profile])

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
              className={`overflow-hidden whitespace-nowrap transition-opacity duration-200 ${
                isMinimized ? 'opacity-0' : 'opacity-100'
              }`}
            >
              StudyNote
            </span>
          </h1>
        </NavLink>

        <div
          onClick={() => navigate('/profile')}
          onMouseEnter={() => {
            setIsHovered(true)
            setIsProfileHovered(true)
          }}
          onMouseLeave={() => setIsProfileHovered(false)}
          className="mb-4 flex h-12 cursor-pointer items-center gap-3 rounded-lg px-1 hover:bg-zinc-100"
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-600">
            {profile.name ? profile.name.charAt(0).toUpperCase() : '?'}
          </div>

          <div>
            <div
              className={`overflow-hidden text-sm font-medium whitespace-nowrap text-zinc-900 transition-opacity duration-200 ${
                isMinimized ? 'opacity-0' : 'opacity-100'
              }`}
            >
              {profile.name || 'Loading...'}
            </div>
          </div>

          {isProfileHovered && !isMinimized && (
            <button
              onClick={async (e) => {
                e.stopPropagation()
                await handleLogout()
              }}
              title="Log out"
              className="ml-auto flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-zinc-500 hover:bg-zinc-200 hover:text-zinc-900"
            >
              <FontAwesomeIcon icon={faRightFromBracket} size="sm" />
            </button>
          )}
        </div>

        <button
          // onClick={() => setShowUpload(true)}
          className="mb-3 flex h-10 w-full cursor-pointer items-center gap-3 rounded-lg bg-blue-400 px-2 py-2 text-sm text-white duration-200 hover:bg-blue-600"
        >
          <FontAwesomeIcon icon={faSquarePlus} size="lg" className="shrink-0" />
          <span
            className={`overflow-hidden whitespace-nowrap transition-opacity duration-200 ${
              isMinimized ? 'opacity-0' : 'opacity-100'
            }`}
          >
            Upload Notes
          </span>
        </button>

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
              <span
                className={`overflow-hidden whitespace-nowrap transition-opacity duration-200 ${
                  isMinimized ? 'opacity-0' : 'opacity-100'
                }`}
              >
                {item.label}
              </span>
            </NavLink>
          ))}
        </nav>
      </aside>
    </div>
  )
}

export default Sidebar
