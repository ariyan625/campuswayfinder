import { NavLink, Outlet, useLocation, Link, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import {
  Bell,
  Compass,
  Home,
  Map,
  MapPin,
  Package,
  PersonStanding,
  Route,
  Search,
  Siren,
  Ticket,
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import { getNode } from '../data/campus'

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Home', icon: Home },
  { to: '/explore', label: 'Explore', icon: Map },
  { to: '/navigate', label: 'Navigate', icon: Route },
  { to: '/timetable', label: 'Timetable', icon: Ticket },
  { to: '/services', label: 'Services', icon: Compass },
  { to: '/profile', label: 'Profile', icon: PersonStanding },
]

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

export function Layout() {
  const { locationId, role } = useApp()
  const navigate = useNavigate()
  const current = getNode(locationId)

  return (
    <div className="app-shell">
      <ScrollToTop />
      <header className="app-header">
        <Link to="/dashboard" className="brand">
          <span className="brand__logo">
            <MapPin size={18} />
          </span>
          <span className="brand__name">Interactive Campus Hub</span>
        </Link>
        <div className="app-header__right">
          <button className="sos-btn" aria-label="Emergency" onClick={() => navigate('/emergency')}>
            <Siren size={17} />
            <span>SOS</span>
          </button>
        </div>
      </header>

      {role && current && (
        <div className="location-bar">
          <MapPin size={14} className="location-bar__icon" />
          <span className="location-bar__label">You are here</span>
          <strong>{current.name}</strong>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="sidebar">
        <Link to="/dashboard" className="brand brand--sidebar">
          <span className="brand__logo">
            <MapPin size={18} />
          </span>
          <span className="brand__name">Interactive Campus Hub</span>
        </Link>
        <nav className="sidebar__nav">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} className={({ isActive }) => `side-link ${isActive ? 'side-link--active' : ''}`}>
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="sidebar__quick">
          <span className="sidebar__quick-label">Quick access</span>
          <Link to="/announcements" className="side-link side-link--sm">
            <Bell size={16} /> Announcements
          </Link>
          <Link to="/lost-found" className="side-link side-link--sm">
            <Package size={16} /> Lost & Found
          </Link>
          <Link to="/events" className="side-link side-link--sm">
            <Ticket size={16} /> Events
          </Link>
          <Link to="/emergency" className="side-link side-link--sm side-link--sos">
            <Siren size={16} /> Emergency
          </Link>
          <Link to="/search" className="side-link side-link--sm">
            <Search size={16} /> Campus Search
          </Link>
        </div>
      </aside>

      <main className="app-main">
        <Outlet />
      </main>

      {/* Mobile bottom nav */}
      <nav className="bottom-nav">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} className={({ isActive }) => `bottom-nav__item ${isActive ? 'bottom-nav__item--active' : ''}`}>
            <Icon size={21} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
