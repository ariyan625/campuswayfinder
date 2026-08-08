import { useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Camera, Filter, Package, Pencil, Search, Trash2 } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { formatDateLabel, todayISO } from '../lib/format'
import { Badge, Button, Card, EmptyState, Field, Input, Modal, Select, Textarea } from '../components/ui'
import type { LostFoundItem, LostFoundKind, LostFoundStatus } from '../types'

const EMPTY = {
  kind: 'lost' as LostFoundKind,
  itemName: '',
  description: '',
  location: '',
  date: todayISO(),
  contact: '',
  image: '',
  status: 'Lost' as LostFoundStatus,
}

export function LostFound() {
  const { lostFound, addLostFoundItem, updateLostFoundItem, deleteLostFoundItem, setLostFoundStatus } = useApp()
  const [tab, setTab] = useState<'all' | LostFoundKind>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | LostFoundStatus>('all')
  const [query, setQuery] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<LostFoundItem | null>(null)
  const [form, setForm] = useState(EMPTY)
  const fileRef = useRef<HTMLInputElement>(null)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return lostFound.filter((i) => {
      if (tab !== 'all' && i.kind !== tab) return false
      if (statusFilter !== 'all' && i.status !== statusFilter) return false
      if (q && !i.itemName.toLowerCase().includes(q) && !i.description.toLowerCase().includes(q)) return false
      return true
    })
  }, [lostFound, tab, statusFilter, query])

  const openAdd = (kind: LostFoundKind) => {
    setEditing(null)
    setForm({ ...EMPTY, kind, status: kind === 'lost' ? 'Lost' : 'Found' })
    setModalOpen(true)
  }
  const openEdit = (i: LostFoundItem) => {
    setEditing(i)
    setForm({ kind: i.kind, itemName: i.itemName, description: i.description, location: i.location, date: i.date, contact: i.contact, image: i.image ?? '', status: i.status })
    setModalOpen(true)
  }
  const save = () => {
    if (!form.itemName.trim()) return
    const payload = { ...form, itemName: form.itemName.trim() }
    if (editing) updateLostFoundItem({ ...editing, ...payload })
    else addLostFoundItem(payload)
    setModalOpen(false)
  }

  const onImage = (file: File | undefined) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setForm((f) => ({ ...f, image: String(reader.result) }))
    reader.readAsDataURL(file)
  }

  return (
    <div className="page">
      <div className="page__header">
        <h1>Lost & Found</h1>
        <p>Report or find items on campus</p>
      </div>

      <div className="lf-actions">
        <Button variant="secondary" onClick={() => openAdd('lost')} icon={<Package size={15} />}>Report Lost Item</Button>
        <Button variant="primary" onClick={() => openAdd('found')} icon={<Package size={15} />}>Report Found Item</Button>
      </div>

      <div className="lf-filters">
        <div className="lf-tabs">
          {(['all', 'lost', 'found'] as const).map((t) => (
            <button key={t} className={`lf-tab ${tab === t ? 'lf-tab--active' : ''}`} onClick={() => setTab(t)}>
              {t[0].toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
        <div className="lf-toolbar">
          <div className="lf-search">
            <Search size={15} />
            <Input placeholder="Search items…" value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
          <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)} aria-label="Filter by status">
            <option value="all">All status</option>
            <option value="Lost">Lost</option>
            <option value="Found">Found</option>
            <option value="Claimed">Claimed</option>
          </Select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={<Filter size={28} />} title="No items found" subtitle="Try a different filter or report a new item." />
      ) : (
        <div className="lf-grid">
          {filtered.map((i, idx) => (
            <motion.div key={i.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.03 }}>
              <Card className="lf-card">
                {i.image && <img src={i.image} alt={i.itemName} className="lf-card__img" />}
                <div className="lf-card__body">
                  <div className="lf-card__head">
                    <Badge tone={i.kind === 'lost' ? 'danger' : 'success'}>{i.kind === 'lost' ? 'Lost' : 'Found'}</Badge>
                    <Badge tone={i.status === 'Claimed' ? 'muted' : i.status === 'Found' ? 'success' : 'warning'}>{i.status}</Badge>
                  </div>
                  <h3>{i.itemName}</h3>
                  <p className="lf-card__desc">{i.description}</p>
                  <p className="lf-card__meta">📍 {i.location} · {formatDateLabel(i.date)}</p>
                  <p className="lf-card__contact">Contact: {i.contact}</p>
                  <div className="lf-card__actions">
                    {i.status !== 'Claimed' && (
                      <Button variant="outline" size="sm" onClick={() => setLostFoundStatus(i.id, 'Claimed')}>Mark Claimed</Button>
                    )}
                    <Button variant="ghost" onClick={() => openEdit(i)} icon={<Pencil size={14} />} aria-label="Edit" />
                    <Button variant="ghost" onClick={() => deleteLostFoundItem(i.id)} icon={<Trash2 size={14} />} aria-label="Delete" />
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Item' : `Report ${form.kind === 'lost' ? 'Lost' : 'Found'} Item`} wide>
        <div className="form-grid">
          <Field label="Item name">
            <Input placeholder="e.g. Blue water bottle" value={form.itemName} onChange={(e) => setForm({ ...form, itemName: e.target.value })} />
          </Field>
          <Field label="Description">
            <Textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </Field>
          <Field label="Location">
            <Input placeholder={form.kind === 'lost' ? 'Last seen location' : 'Where it was found'} value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
          </Field>
          <Field label="Date">
            <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          </Field>
          <Field label="Contact information">
            <Input placeholder="Phone or email" value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} />
          </Field>
          <Field label="Image" hint="Optional photo of the item">
            <div className="image-upload">
              {form.image ? (
                <img src={form.image} alt="Uploaded item" className="image-upload__preview" />
              ) : (
                <button type="button" className="image-upload__drop" onClick={() => fileRef.current?.click()}>
                  <Camera size={18} /> Add photo
                </button>
              )}
              <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => onImage(e.target.files?.[0])} />
              {form.image && <Button variant="ghost" size="sm" onClick={() => setForm({ ...form, image: '' })}>Remove</Button>}
            </div>
          </Field>
        </div>
        <div className="modal-actions">
          <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
          <Button onClick={save} disabled={!form.itemName.trim()}>{editing ? 'Save Changes' : 'Submit Report'}</Button>
        </div>
      </Modal>
    </div>
  )
}
