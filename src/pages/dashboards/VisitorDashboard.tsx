import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, MapPin } from 'lucide-react'
import { VISITOR_DESTINATIONS, CATEGORY_META } from '../../data/campus'
import { useApp } from '../../context/AppContext'
import type { NodeCategory } from '../../types'

export function VisitorDashboard() {
  const navigate = useNavigate()
  const { profile } = useApp()

  return (
    <div className="page">
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className="visitor-hero">
          <h1>Hello{profile.name !== 'Guest' ? `, ${profile.name}` : ''}!</h1>
          <p>Where do you want to go?</p>
        </div>

        <div className="visitor-grid">
          {VISITOR_DESTINATIONS.map((d, i) => (
            <motion.button
              key={`${d.label}-${i}`}
              className="visitor-dest"
              onClick={() => navigate(`/navigate?to=${d.id}&label=${encodeURIComponent(d.label)}`)}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.04 * i, duration: 0.35 }}
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.97 }}
            >
              <span className="visitor-dest__icon" style={{ background: CATEGORY_META[d.icon as NodeCategory].color }}>
                <MapPin size={20} />
              </span>
              <span className="visitor-dest__label">{d.label}</span>
              <ArrowRight size={18} className="visitor-dest__arrow" />
            </motion.button>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
