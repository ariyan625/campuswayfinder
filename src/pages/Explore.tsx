import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Clock, Info, MapPin, Navigation, Search } from 'lucide-react'
import { CampusMap } from '../components/CampusMap'
import { BuildingGallery } from '../components/BuildingGallery'
import { getNode, CAMPUS_NODES, CATEGORY_META } from '../data/campus'
import { useApp } from '../context/AppContext'
import { findShortestRoute, formatDistance, formatMinutes } from '../lib/navigation'
import { Badge, Button, Card, Input } from '../components/ui'

export function Explore() {
  const navigate = useNavigate()
  const { locationId } = useApp()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [query, setQuery] = useState('')

  const selected = selectedId ? getNode(selectedId) : undefined

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return []
    return CAMPUS_NODES.filter(
      (n) => n.name.toLowerCase().includes(q) || n.tags.some((t) => t.includes(q)) || n.category.includes(q),
    ).slice(0, 6)
  }, [query])

  const distanceFromMe = selected ? findShortestRoute(locationId, selected.id) : null

  return (
    <div className="page page--explore">
      <div className="page__header">
        <h1>Explore Campus</h1>
        <p>Pan, zoom and tap a building to learn more</p>
      </div>

      <div className="explore-search">
        <Search size={16} className="explore-search__icon" />
        <Input placeholder="Search buildings, labs, facilities…" value={query} onChange={(e) => setQuery(e.target.value)} />
      </div>

      {results.length > 0 && (
        <div className="explore-results">
          {results.map((r) => (
            <button
              key={r.id}
              className="explore-result"
              onClick={() => {
                setSelectedId(r.id)
                setQuery('')
              }}
            >
              <span style={{ background: CATEGORY_META[r.category].color }} className="explore-result__dot" />
              <span>{r.name}</span>
              <ArrowRight size={14} />
            </button>
          ))}
        </div>
      )}

      <motion.div
        initial={{ opacity: 0, scale: 0.99 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
      >
        <CampusMap
          height={380}
          fromId={locationId}
          selectedId={selectedId}
          toId={selectedId ?? undefined}
          onSelect={setSelectedId}
        />
      </motion.div>

      {selected && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
          <Card className="building-card">
            <BuildingGallery key={selected.id} node={selected} />
            <div className="building-card__head">
              <span className="building-card__icon" style={{ background: CATEGORY_META[selected.category].color }}>
                <MapPin size={20} />
              </span>
              <div>
                <h3>{selected.name}</h3>
                <Badge tone="primary">{CATEGORY_META[selected.category].label}</Badge>
              </div>
            </div>
            <p className="building-card__desc">
              <Info size={14} /> {selected.description}
            </p>
            {selected.hours && (
              <p className="building-card__hours">
                <Clock size={14} /> {selected.hours}
              </p>
            )}
            <div className="building-card__actions">
              <Button variant="outline" onClick={() => setSelectedId(null)}>
                Close
              </Button>
              <Button
                onClick={() => navigate(`/navigate?to=${selected.id}`)}
                icon={<Navigation size={16} />}
              >
                Get Directions
              </Button>
            </div>
            {distanceFromMe && distanceFromMe.distance > 0 && (
              <p className="building-card__distance">
                From your location: {formatDistance(distanceFromMe.distance)} · ~{formatMinutes(distanceFromMe.minutes)}
              </p>
            )}
          </Card>
        </motion.div>
      )}

      {!selected && (
        <div className="map-legend">
          {Object.entries(CATEGORY_META).map(([cat, meta]) => (
            <span className="legend-item" key={cat}>
              <span className="legend-item__dot" style={{ background: meta.color }} />
              {meta.label}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
