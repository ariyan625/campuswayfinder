import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Compass, MapPin, QrCode, Route, Ticket } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { Button } from '../components/ui'

export function Welcome() {
  const navigate = useNavigate()
  const { role } = useApp()

  return (
    <div className="welcome">
      <div className="welcome__bg" />
      <motion.div
        className="welcome__content"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: 'easeOut' }}
      >
        <div className="welcome__logo">
          <MapPin size={44} strokeWidth={1.6} />
        </div>
        <h1 className="welcome__title">CampusWayfinder</h1>
        <p className="welcome__subtitle">Explore the Campus. Find Your Way.</p>
        <p className="welcome__desc">
          Your interactive guide to explore, navigate, and access essential campus information.
        </p>

        <div className="welcome__qr">
          <div className="welcome__qr-box">
            <QrCode size={40} strokeWidth={1.4} />
          </div>
          <span>Scan the QR code at the campus entrance</span>
        </div>

        <Button className="welcome__cta" onClick={() => navigate('/role')} icon={<ArrowRight size={18} />}>
          Scan QR / Enter Campus
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
    </div>
  )
}
