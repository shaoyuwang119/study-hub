import { NavLink } from 'react-router-dom'

type SidebarItem = {
  label: string
  page: string
}

const sidebarItems: SidebarItem[] = [
  { label: 'Home', page: '/' },
  { label: 'Explore', page: '/explore' },
  { label: 'Profile', page: '/profile' },
]

function Sidebar() {
  return (
    <aside className="sticky top-0 h-screen w-64 border-r border-gray-200 bg-white px-4 py-5">
      <div className="mb-8 flex flex-col gap-y-2">
        <h1 className="text-3xl font-bold text-zinc-800">Study Hub</h1>
        <p className="text-sm text-zinc-500">Find better notes.</p>
      </div>

      <nav className="spacy-y-1">
        {/* TODO: add icons */}
        {sidebarItems.map((item) => (
          <NavLink
            to={item.page}
            className={({ isActive }) =>
              `block rounded-md px-3 py-2 text-sm ${
                isActive
                  ? 'bg-blue-100 font-medium text-zinc-900'
                  : 'text-zinc-600 hover:bg-zinc-100'
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}

export default Sidebar
