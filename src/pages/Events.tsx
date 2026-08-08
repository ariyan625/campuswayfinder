import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { CalendarDays, Clock, MapPin, Navigation, Pencil, Ticket, User } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { getNode } from '../data/campus'
import { formatDateLabel, formatTime12 } from '../lib/format'
import { Badge, Button, Card, EmptyState, Field, Input, Modal, SectionTitle, Select, Textarea } from '../components/ui'
import type { CampusEvent, EventCategory } from '../types'
import { useNavigate } from 'react-router-dom'

const CATEGORIES: (EventCategory | 'All')[] = ['All', 'Hackathon', 'Workshop', 'Seminar', 'Cultural', 'Sports', 'Club']

const EMPTY: Omit<CampusEvent, 'id'> = {
  name: '',
  date: '',
  time: '10:00',
  locationId: 'auditorium',
  description: '',
  organizer: '',
  category: 'Workshop',
}

export function Events() {
  const { events, addEvent, updateEvent, deleteEvent } = useApp()
  const navigate = useNavigate()
  const [cat, setCat] = useState<(typeof CATEGORIES)[number]>('All')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<CampusEvent | null>(null)
  const [form, setForm] = useState(EMPTY)
  const [viewing, setViewing] = useState<CampusEvent | null>(null)

  const filtered = useMemo(() => {
    const sorted = [...events].sort((a, b) => a.date.localeCompare(b.date))
    return cat === 'All' ? sorted : sorted.filter((e) => e.category === cat)
  }, [events, cat])

  const openAdd = () => {
    setEditing(null)
    setForm({ ...EMPTY, date: new Date().toISOString().slice(0, 10) })
    setModalOpen(true)
  }
  const openEdit = (e: CampusEvent) => {
    setEditing(e)
    setForm({ name: e.name, date: e.date, time: e.time, locationId: e.locationId, description: e.description, organizer: e.organizer, category: e.category })
    setModalOpen(true)
  }
  const save = () => {
    if (!form.name.trim()) return
    if (editing) updateEvent({ ...editing, ...form, name: form.name.trim() })
    else addEvent({ ...form, name: form.name.trim() })
    setModalOpen(false)
  }

  return (
    <div className="page">
      <div className="page__header">
        <h1>Events</h1>
        <p>Hackathons, workshops, seminars and more</p>
      </div>

      <SectionTitle action={<Button onClick={openAdd} icon={<Ticket size={15} />}>Add Event</Button>}>
        <span className="section-title__with-icon"><Ticket size={17} /> Upcoming</span>
      </SectionTitle>

      <div className="cat-chips">
        {CATEGORIES.map((c) => (
          <button key={c} className={`chip ${cat === c ? 'chip--active' : ''}`} onClick={() => setCat(c)}>
            {c}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={<Ticket size={28} />} title="No events here" subtitle="Check other categories or create a new event." />
      ) : (
        <div className="events-grid">
          {filtered.map((e, i) => (
            <motion.div key={e.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
              <Card className="event-card" onClick={() => setViewing(e)}>
                <div className="event-card__date">
                  <strong>{new Date(e.date + 'T00:00:00').getDate()}</strong>
                  <span>{new Date(e.date + 'T00:00:00').toLocaleString(undefined, { month: 'short' })}</span>
                </div>
                <div className="event-card__body">
                  <Badge tone="violet">{e.category}</Badge>
                  <h3>{e.name}</h3>
                  <p className="event-card__meta">
                    <Clock size={13} /> {formatTime12(e.time)} · {getNode(e.locationId)?.name}
                  </p>
                  <p className="event-card__org"><User size={13} /> {e.organizer}</p>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Details modal */}
      <Modal open={!!viewing} onClose={() => setViewing(null)} title={viewing?.name ?? ''}>
        {viewing && (
          <>
            <div className="event-detail-meta">
              <Badge tone="violet">{viewing.category}</Badge>
              <p><CalendarDays size={14} /> {formatDateLabel(viewing.date)}</p>
              <p><Clock size={14} /> {formatTime12(viewing.time)}</p>
              <p><MapPin size={14} /> {getNode(viewing.locationId)?.name}</p>
              <p><User size={14} /> Organizer: {viewing.organizer}</p>
            </div>
            <p className="event-detail-desc">{viewing.description}</p>
            <div className="modal-actions">
              <Button variant="ghost" onClick={() => { setViewing(null); openEdit(viewing) }} icon={<Pencil size={15} />}>
                Edit
              </Button>
              <Button
                variant="ghost"
                onClick={() => { deleteEvent(viewing.id); setViewing(null) }}
              >
                Delete
              </Button>
              <Button onClick={() => navigate(`/navigate?to=${viewing.locationId}&event=${encodeURIComponent(viewing.name)}`)} icon={<Navigation size={16} />}>
                Navigate to Event
              </Button>
            </div>
          </>
        )}
      </Modal>

      {/* Create/edit modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Event' : 'Add Event'} wide>
        <div className="form-grid">
          <Field label="Event name">
            <Input placeholder="e.g. Hackathon" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </Field>
          <Field label="Category">
            <Select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as EventCategory })}>
              {CATEGORIES.filter((c) => c !== 'All').map((c) => (
                <option key={c}>{c}</option>
              ))}
            </Select>
          </Field>
          <Field label="Date">
            <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          </Field>
          <Field label="Time">
            <Input type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} />
          </Field>
          <Field label="Location">
            <Select value={form.locationId} onChange={(e) => setForm({ ...form, locationId: e.target.value })}>
              {getNode(form.locationId) && (
                <option value={form.locationId}>{getNode(form.locationId)?.name}</option>
              )}
              {['auditorium', 'block-c', 'comp-lab', 'library', 'canteen', 'parking'].filter((id) => id !== form.locationId).map((id) => (
                <option key={id} value={id}>{getNode(id)?.name}</option>
              ))}
            </Select>
          </Field>
          <Field label="Organizer">
            <Input placeholder="e.g. CSI Chapter" value={form.organizer} onChange={(e) => setForm({ ...form, organizer: e.target.value })} />
          </Field>
          <Field label="Description">
            <Textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </Field>
        </div>
        <div className="modal-actions">
          <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
          <Button onClick={save} disabled={!form.name.trim()}>{editing ? 'Save Changes' : 'Create Event'}</Button>
        </div>
      </Modal>
    </div>
  )
}
