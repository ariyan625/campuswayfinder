import { useState } from 'react'
import { motion } from 'framer-motion'
import { Bell, CalendarDays, Clock, MapPin, Megaphone, Pencil, Plus, Trash2 } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { formatDateLabel, formatTime12, todayISO } from '../lib/format'
import { Badge, Button, Card, EmptyState, Field, Input, Modal, SectionTitle, Textarea } from '../components/ui'
import type { Announcement } from '../types'

const EMPTY = { title: '', description: '', date: todayISO(), time: '09:00', location: '', important: false }

export function Announcements() {
  const { announcements, addAnnouncement, updateAnnouncement, deleteAnnouncement } = useApp()
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Announcement | null>(null)
  const [form, setForm] = useState(EMPTY)

  const sorted = [...announcements].sort((a, b) => (a.important === b.important ? 0 : a.important ? -1 : 1))

  const openAdd = () => {
    setEditing(null)
    setForm(EMPTY)
    setModalOpen(true)
  }
  const openEdit = (a: Announcement) => {
    setEditing(a)
    setForm({ title: a.title, description: a.description, date: a.date, time: a.time, location: a.location, important: a.important })
    setModalOpen(true)
  }
  const save = () => {
    if (!form.title.trim()) return
    if (editing) updateAnnouncement({ ...editing, ...form, title: form.title.trim() })
    else addAnnouncement({ ...form, title: form.title.trim() })
    setModalOpen(false)
  }

  return (
    <div className="page">
      <div className="page__header">
        <h1>Announcements</h1>
        <p>Official campus notices and updates</p>
      </div>

      <SectionTitle action={<Button onClick={openAdd} icon={<Plus size={15} />}>New Announcement</Button>}>
        <span className="section-title__with-icon"><Megaphone size={17} /> Latest</span>
      </SectionTitle>

      {sorted.length === 0 ? (
        <EmptyState icon={<Bell size={28} />} title="No announcements yet" subtitle="Post the first campus announcement." />
      ) : (
        <div className="ann-list">
          {sorted.map((a, i) => (
            <motion.div key={a.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
              <Card className={`ann-card ${a.important ? 'ann-card--important' : ''}`}>
                <div className="ann-card__head">
                  <div>
                    <h3>{a.title}</h3>
                    <div className="ann-card__meta">
                      <span><CalendarDays size={13} /> {formatDateLabel(a.date)}</span>
                      <span><Clock size={13} /> {formatTime12(a.time)}</span>
                      {a.location && <span><MapPin size={13} /> {a.location}</span>}
                    </div>
                  </div>
                  <div className="ann-card__side">
                    {a.important && <Badge tone="danger">Important</Badge>}
                    {!a.important && <Badge tone="muted">Normal</Badge>}
                    <div className="ann-card__actions">
                      <Button variant="ghost" onClick={() => openEdit(a)} icon={<Pencil size={15} />} aria-label="Edit" />
                      <Button variant="ghost" onClick={() => deleteAnnouncement(a.id)} icon={<Trash2 size={15} />} aria-label="Delete" />
                    </div>
                  </div>
                </div>
                <p className="ann-card__desc">{a.description}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Announcement' : 'New Announcement'} wide>
        <div className="form-grid">
          <Field label="Title">
            <Input placeholder="e.g. Tomorrow's classes will begin at 10:00 AM" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </Field>
          <Field label="Description">
            <Textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </Field>
          <Field label="Date">
            <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          </Field>
          <Field label="Time">
            <Input type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} />
          </Field>
          <Field label="Location">
            <Input placeholder="e.g. All Blocks" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
          </Field>
          <label className="checkbox-field">
            <input type="checkbox" checked={form.important} onChange={(e) => setForm({ ...form, important: e.target.checked })} />
            <span>Mark as Important</span>
          </label>
        </div>
        <div className="modal-actions">
          <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
          <Button onClick={save} disabled={!form.title.trim()}>{editing ? 'Save Changes' : 'Post Announcement'}</Button>
        </div>
      </Modal>
    </div>
  )
}
