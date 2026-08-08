import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CalendarDays, MapPin, Navigation } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { getNode } from '../../data/campus'
import { findNextClass, formatCountdown, formatDateLabel, formatTime12, todayISO } from '../../lib/format'
import { Button, Card } from '../../components/ui'
import { LocationPicker } from '../../components/LocationPicker'
import { useState } from 'react'

interface DashboardHeaderProps {
  greeting: string
  nextClassCta?: string
  nextClassTo?: string
}

export function DashboardHeader({ greeting, nextClassCta = 'Navigate to Class', nextClassTo }: DashboardHeaderProps) {
  const { locationId, setLocationId, timetable } = useApp()
  const navigate = useNavigate()
  const [pickerOpen, setPickerOpen] = useState(false)
  const current = getNode(locationId)
  const next = findNextClass(timetable)

  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <div className="dash-hero">
        <div>
          <h1 className="dash-hero__greet">{greeting}</h1>
          <p className="dash-hero__date">
            <CalendarDays size={15} /> {formatDateLabel(todayISO())}
          </p>
        </div>
        <button className="location-chip" onClick={() => setPickerOpen(true)}>
          <MapPin size={15} />
          <span>{current?.name ?? 'Select location'}</span>
        </button>
      </div>

      {next && (
        <Card className="next-class-card">
          <div className="next-class-card__top">
            <span className="next-class-card__label">Next Class</span>
            <span className="next-class-card__day">{next.dayLabel}</span>
          </div>
          <div className="next-class-card__main">
            <div>
              <h3>{next.entry.subject}</h3>
              <p className="next-class-card__meta">
                {formatTime12(next.entry.time)} · {formatCountdown(next.minutesUntil)}
              </p>
              <p className="next-class-card__room">
                {getNode(next.entry.buildingId)?.name} — Room {next.entry.room}
              </p>
            </div>
          </div>
          <Button
            className="next-class-card__cta"
            onClick={() =>
              navigate(
                nextClassTo ?? `/navigate?to=${next.entry.buildingId}&room=${encodeURIComponent(next.entry.room)}&class=${encodeURIComponent(next.entry.subject)}`,
              )
            }
            icon={<Navigation size={16} />}
          >
            {nextClassCta}
          </Button>
        </Card>
      )}

      <LocationPicker open={pickerOpen} onClose={() => setPickerOpen(false)} value={locationId} onChange={setLocationId} />
    </motion.div>
  )
}
