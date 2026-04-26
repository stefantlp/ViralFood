import { NavLink, useNavigate } from 'react-router-dom'

const navItems = [
  { label: 'Profile', to: '/admin/profile' },
  { label: 'Reservations', to: '/admin/reservations' },
  { label: 'Orders', to: '/admin/orders' },
  { label: 'Menu', to: '/admin/menu' },
]

function Sidebar() {
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.removeItem('authUser')
    navigate('/login', { replace: true })
    window.location.reload()
  }

  return (
    <aside className="flex w-64 flex-col border-r border-white p-4">
      <div className="mb-8 rounded-2xl border border-white p-4 text-xl font-semibold">
        ViralFood Admin
      </div>

      <nav className="flex flex-col gap-0 border border-white">
        {navItems.map((item, index) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `px-4 py-4 transition ${
                isActive
                  ? 'bg-white text-black'
                  : 'text-white hover:bg-white hover:text-black'
              } ${index !== navItems.length - 1 ? 'border-b border-white' : ''}`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      <button
        onClick={handleLogout}
        className="mt-auto border border-white px-4 py-4 text-left hover:bg-white hover:text-black"
      >
        Logout
      </button>
    </aside>
  )
}

export default Sidebar