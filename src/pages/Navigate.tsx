import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeftRight, MapPin, Navigation } from 'lucide-react'
import { CampusMap } from '../components/CampusMap'
import { LocationPicker } from '../components/LocationPicker'
import { PhotoLightbox } from '../components/PhotoLightbox'
import { RoutePanel } from '../components/RoutePanel'
import { RouteStrip } from '../components/RouteStrip'
import { getNode, CAMPUS_NODES } from '../data/campus'
import { useApp } from '../context/AppContext'
import { findShortestRoute } from '../lib/navigation'
import type { CampusNode } from '../types'
import { Badge, Button, Card } from '../components/ui'

export function Navigate() {
  const { locationId } = useApp()
  const [params] = useSearchParams()

  const initialTo = params.get('to') ?? 'block-b'
  const roomParam = params.get('room')
  const classParam = params.get('class')

  // Note: this component is keyed by the `to` URL param in App.tsx so that a
  // new “Navigate to Class” tap remounts it with the fresh destination.
  const [fromId, setFromId] = useState(locationId)
  const [toId, setToId] = useState(initialTo)
  const [fromPicker, setFromPicker] = useState(false)
  const [toPicker, setToPicker] = useState(false)
  const [lightbox, setLightbox] = useState<CampusNode | null>(null)

  const route = useMemo(() => findShortestRoute(fromId, toId), [fromId, toId])
  const fromNode = getNode(fromId)
  const toNode = getNode(toId)

  const swap = () => {
    setFromId(toId)
    setToId(fromId)
  }

  return (
    <div className="page">
      <div className="page__header">
        <h1>Navigate</h1>
        <p>Plan the shortest walking route on campus</p>
      </div>

      {classParam && roomParam && (
        <Card className="nav-class-banner">
          <Badge tone="violet">Next class: {classParam}</Badge>
          <p>
            {toNode?.name} — Room {roomParam}
          </p>
        </Card>
      )}

      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
        <Card className="nav-picker-card">
          <div className="nav-picker-row">
            <span className="nav-picker-row__label">From</span>
            <button className="nav-picker" onClick={() => setFromPicker(true)}>
              <MapPin size={16} />
              <span>{fromNode?.name}</span>
            </button>
          </div>
          <button className="nav-swap" onClick={swap} aria-label="Swap start and destination">
            <ArrowLeftRight size={18} />
          </button>
          <div className="nav-picker-row">
            <span className="nav-picker-row__label">To</span>
            <button className="nav-picker" onClick={() => setToPicker(true)}>
              <Navigation size={16} />
              <span>{toNode?.name}</span>
            </button>
          </div>
        </Card>
      </motion.div>

      <RouteStrip nodeIds={route?.nodeIds ?? []} onOpen={setLightbox} />

      <CampusMap route={route?.nodeIds ?? null} fromId={fromId} toId={toId} height={300} onSelect={setToId} />

      {roomParam && (
        <p className="nav-room-note">
          Destination room: <strong>Room {roomParam}</strong>
        </p>
      )}

      <RoutePanel
        route={route}
        fromLabel={fromNode?.name}
        toLabel={toNode?.name}
        navigateLabel="Show Directions"
      />

      <div className="nav-quick">
        <span className="nav-quick__label">Popular destinations</span>
        <div className="nav-quick__chips">
          {CAMPUS_NODES.slice(0, 8).map((n) => (
            <button key={n.id} className="chip" onClick={() => setToId(n.id)}>
              {n.shortName ?? n.name}
            </button>
          ))}
        </div>
      </div>

      <Button variant="outline" className="nav-use-current" onClick={() => setFromId(locationId)} icon={<MapPin size={15} />}>
        Use my current location ({getNode(locationId)?.name})
      </Button>

      <LocationPicker open={fromPicker} onClose={() => setFromPicker(false)} value={fromId} onChange={(id) => { setFromId(id); setFromPicker(false) }} title="Starting location" />
      <LocationPicker open={toPicker} onClose={() => setToPicker(false)} value={toId} onChange={(id) => { setToId(id); setToPicker(false) }} title="Choose destination" />

      {lightbox && <PhotoLightbox node={lightbox} startIndex={0} onClose={() => setLightbox(null)} />}
    </div>
  )
}
