import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Cross, MapPin, Navigation, PhoneCall, Siren, Stethoscope, UserRound } from 'lucide-react'
import { EMERGENCY_CONTACTS, EMERGENCY_NODES, getNode, CATEGORY_META } from '../data/campus'
import { useApp } from '../context/AppContext'
import { findShortestRoute, formatDistance, formatMinutes } from '../lib/navigation'
import { Card } from '../components/ui'

const NODE_ICONS: Record<string, typeof Stethoscope> = {
  medical: Stethoscope,
  'main-gate': Cross,
  reception: UserRound,
}

export function Emergency() {
  const navigate = useNavigate()
  const { locationId } = useApp()

  return (
    <div className="page">
      <div className="emergency-hero">
        <Siren size={30} />
        <h1>Emergency Assistance</h1>
        <p>Find the nearest help and get there fast</p>
      </div>

      <div className="emergency-grid">
        {EMERGENCY_NODES.map((n, i) => {
          const node = getNode(n.id)!
          const route = findShortestRoute(locationId, n.id)
          const Icon = NODE_ICONS[n.icon] ?? MapPin
          return (
            <motion.div key={n.id} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
              <Card className="emergency-card">
                <span className="emergency-card__icon" style={{ background: CATEGORY_META[node.category].color }}>
                  <Icon size={22} />
                </span>
                <div className="emergency-card__body">
                  <h3>{n.label}</h3>
                  {route && route.distance > 0 && (
                    <p className="emergency-card__dist">
                      {formatDistance(route.distance)} away · ~{formatMinutes(route.minutes)} on foot
                    </p>
                  )}
                  {route && route.distance === 0 && <p className="emergency-card__dist">You are already here.</p>}
                </div>
                <button className="emergency-card__go" onClick={() => navigate(`/navigate?to=${n.id}`)} aria-label={`Navigate to ${n.label}`}>
                  <Navigation size={18} />
                </button>
              </Card>
            </motion.div>
          )
        })}
      </div>

      {(() => {
        const exitRoute = findShortestRoute(locationId, 'main-gate')
        if (!exitRoute) return null
        return (
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="emergency-card emergency-card--exit">
              <span className="emergency-card__icon emergency-card__icon--exit">
                <Cross size={22} />
              </span>
              <div className="emergency-card__body">
                <h3>Emergency Exit (Main Gate)</h3>
                {exitRoute.distance > 0 ? (
                  <p className="emergency-card__dist">
                    {formatDistance(exitRoute.distance)} away · ~{formatMinutes(exitRoute.minutes)} on foot
                  </p>
                ) : (
                  <p className="emergency-card__dist">You are already at the exit.</p>
                )}
              </div>
              <button className="emergency-card__go" onClick={() => navigate('/navigate?to=main-gate')} aria-label="Navigate to Emergency Exit">
                <Navigation size={18} />
              </button>
            </Card>
          </motion.div>
        )
      })()}

      <div className="emergency-note">
        <Cross size={16} />
        <span>The Main Gate is always the shortest route to exit the campus.</span>
      </div>

      <h2 className="dash-section-title">Emergency Contacts</h2>
      <Card className="contacts-card">
        {EMERGENCY_CONTACTS.map((c, i) => (
          <a key={c.label} href={`tel:${c.phone.replace(/\s/g, '')}`} className={`contact-row ${i > 0 ? 'contact-row--bordered' : ''}`}>
            <span className="contact-row__label">{c.label}</span>
            <span className="contact-row__phone">{c.phone}</span>
            <PhoneCall size={16} />
          </a>
        ))}
      </Card>
    </div>
  )
}
