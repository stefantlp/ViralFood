import { useState, useEffect } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'

function Navbar() {
    const [scrolled, setScrolled] = useState(false)
    const [menuOpen, setMenuOpen] = useState(false)
    const navigate = useNavigate()

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20)
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    const linkClass = ({ isActive }: { isActive: boolean }) =>
        `text-sm transition-colors ${isActive ? 'text-[#38bdf8]' : 'text-white/60 hover:text-white'}`

    return (
        <nav
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
                scrolled ? 'bg-black/90 backdrop-blur-md border-b border-white/10' : 'bg-transparent'
            }`}
        >
            <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
                <button
                    onClick={() => navigate('/')}
                    className="text-2xl font-black tracking-wide"
                    style={{ fontFamily: "'Bebas Neue', sans-serif" }}
                >
                    <span className="text-white">Viral</span><span className="text-white">Food</span>
                </button>

                <div className="hidden items-center gap-8 md:flex">
                    <NavLink to="/" end className={linkClass}>Home</NavLink>
                    <NavLink to="/order" className={linkClass}>Menu</NavLink>
                    <NavLink to="/reservations" className={linkClass}>Reservations</NavLink>
                    <NavLink to="/contact" className={linkClass}>Contact</NavLink>
                </div>

                <button
                    onClick={() => navigate('/login')}
                    className="hidden rounded-full border border-white/30 bg-transparent px-5 py-2 text-sm font-semibold text-white transition-all hover:bg-white hover:text-black md:block"
                >
                    Switch to Admin
                </button>

                <button
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="flex flex-col gap-1.5 md:hidden"
                >
                    <span className={`block h-0.5 w-6 bg-white transition-all duration-300 ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
                    <span className={`block h-0.5 w-6 bg-white transition-all duration-300 ${menuOpen ? 'opacity-0' : ''}`} />
                    <span className={`block h-0.5 w-6 bg-white transition-all duration-300 ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
                </button>
            </div>

            {menuOpen && (
                <div className="border-t border-white/10 bg-black/95 px-6 py-4 md:hidden">
                    <div className="flex flex-col gap-4">
                        <NavLink to="/" end className={linkClass} onClick={() => setMenuOpen(false)}>Home</NavLink>
                        <NavLink to="/reservations" className={linkClass} onClick={() => setMenuOpen(false)}>Reservations</NavLink>
                        <NavLink to="/order" className={linkClass} onClick={() => setMenuOpen(false)}>Order</NavLink>
                        <NavLink to="/contact" className={linkClass} onClick={() => setMenuOpen(false)}>Contact</NavLink>
                        <button
                            onClick={() => { navigate('/order'); setMenuOpen(false) }}
                            className="w-full rounded-full bg-orange-500 py-2 text-sm font-semibold text-white"
                        >
                            Order Now
                        </button>
                    </div>
                </div>
            )}
        </nav>
    )
}

export default Navbar
