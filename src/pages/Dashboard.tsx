import { Link, Navigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { StudentDashboard } from './dashboards/StudentDashboard'
import { FacultyDashboard } from './dashboards/FacultyDashboard'
import { VisitorDashboard } from './dashboards/VisitorDashboard'

export function Dashboard() {
  const { role } = useApp()
  if (!role) return <Navigate to="/role" replace />
  if (role === 'faculty') return <FacultyDashboard />
  if (role === 'visitor') return <VisitorDashboard />
  return <StudentDashboard />
}

// Quick-feature grid shared by dashboards
export function FeatureGrid({ items }: { items: { to: string; label: string; icon: React.ReactNode; tone: string }[] }) {
  return (
    <div className="feature-grid">
      {items.map((f) => (
        <Link key={f.label} to={f.to} className={`feature-tile feature-tile--${f.tone}`}>
          <span className="feature-tile__icon">{f.icon}</span>
          <span className="feature-tile__label">{f.label}</span>
        </Link>
      ))}
    </div>
  )
}
