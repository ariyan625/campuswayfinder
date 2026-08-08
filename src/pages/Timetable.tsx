import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CalendarDays, Clock, MapPin, Navigation, Pencil, Plus, Trash2 } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { getNode, CAMPUS_NODES } from '../data/campus'
import { DAYS, findNextClass, formatCountdown, formatTime12, timeToMinutes } from '../lib/format'
import { Button, Card, EmptyState, Field, Input, Modal, Select, SectionTitle } from '../components/ui'
import type { TimetableEntry } from '../types'

const EMPTY_FORM = { day: 'Monday', time: '09:00', subject: '', buildingId: 'block-a', room: '' }

export function Timetable() {
  const { timetable, addTimetableEntry, updateTimetableEntry, deleteTimetableEntry } = useApp()
  const navigate = useNavigate()
  const [day, setDay] = useState(DAYS[new Date().getDay() === 0 ? 0 : new Date().getDay() - 1])
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<TimetableEntry | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)

  const next = findNextClass(timetable)

  const dayEntries = useMemo(
    () =>
      timetable
        .filter((e) => e.day === day)
        .sort((a, b) => timeToMinutes(a.time) - timeToMinutes(b.time)),
    [timetable, day],
  )

  const openAdd = () => {
    setEditing(null)
    setForm({ ...EMPTY_FORM, day })
    setModalOpen(true)
  }

  const openEdit = (e: TimetableEntry) => {
    setEditing(e)
    setForm({ day: e.day, time: e.time, subject: e.subject, buildingId: e.buildingId, room: e.room })
    setModalOpen(true)
  }

  const save = () => {
    if (!form.subject.trim() || !form.room.trim()) return
    if (editing) updateTimetableEntry({ ...editing, ...form, subject: form.subject.trim(), room: form.room.trim() })
    else addTimetableEntry({ ...form, subject: form.subject.trim(), room: form.room.trim() })
    setModalOpen(false)
  }

  return (
    <div className="page">
      <div className="page__header">
        <h1>My Timetable</h1>
        <p>Add your classes and we'll find the next one automatically</p>
      </div>

      {next && (
        <Card className="next-class-card next-class-card--compact">
          <div className="next-class-card__top">
            <span className="next-class-card__label">Next up</span>
            <span className="next-class-card__day">{next.dayLabel}</span>
          </div>
          <div className="next-class-card__main">
            <div>
              <h3>{next.entry.subject}</h3>
              <p className="next-class-card__meta">
                <Clock size={13} /> {formatTime12(next.entry.time)} · {formatCountdown(next.minutesUntil)}
              </p>
              <p className="next-class-card__room">
                <MapPin size={13} /> {getNode(next.entry.buildingId)?.name} — Room {next.entry.room}
              </p>
            </div>
          </div>
          <Button
            className="next-class-card__cta"
            onClick={() => navigate(`/navigate?to=${next.entry.buildingId}&room=${encodeURIComponent(next.entry.room)}&class=${encodeURIComponent(next.entry.subject)}`)}
            icon={<Navigation size={16} />}
          >
            Navigate to Class
          </Button>
        </Card>
      )}

      <div className="day-tabs">
        {DAYS.map((d) => (
          <button key={d} className={`day-tab ${day === d ? 'day-tab--active' : ''}`} onClick={() => setDay(d)}>
            {d.slice(0, 3)}
          </button>
        ))}
      </div>

      <SectionTitle action={<Button onClick={openAdd} icon={<Plus size={15} />}>Add Class</Button>}>
        {day}
      </SectionTitle>

      {dayEntries.length === 0 ? (
        <EmptyState icon={<CalendarDays size={28} />} title={`No classes on ${day}`} subtitle="Add a class to get automatic navigation to your next lecture." />
      ) : (
        <div className="tt-list">
          {dayEntries.map((e) => (
            <motion.div key={e.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="tt-entry">
                <div className="tt-entry__time">
                  <strong>{formatTime12(e.time)}</strong>
                </div>
                <div className="tt-entry__body">
                  <h3>{e.subject}</h3>
                  <p>
                    {getNode(e.buildingId)?.name} — Room {e.room}
                  </p>
                </div>
                <div className="tt-entry__actions">
                  <Button variant="ghost" onClick={() => navigate(`/navigate?to=${e.buildingId}&room=${encodeURIComponent(e.room)}&class=${encodeURIComponent(e.subject)}`)} icon={<Navigation size={15} />} aria-label="Navigate" />
                  <Button variant="ghost" onClick={() => openEdit(e)} icon={<Pencil size={15} />} aria-label="Edit" />
                  <Button variant="ghost" onClick={() => deleteTimetableEntry(e.id)} icon={<Trash2 size={15} />} aria-label="Delete" />
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Class' : 'Add Class'}>
        <div className="form-grid">
          <Field label="Day">
            <Select value={form.day} onChange={(e) => setForm({ ...form, day: e.target.value })}>
              {DAYS.map((d) => (
                <option key={d}>{d}</option>
              ))}
            </Select>
          </Field>
          <Field label="Class time">
            <Input type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} />
          </Field>
          <Field label="Subject">
            <Input placeholder="e.g. DBMS" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
          </Field>
          <Field label="Building / Block">
            <Select value={form.buildingId} onChange={(e) => setForm({ ...form, buildingId: e.target.value })}>
              {CAMPUS_NODES.filter((n) => ['academic', 'lab', 'auditorium'].includes(n.category)).map((n) => (
                <option key={n.id} value={n.id}>
                  {n.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Classroom">
            <Input placeholder="e.g. 204" value={form.room} onChange={(e) => setForm({ ...form, room: e.target.value })} />
          </Field>
        </div>
        <div className="modal-actions">
          <Button variant="outline" onClick={() => setModalOpen(false)}>
            Cancel
          </Button>
          <Button onClick={save} disabled={!form.subject.trim() || !form.room.trim()}>
            {editing ? 'Save Changes' : 'Add Class'}
          </Button>
        </div>
      </Modal>
    </div>
  )
}
