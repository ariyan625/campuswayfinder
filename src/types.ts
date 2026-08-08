// ── Core domain types for CampusWayfinder ────────────────────────────────────

export type Role = 'student' | 'faculty' | 'visitor'

export type NodeCategory =
  | 'gate'
  | 'admission'
  | 'academic'
  | 'lab'
  | 'library'
  | 'hostel'
  | 'canteen'
  | 'admin'
  | 'auditorium'
  | 'medical'
  | 'parking'
  | 'reception'
  | 'departments'
  | 'cabins'

export interface CampusNode {
  id: string
  name: string
  shortName?: string
  category: NodeCategory
  /** Position on the 0–100 × 0–100 campus map (x → east, y → south). */
  x: number
  y: number
  description: string
  hours?: string
  tags: string[]
}

export interface CampusEdge {
  from: string
  to: string
  /** Distance in meters. */
  distance: number
  pathName: string
}

export interface RouteStep {
  from: string
  to: string
  distance: number
  pathName: string
  direction: string
}

export interface RouteResult {
  nodeIds: string[]
  steps: RouteStep[]
  distance: number
  /** Estimated walking time in minutes. */
  minutes: number
}

export interface TimetableEntry {
  id: string
  day: string // 'Monday' ... 'Saturday'
  time: string // 'HH:MM' 24h
  subject: string
  buildingId: string
  room: string
}

export interface Announcement {
  id: string
  title: string
  description: string
  date: string // ISO date
  time: string // 'HH:MM'
  location: string
  important: boolean
}

export type LostFoundKind = 'lost' | 'found'
export type LostFoundStatus = 'Lost' | 'Found' | 'Claimed'

export interface LostFoundItem {
  id: string
  kind: LostFoundKind
  itemName: string
  description: string
  location: string
  date: string // ISO date
  image?: string // data URL
  contact: string
  status: LostFoundStatus
}

export type EventCategory =
  | 'Hackathon'
  | 'Workshop'
  | 'Seminar'
  | 'Cultural'
  | 'Sports'
  | 'Club'

export interface CampusEvent {
  id: string
  name: string
  date: string // ISO date
  time: string // 'HH:MM'
  locationId: string
  description: string
  organizer: string
  category: EventCategory
}

export interface Profile {
  name: string
  studentId?: string
  department?: string
  year?: string
  section?: string
  facultyId?: string
  cabin?: string
  visitorType?: string
}
