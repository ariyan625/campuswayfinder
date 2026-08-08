import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Briefcase, GraduationCap, Users } from 'lucide-react'
import { useApp } from '../context/AppContext'
import type { Role } from '../types'

const ROLES: { role: Role; title: string; icon: typeof GraduationCap; desc: string }[] = [
  {
    role: 'student',
    title: 'Student',
    icon: GraduationCap,
    desc: 'Classroom, laboratory, library, hostel, timetable & campus navigation.',
  },
  {
    role: 'faculty',
    title: 'Faculty',
    icon: Briefcase,
    desc: 'Classroom directions, cabin-to-class routes, timetables & campus services.',
  },
  {
    role: 'visitor',
    title: 'Parent / Visitor',
    icon: Users,
    desc: 'Directions to admission, hostels, offices, reception, auditorium & more.',
  },
]

export function RoleSelect() {
  const navigate = useNavigate()
  const { setRole } = useApp()

  const choose = (r: Role) => {
    setRole(r)
    navigate('/dashboard')
  }

  return (
    <div className="page page--role">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className="page__header">
          <h1>How are you using the campus?</h1>
          <p>Choose a role to personalize your experience</p>
        </div>

        <div className="role-grid">
          {ROLES.map(({ role, title, icon: Icon, desc }, i) => (
            <motion.button
              key={role}
              className="role-card"
              onClick={() => choose(role)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 * i, duration: 0.4 }}
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className={`role-card__icon role-card__icon--${role}`}>
                <Icon size={26} />
              </span>
              <span className="role-card__title">{title}</span>
              <span className="role-card__desc">{desc}</span>
              <span className="role-card__arrow">
                <ArrowRight size={18} />
              </span>
            </motion.button>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
