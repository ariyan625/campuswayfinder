import { createContext, useCallback, useContext, useMemo, type ReactNode } from 'react'
import { useLocalStorage } from '../lib/storage'
import { SAMPLE_ANNOUNCEMENTS, SAMPLE_EVENTS, SAMPLE_LOST_FOUND, SAMPLE_TIMETABLE } from '../data/seeds'
import type {
  Announcement,
  CampusEvent,
  LostFoundItem,
  LostFoundStatus,
  Profile,
  Role,
  TimetableEntry,
} from '../types'

interface AppState {
  role: Role | null
  setRole: (r: Role) => void
  profile: Profile
  updateProfile: (p: Profile) => void
  locationId: string
  setLocationId: (id: string) => void

  timetable: TimetableEntry[]
  addTimetableEntry: (e: Omit<TimetableEntry, 'id'>) => void
  updateTimetableEntry: (e: TimetableEntry) => void
  deleteTimetableEntry: (id: string) => void

  announcements: Announcement[]
  addAnnouncement: (a: Omit<Announcement, 'id'>) => void
  updateAnnouncement: (a: Announcement) => void
  deleteAnnouncement: (id: string) => void

  lostFound: LostFoundItem[]
  addLostFoundItem: (i: Omit<LostFoundItem, 'id'>) => void
  updateLostFoundItem: (i: LostFoundItem) => void
  deleteLostFoundItem: (id: string) => void
  setLostFoundStatus: (id: string, status: LostFoundStatus) => void

  events: CampusEvent[]
  addEvent: (e: Omit<CampusEvent, 'id'>) => void
  updateEvent: (e: CampusEvent) => void
  deleteEvent: (id: string) => void

  resetApp: () => void
}

const AppContext = createContext<AppState | null>(null)

const DEFAULT_PROFILES: Record<Role, Profile> = {
  student: {
    name: 'Aarav Kumar',
    studentId: 'CS22014',
    department: 'Computer Science',
    year: '2nd Year',
    section: 'A',
  },
  faculty: {
    name: 'Dr. Meera Nair',
    facultyId: 'FAC-114',
    department: 'Computer Science',
    cabin: 'Block A — Cabin 12',
  },
  visitor: { name: 'Guest', visitorType: 'Parent' },
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useLocalStorage<Role | null>('cwf_role', null)
  const [profile, setProfile] = useLocalStorage<Profile>('cwf_profile', { name: '' })
  const [locationId, setLocationId] = useLocalStorage<string>('cwf_location', 'main-gate')

  const [timetable, setTimetable] = useLocalStorage<TimetableEntry[]>('cwf_timetable', SAMPLE_TIMETABLE)
  const [announcements, setAnnouncements] = useLocalStorage<Announcement[]>('cwf_announcements', SAMPLE_ANNOUNCEMENTS)
  const [lostFound, setLostFound] = useLocalStorage<LostFoundItem[]>('cwf_lostfound', SAMPLE_LOST_FOUND)
  const [events, setEvents] = useLocalStorage<CampusEvent[]>('cwf_events', SAMPLE_EVENTS)

  const setRole = useCallback(
    (r: Role) => {
      setRoleState(r)
      setProfile((prev) => (prev.name ? prev : DEFAULT_PROFILES[r]))
      setLocationId(r === 'faculty' ? 'cabins' : r === 'student' ? 'boys-hostel' : 'main-gate')
    },
    [setRoleState, setProfile, setLocationId],
  )

  const updateProfile = useCallback((p: Profile) => setProfile(p), [setProfile])

  const addTimetableEntry = useCallback(
    (e: Omit<TimetableEntry, 'id'>) => setTimetable((prev) => [...prev, { ...e, id: crypto.randomUUID() }]),
    [setTimetable],
  )
  const updateTimetableEntry = useCallback(
    (e: TimetableEntry) => setTimetable((prev) => prev.map((x) => (x.id === e.id ? e : x))),
    [setTimetable],
  )
  const deleteTimetableEntry = useCallback(
    (id: string) => setTimetable((prev) => prev.filter((x) => x.id !== id)),
    [setTimetable],
  )

  const addAnnouncement = useCallback(
    (a: Omit<Announcement, 'id'>) => setAnnouncements((prev) => [{ ...a, id: crypto.randomUUID() }, ...prev]),
    [setAnnouncements],
  )
  const updateAnnouncement = useCallback(
    (a: Announcement) => setAnnouncements((prev) => prev.map((x) => (x.id === a.id ? a : x))),
    [setAnnouncements],
  )
  const deleteAnnouncement = useCallback(
    (id: string) => setAnnouncements((prev) => prev.filter((x) => x.id !== id)),
    [setAnnouncements],
  )

  const addLostFoundItem = useCallback(
    (i: Omit<LostFoundItem, 'id'>) => setLostFound((prev) => [{ ...i, id: crypto.randomUUID() }, ...prev]),
    [setLostFound],
  )
  const updateLostFoundItem = useCallback(
    (i: LostFoundItem) => setLostFound((prev) => prev.map((x) => (x.id === i.id ? i : x))),
    [setLostFound],
  )
  const deleteLostFoundItem = useCallback(
    (id: string) => setLostFound((prev) => prev.filter((x) => x.id !== id)),
    [setLostFound],
  )
  const setLostFoundStatus = useCallback(
    (id: string, status: LostFoundStatus) =>
      setLostFound((prev) => prev.map((x) => (x.id === id ? { ...x, status } : x))),
    [setLostFound],
  )

  const addEvent = useCallback(
    (e: Omit<CampusEvent, 'id'>) => setEvents((prev) => [...prev, { ...e, id: crypto.randomUUID() }]),
    [setEvents],
  )
  const updateEvent = useCallback(
    (e: CampusEvent) => setEvents((prev) => prev.map((x) => (x.id === e.id ? e : x))),
    [setEvents],
  )
  const deleteEvent = useCallback((id: string) => setEvents((prev) => prev.filter((x) => x.id !== id)), [setEvents])

  const resetApp = useCallback(() => {
    setRoleState(null)
    setProfile({ name: '' })
    setLocationId('main-gate')
    setTimetable(SAMPLE_TIMETABLE)
    setAnnouncements(SAMPLE_ANNOUNCEMENTS)
    setLostFound(SAMPLE_LOST_FOUND)
    setEvents(SAMPLE_EVENTS)
  }, [setRoleState, setProfile, setLocationId, setTimetable, setAnnouncements, setLostFound, setEvents])

  const value = useMemo<AppState>(
    () => ({
      role,
      setRole,
      profile,
      updateProfile,
      locationId,
      setLocationId,
      timetable,
      addTimetableEntry,
      updateTimetableEntry,
      deleteTimetableEntry,
      announcements,
      addAnnouncement,
      updateAnnouncement,
      deleteAnnouncement,
      lostFound,
      addLostFoundItem,
      updateLostFoundItem,
      deleteLostFoundItem,
      setLostFoundStatus,
      events,
      addEvent,
      updateEvent,
      deleteEvent,
      resetApp,
    }),
    [
      role, setRole, profile, updateProfile, locationId, setLocationId,
      timetable, addTimetableEntry, updateTimetableEntry, deleteTimetableEntry,
      announcements, addAnnouncement, updateAnnouncement, deleteAnnouncement,
      lostFound, addLostFoundItem, updateLostFoundItem, deleteLostFoundItem, setLostFoundStatus,
      events, addEvent, updateEvent, deleteEvent, resetApp,
    ],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components -- standard provider + hook pair
export function useApp(): AppState {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used inside AppProvider')
  return ctx
}
