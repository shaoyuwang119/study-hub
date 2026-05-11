type SidebarItem = {
  label: string
  href?: string
  active?: boolean
}

const sidebarItems: SidebarItem[] = [
  { label: 'Home', active: true },
  { label: 'Explore' },
  { label: 'Profile' },
]

function Sidebar() {
  return (
    <aside className="h-screen w-64 border-r border-gray-200 bg-white px-4 py-5">
      <div className="mb-8 flex flex-col gap-y-2">
        <h1 className="text-3xl font-bold text-zinc-800">Study Hub</h1>
        <p className="text-sm text-zinc-500">Find better notes.</p>
      </div>

      <nav className="spacy-y-1">
        {/* TODO: add icons */}
        {sidebarItems.map((item) => (
          <button
            key={item.label}
            className={`w-full rounded-md px-3 py-2 text-left text-sm transition-colors duration-200 cursor-pointer ${
              item.active
                ? 'bg-blue-100 font-medium text-zinc-900'
                : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
            }`}
          >
            {item.label}
          </button>
        ))}
      </nav>
    </aside>
  )
}

export default Sidebar
