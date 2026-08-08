import { Bell, Clock, Compass, Map, MapPin, Search, Siren, Ticket } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { FeatureGrid } from '../Dashboard'
import { DashboardHeader } from './DashboardHeader'
import { useApp } from '../../context/AppContext'
import { Card, Badge } from '../../components/ui'
import { getNode } from '../../data/campus'
import { formatTime12, timeToMinutes } from '../../lib/format'

export function FacultyDashboard() {
  const { profile, timetable } = useApp()
  const navigate = useNavigate()
  const cabinNode = getNode('cabins')
  const today = new Date()
  const todayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][today.getDay()]
  const todaysClasses = timetable
    .filter((e) => e.day === todayName)
    .sort((a, b) => timeToMinutes(a.time) - timeToMinutes(b.time))

  return (
    <div className="page">
      <DashboardHeader greeting={`Welcome, ${profile.name.split(' ')[0]}`} nextClassCta="Navigate to Classroom" />

      <Card className="faculty-card">
        <div className="faculty-card__head">
          <div>
            <h3>{profile.name || 'Faculty'}</h3>
            <p className="faculty-card__id">{profile.facultyId}</p>
          </div>
          <Badge tone="violet">Faculty</Badge>
        </div>
        <div className="faculty-card__info">
          <div>
            <span className="faculty-card__label">Department</span>
            <strong>{profile.department || '—'}</strong>
          </div>
          <div>
            <span className="faculty-card__label">Cabin</span>
            <strong>{profile.cabin || cabinNode?.name || '—'}</strong>
          </div>
        </div>
      </Card>

      <h2 className="dash-section-title">Today's Classes</h2>
      {todaysClasses.length === 0 ? (
        <Card>
          <p className="faculty-card__label">No classes scheduled for {todayName}. Enjoy the day!</p>
        </Card>
      ) : (
        <div className="tt-list">
          {todaysClasses.map((e) => (
            <Card key={e.id} className="tt-entry">
              <div className="tt-entry__time">
                <strong>{formatTime12(e.time)}</strong>
              </div>
              <div className="tt-entry__body">
                <h3>{e.subject}</h3>
                <p>
                  {getNode(e.buildingId)?.name} — Room {e.room}
                </p>
              </div>
              <button
                className="tt-entry__nav"
                onClick={() =>
                  navigate(`/navigate?to=${e.buildingId}&room=${encodeURIComponent(e.room)}&class=${encodeURIComponent(e.subject)}`)
                }
                aria-label={`Navigate to ${e.subject}`}
              >
                <Clock size={15} />
              </button>
            </Card>
          ))}
        </div>
      )}

      <h2 className="dash-section-title">Quick Actions</h2>
      <FeatureGrid
        items={[
          { to: '/explore', label: 'Explore Campus', icon: <Map size={20} />, tone: 'indigo' },
          { to: '/navigate', label: 'Navigate', icon: <Compass size={20} />, tone: 'violet' },
          { to: '/timetable', label: 'My Timetable', icon: <Ticket size={20} />, tone: 'sky' },
          { to: '/announcements', label: 'Announcements', icon: <Bell size={20} />, tone: 'amber' },
          { to: '/events', label: 'Events', icon: <MapPin size={20} />, tone: 'green' },
          { to: '/emergency', label: 'Emergency', icon: <Siren size={20} />, tone: 'red' },
          { to: '/search', label: 'Campus Search', icon: <Search size={20} />, tone: 'slate' },
        ]}
      />
    </div>
  )
}
