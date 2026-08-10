import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Building2, CalendarDays, MapPin, Megaphone, Navigation, Package, Search as SearchIcon } from 'lucide-react'
import { CAMPUS_NODES, getNode } from '../data/campus'
import { useApp } from '../context/AppContext'
import { Badge, Card, EmptyState, Input } from '../components/ui'
import { BuildingPhoto } from '../components/BuildingPhoto'

export function Search() {
  const navigate = useNavigate()
  const { timetable, events, announcements, lostFound } = useApp()
  const [q, setQ] = useState('')

  const query = q.trim().toLowerCase()

  const buildings = useMemo(
    () => (query ? CAMPUS_NODES.filter((n) => n.name.toLowerCase().includes(query) || n.tags.some((t) => t.includes(query)) || n.category.includes(query)) : []),
    [query],
  )

  const classrooms = useMemo(
    () =>
      query
        ? timetable.filter((e) => e.subject.toLowerCase().includes(query) || e.room.toLowerCase().includes(query) || getNode(e.buildingId)?.name.toLowerCase().includes(query))
        : [],
    [query, timetable],
  )

  const eventsResults = useMemo(
    () => (query ? events.filter((e) => e.name.toLowerCase().includes(query) || e.category.toLowerCase().includes(query)) : []),
    [query, events],
  )

  const annResults = useMemo(
    () => (query ? announcements.filter((a) => a.title.toLowerCase().includes(query) || a.description.toLowerCase().includes(query)) : []),
    [query, announcements],
  )

  const lfResults = useMemo(
    () => (query ? lostFound.filter((i) => i.itemName.toLowerCase().includes(query)) : []),
    [query, lostFound],
  )

  const total = buildings.length + classrooms.length + eventsResults.length + annResults.length + lfResults.length

  return (
    <div className="page">
      <div className="page__header">
        <h1>Campus Search</h1>
        <p>Buildings, classrooms, labs, faculty, events and more</p>
      </div>

      <div className="search-hero">
        <SearchIcon size={18} />
        <Input
          placeholder="Search campus… e.g. library, DBMS, Block B"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          autoFocus
        />
      </div>

      {!query && (
        <div className="search-popular">
          <span className="search-popular__label">Try searching</span>
          <div className="nav-quick__chips">
            {['Library', 'DBMS', 'Hostel', 'Hackathon', 'Canteen', 'Admission', 'Medical'].map((s) => (
              <button key={s} className="chip" onClick={() => setQ(s)}>{s}</button>
            ))}
          </div>
        </div>
      )}

      {query && total === 0 && <EmptyState icon={<SearchIcon size={28} />} title={`No results for "${q}"`} subtitle="Try a building, subject, room number or event name." />}

      {buildings.length > 0 && (
        <SearchSection title="Buildings & Facilities" icon={<Building2 size={16} />}>
          {buildings.map((b) => (
            <Card key={b.id} className="search-result">
              <BuildingPhoto node={b} variant="thumb" />
              <div className="search-result__body">
                <h3>{b.name}</h3>
                <p>{b.description}</p>
              </div>
              <button className="search-result__go" onClick={() => navigate(`/navigate?to=${b.id}`)}>
                <Navigation size={16} />
              </button>
            </Card>
          ))}
        </SearchSection>
      )}

      {classrooms.length > 0 && (
        <SearchSection title="Classes & Classrooms" icon={<MapPin size={16} />}>
          {classrooms.map((e) => (
            <Card key={e.id} className="search-result">
              <div className="search-result__body">
                <h3>{e.subject} <Badge tone="primary">Class</Badge></h3>
                <p>{getNode(e.buildingId)?.name} — Room {e.room} · {e.day} {e.time}</p>
              </div>
              <button className="search-result__go" onClick={() => navigate(`/navigate?to=${e.buildingId}&room=${encodeURIComponent(e.room)}&class=${encodeURIComponent(e.subject)}`)}>
                <ArrowRight size={16} />
              </button>
            </Card>
          ))}
        </SearchSection>
      )}

      {eventsResults.length > 0 && (
        <SearchSection title="Events" icon={<CalendarDays size={16} />}>
          {eventsResults.map((e) => (
            <Card key={e.id} className="search-result" onClick={() => navigate(`/navigate?to=${e.locationId}&event=${encodeURIComponent(e.name)}`)}>
              <div className="search-result__body">
                <h3>{e.name} <Badge tone="violet">{e.category}</Badge></h3>
                <p>{getNode(e.locationId)?.name}</p>
              </div>
              <span className="search-result__go"><ArrowRight size={16} /></span>
            </Card>
          ))}
        </SearchSection>
      )}

      {annResults.length > 0 && (
        <SearchSection title="Announcements" icon={<Megaphone size={16} />}>
          {annResults.map((a) => (
            <Card key={a.id} className="search-result">
              <div className="search-result__body">
                <h3>{a.title}</h3>
                <p>{a.description.slice(0, 90)}{a.description.length > 90 ? '…' : ''}</p>
              </div>
            </Card>
          ))}
        </SearchSection>
      )}

      {lfResults.length > 0 && (
        <SearchSection title="Lost & Found" icon={<Package size={16} />}>
          {lfResults.map((i) => (
            <Card key={i.id} className="search-result">
              <div className="search-result__body">
                <h3>{i.itemName} <Badge tone={i.kind === 'lost' ? 'danger' : 'success'}>{i.kind}</Badge></h3>
                <p>{i.location} · {i.status}</p>
              </div>
            </Card>
          ))}
        </SearchSection>
      )}
    </div>
  )
}

function SearchSection({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="search-section">
      <h2 className="search-section__title">{icon} {title}</h2>
      <div className="search-section__list">{children}</div>
    </div>
  )
}
