import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import UniverseToggle from './UniverseToggle'

export default function Nav() {
  const { token, logout } = useAuth()
  const navigate = useNavigate()

  const link = ({ isActive }: { isActive: boolean }) =>
    `text-[11px] tracking-[0.2em] uppercase transition-colors ${isActive ? 'text-charcoal' : 'text-muted hover:text-charcoal'}`

  const links = (
    <>
      <NavLink to="/studio" className={link}>Studio</NavLink>
      <NavLink to="/avatar" className={link}>My avatar</NavLink>
      <NavLink to="/wardrobe" className={link}>Wardrobe</NavLink>
    </>
  )

  return (
    <header className="relative z-30 flex flex-wrap items-center justify-between gap-x-4 gap-y-3 px-5 py-5 md:px-10">
      <nav className="hidden items-center gap-7 md:flex">{links}</nav>

      <Link to="/" className="font-serif text-2xl italic tracking-[0.04em] text-charcoal md:absolute md:left-1/2 md:-translate-x-1/2">
        Myrror
      </Link>

      <div className="flex items-center gap-4">
        <UniverseToggle />
        {token ? (
          <button
            onClick={() => {
              logout()
              navigate('/')
            }}
            className="text-[11px] tracking-[0.2em] uppercase text-muted hover:text-charcoal"
          >
            Log out
          </button>
        ) : (
          <Link to="/login" className="text-[11px] tracking-[0.2em] uppercase text-muted hover:text-charcoal">
            Sign in
          </Link>
        )}
      </div>

      {/* on phones the links get their own row */}
      <nav className="flex w-full justify-center gap-6 md:hidden">{links}</nav>
    </header>
  )
}
