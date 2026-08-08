import type { Announcement, CampusEvent, LostFoundItem, TimetableEntry } from '../types'
import { addDays, todayISO } from '../lib/format'

// ── Sample prototype data ────────────────────────────────────────────────────
// Realistic placeholder content so the app works immediately. All of this can be
// replaced with real college data later — it is pure data, no logic.

export const SAMPLE_TIMETABLE: TimetableEntry[] = [
  { id: 't1', day: 'Monday', time: '09:00', subject: 'DBMS', buildingId: 'block-b', room: '204' },
  { id: 't2', day: 'Monday', time: '10:00', subject: 'Java Programming', buildingId: 'block-a', room: '103' },
  { id: 't3', day: 'Monday', time: '11:00', subject: 'DAA', buildingId: 'block-b', room: '301' },
  { id: 't4', day: 'Tuesday', time: '09:00', subject: 'DBMS Lab', buildingId: 'comp-lab', room: 'Lab 2' },
  { id: 't5', day: 'Tuesday', time: '11:00', subject: 'Operating Systems', buildingId: 'block-c', room: '302' },
  { id: 't6', day: 'Wednesday', time: '10:00', subject: 'Data Structures', buildingId: 'block-c', room: '302' },
  { id: 't7', day: 'Wednesday', time: '12:00', subject: 'Mathematics', buildingId: 'block-a', room: '105' },
  { id: 't8', day: 'Thursday', time: '09:00', subject: 'Java Lab', buildingId: 'comp-lab', room: 'Lab 1' },
  { id: 't9', day: 'Friday', time: '10:00', subject: 'DAA', buildingId: 'block-b', room: '301' },
  { id: 't10', day: 'Friday', time: '14:00', subject: 'Seminar', buildingId: 'auditorium', room: 'Main Hall' },
]

export const SAMPLE_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'a1',
    title: 'Tomorrow\u2019s classes will begin at 10:00 AM',
    description:
      'Due to a campus-wide staff meeting, all theory classes tomorrow will begin at 10:00 AM. Laboratories remain as per schedule.',
    date: addDays(todayISO(), 1),
    time: '18:30',
    location: 'All Blocks',
    important: true,
  },
  {
    id: 'a2',
    title: 'Library extended hours during exam week',
    description: 'The Central Library will remain open until 11:00 PM during the final examination week starting next Monday.',
    date: todayISO(),
    time: '09:00',
    location: 'Central Library',
    important: false,
  },
  {
    id: 'a3',
    title: 'Hostel mess menu updated',
    description: 'The new weekly mess menu has been posted on the hostel notice boards. Special dinner on Saturdays.',
    date: addDays(todayISO(), -1),
    time: '20:00',
    location: 'Boys & Girls Hostel',
    important: false,
  },
]

export const SAMPLE_EVENTS: CampusEvent[] = [
  {
    id: 'e1',
    name: '48-Hour Campus Hackathon',
    date: addDays(todayISO(), 7),
    time: '09:00',
    locationId: 'block-c',
    description: 'Team up and build innovative solutions over 48 hours. Prizes worth ₹50,000, mentoring from industry experts.',
    organizer: 'CSI Student Chapter',
    category: 'Hackathon',
  },
  {
    id: 'e2',
    name: 'AI & Machine Learning Workshop',
    date: addDays(todayISO(), 3),
    time: '14:00',
    locationId: 'comp-lab',
    description: 'Hands-on introductory workshop on Python, TensorFlow and model deployment. Bring your laptops.',
    organizer: 'Department of CSE',
    category: 'Workshop',
  },
  {
    id: 'e3',
    name: 'Guest Seminar: Career in Cloud Computing',
    date: addDays(todayISO(), 5),
    time: '11:00',
    locationId: 'auditorium',
    description: 'Industry speaker session on cloud careers, certifications and interview preparation. Open to all years.',
    organizer: 'Placement Cell',
    category: 'Seminar',
  },
  {
    id: 'e4',
    name: 'Annual Cultural Fest — Rhythm 2026',
    date: addDays(todayISO(), 15),
    time: '17:00',
    locationId: 'auditorium',
    description: 'Dance, music, drama and fashion show. Registrations open at the cultural committee desk.',
    organizer: 'Cultural Committee',
    category: 'Cultural',
  },
  {
    id: 'e5',
    name: 'Inter-Department Cricket Tournament',
    date: addDays(todayISO(), 10),
    time: '08:00',
    locationId: 'parking',
    description: 'Annual cricket tournament between departments. Ground near the parking area, teams report by 7:45 AM.',
    organizer: 'Sports Club',
    category: 'Sports',
  },
  {
    id: 'e6',
    name: 'Coding Club — Weekly Contest',
    date: addDays(todayISO(), 2),
    time: '18:00',
    locationId: 'comp-lab',
    description: 'Weekly competitive programming contest. Problem set on DSA fundamentals, prizes for top three.',
    organizer: 'Coding Club',
    category: 'Club',
  },
]

export const SAMPLE_LOST_FOUND: LostFoundItem[] = [
  {
    id: 'l1',
    kind: 'lost',
    itemName: 'Blue Water Bottle',
    description: 'Steel water bottle with blue sleeve, name sticker \u2018Aarav\u2019. Lost near Block A.',
    location: 'Block A, Room 102',
    date: addDays(todayISO(), -1),
    contact: 'aarav@student.campus.edu',
    status: 'Lost',
  },
  {
    id: 'l2',
    kind: 'found',
    itemName: 'Black Calculator (Casio fx-991)',
    description: 'Found on a desk in the Central Library, second floor reading hall.',
    location: 'Central Library',
    date: todayISO(),
    contact: 'library@campus.edu',
    status: 'Found',
  },
  {
    id: 'l3',
    kind: 'lost',
    itemName: 'Student ID Card',
    description: 'ID card with photo, lost somewhere between Canteen and Boys Hostel.',
    location: 'Canteen → Boys Hostel',
    date: addDays(todayISO(), -2),
    contact: 'ravi.mech@student.campus.edu',
    status: 'Lost',
  },
  {
    id: 'l4',
    kind: 'found',
    itemName: 'Red Umbrella',
    description: 'Red folding umbrella found at the reception desk.',
    location: 'Reception',
    date: addDays(todayISO(), -3),
    contact: 'reception@campus.edu',
    status: 'Claimed',
  },
]
