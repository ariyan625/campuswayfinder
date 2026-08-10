import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Compass, MapPin, QrCode, Route, ScanLine, Ticket } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { Button } from '../components/ui'
import { CampusScene, SceneDefs } from '../components/CampusScene'

export function Welcome() {
  const navigate = useNavigate()
  const { role } = useApp()

  return (
    <div className="welcome">
      <div className="welcome__bg" />
      <div className="welcome__grid">
        <motion.div
          className="welcome__content"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: 'easeOut' }}
        >
          <div className="welcome__logo">
            <MapPin size={44} strokeWidth={1.6} />
          </div>
          <h1 className="welcome__title">Interactive Campus Hub</h1>
          <p className="welcome__subtitle">Explore. Navigate. Connect.</p>
          <p className="welcome__desc">
            A personalized campus experience that helps students, faculty, parents, and visitors explore the
            campus and reach their destinations with ease.
          </p>

          <div className="welcome__qr">
            <div className="welcome__qr-box">
              <QrCode size={40} strokeWidth={1.4} />
            </div>
            <span>Scan QR to Enter Campus</span>
          </div>

          <Button className="welcome__cta" onClick={() => navigate('/role')} icon={<ArrowRight size={18} />}>
            Enter Campus
          </Button>

          <div className="welcome__features">
            {[
              { icon: MapPin, label: 'Explore' },
              { icon: Route, label: 'Navigate' },
              { icon: Ticket, label: 'Timetable' },
              { icon: Compass, label: 'Services' },
            ].map(({ icon: Icon, label }) => (
              <div className="welcome__feature" key={label}>
                <Icon size={18} />
                <span>{label}</span>
              </div>
            ))}
          </div>

          {role && (
            <button className="welcome__resume" onClick={() => navigate('/dashboard')}>
              Continue as {role} →
            </button>
          )}
        </motion.div>

        <motion.div
          className="welcome__aerial"
          initial={{ opacity: 0, x: 28 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.15, ease: 'easeOut' }}
        >
          <div className="welcome__aerial-frame">
            <svg
              viewBox="-6 -6 112 112"
              className="welcome__aerial-svg"
              role="img"
              aria-label="Aerial view of Greenfield College Campus with labelled buildings"
            >
              <defs>
                <SceneDefs />
              </defs>
              <CampusScene showLabels />
            </svg>
          </div>
          <div className="welcome__aerial-chip">
            <ScanLine size={14} />
            Greenfield College Campus · live interactive model
          </div>
        </motion.div>
      </div>
    </div>
  )
}
