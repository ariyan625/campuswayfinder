import { useState } from 'react'
import { MapPin, Search } from 'lucide-react'
import { CAMPUS_NODES } from '../data/campus'
import { Modal, Input } from './ui'

interface LocationPickerProps {
  open: boolean
  onClose: () => void
  value: string
  onChange: (id: string) => void
  title?: string
}

export function LocationPicker({ open, onClose, value, onChange, title = 'Select your location' }: LocationPickerProps) {
  const [q, setQ] = useState('')
  const filtered = CAMPUS_NODES.filter(
    (n) => n.name.toLowerCase().includes(q.toLowerCase()) || n.tags.some((t) => t.includes(q.toLowerCase())),
  )

  return (
    <Modal open={open} onClose={onClose} title={title} wide>
      <div className="picker-search">
        <Search size={16} />
        <Input placeholder="Search a building or location…" value={q} onChange={(e) => setQ(e.target.value)} autoFocus />
      </div>
      <div className="picker-list">
        {filtered.map((n) => (
          <button
            key={n.id}
            className={`picker-item ${value === n.id ? 'picker-item--active' : ''}`}
            onClick={() => {
              onChange(n.id)
              onClose()
            }}
          >
            <MapPin size={16} />
            <span>{n.name}</span>
            {value === n.id && <span className="picker-item__check">✓</span>}
          </button>
        ))}
        {filtered.length === 0 && <p className="picker-empty">No locations match “{q}”.</p>}
      </div>
    </Modal>
  )
}
