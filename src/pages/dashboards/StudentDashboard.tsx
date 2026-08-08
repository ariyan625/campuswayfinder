import { Bell, Compass, Map, MapPin, Package, Search, Siren, Ticket } from 'lucide-react'
import { FeatureGrid } from '../Dashboard'
import { DashboardHeader } from './DashboardHeader'
import { useApp } from '../../context/AppContext'

export function StudentDashboard() {
  const { profile } = useApp()
  return (
    <div className="page">
      <DashboardHeader greeting={`Welcome, ${profile.name.split(' ')[0]}`} />

      <h2 className="dash-section-title">Quick Actions</h2>
      <FeatureGrid
        items={[
          { to: '/explore', label: 'Explore Campus', icon: <Map size={20} />, tone: 'indigo' },
          { to: '/navigate', label: 'Navigate', icon: <Compass size={20} />, tone: 'violet' },
          { to: '/timetable', label: 'My Timetable', icon: <Ticket size={20} />, tone: 'sky' },
          { to: '/announcements', label: 'Announcements', icon: <Bell size={20} />, tone: 'amber' },
          { to: '/lost-found', label: 'Lost & Found', icon: <Package size={20} />, tone: 'rose' },
          { to: '/events', label: 'Events', icon: <MapPin size={20} />, tone: 'green' },
          { to: '/emergency', label: 'Emergency', icon: <Siren size={20} />, tone: 'red' },
          { to: '/search', label: 'Campus Search', icon: <Search size={20} />, tone: 'slate' },
        ]}
      />
    </div>
  )
}
