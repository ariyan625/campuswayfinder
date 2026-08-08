import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Bell, Compass, MapPin, Package, Search, Siren, Ticket } from 'lucide-react'
import { Card } from '../components/ui'

const SERVICES = [
  { to: '/announcements', label: 'Announcements', desc: 'Campus notices & updates', icon: Bell, tone: 'amber' },
  { to: '/lost-found', label: 'Lost & Found', desc: 'Report and find items', icon: Package, tone: 'rose' },
  { to: '/events', label: 'Events', desc: 'Hackathons & activities', icon: MapPin, tone: 'green' },
  { to: '/emergency', label: 'Emergency', desc: 'Help & contacts', icon: Siren, tone: 'red' },
  { to: '/timetable', label: 'Timetable', desc: 'Manage your classes', icon: Ticket, tone: 'sky' },
  { to: '/search', label: 'Campus Search', desc: 'Find anything on campus', icon: Search, tone: 'indigo' },
]

export function Services() {
  return (
    <div className="page">
      <div className="page__header">
        <h1>Services</h1>
        <p>Everything you need, in one place</p>
      </div>

      <div className="services-grid">
        {SERVICES.map(({ to, label, desc, icon: Icon, tone }, i) => (
          <motion.div key={to} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Link to={to} className="service-card">
              <span className={`service-card__icon service-card__icon--${tone}`}>
                <Icon size={22} />
              </span>
              <h3>{label}</h3>
              <p>{desc}</p>
              <Compass size={15} className="service-card__arrow" />
            </Link>
          </motion.div>
        ))}
      </div>

      <Card className="services-tip">
        <Siren size={18} />
        <p>
          In an emergency, tap <strong>SOS</strong> in the top bar — it's always one tap away.
        </p>
      </Card>
    </div>
  )
}
