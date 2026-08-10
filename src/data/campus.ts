import type { CampusEdge, CampusNode, NodeCategory } from '../types'

// ── Campus data ──────────────────────────────────────────────────────────────
// All placeholder data lives here so it can be swapped for the real college
// campus (and later an interactive 3D model) without touching any page code.

// Prefix a root-absolute asset path (e.g. '/campus/photos/block-a-1.svg') with
// the deployment base so assets resolve on GitHub Pages (/campuswayfinder/) and
// at the root (Vercel/Surge/local) alike.
const withBase = (path: string): string => `${import.meta.env.BASE_URL.replace(/\/+$/, '')}${path}`

export const CATEGORY_META: Record<NodeCategory, { label: string; color: string }> = {
  gate: { label: 'Gate', color: '#334155' },
  admission: { label: 'Admission', color: '#0d9488' },
  academic: { label: 'Academic Block', color: '#4f46e5' },
  lab: { label: 'Laboratory', color: '#0891b2' },
  library: { label: 'Library', color: '#7c3aed' },
  hostel: { label: 'Hostel', color: '#d97706' },
  canteen: { label: 'Canteen', color: '#ea580c' },
  admin: { label: 'Office', color: '#2563eb' },
  auditorium: { label: 'Auditorium', color: '#db2777' },
  medical: { label: 'Medical', color: '#dc2626' },
  parking: { label: 'Parking', color: '#64748b' },
  reception: { label: 'Reception', color: '#0891b2' },
  departments: { label: 'Department', color: '#059669' },
  cabins: { label: 'Faculty Cabins', color: '#9333ea' },
}

export const CAMPUS_NODES: CampusNode[] = [
  {
    id: 'main-gate',
    photos: ['/campus/photos/main-gate-1.svg', '/campus/photos/main-gate-2.svg', '/campus/photos/main-gate-3.svg'],
    name: 'Main Gate',
    shortName: 'Main Gate',
    category: 'gate',
    x: 50,
    y: 92,
    description: 'The main entrance to the campus. Security check and visitor desk are located here.',
    tags: ['entrance', 'security', 'gate', 'exit'],
  },
  {
    id: 'parking',
    photos: ['/campus/photos/parking-1.svg', '/campus/photos/parking-2.svg', '/campus/photos/parking-3.svg'],
    name: 'Parking',
    shortName: 'Parking',
    category: 'parking',
    x: 85,
    y: 90,
    description: 'Open parking area for staff, faculty and visitors. Entry from the east side of the campus.',
    tags: ['parking', 'car', 'vehicle', 'two wheeler'],
  },
  {
    id: 'reception',
    photos: ['/campus/photos/reception-1.svg', '/campus/photos/reception-2.svg', '/campus/photos/reception-3.svg'],
    name: 'Reception',
    shortName: 'Reception',
    category: 'reception',
    x: 50,
    y: 82,
    description: 'Central reception and help desk. Get directions, visitor badges and general information here.',
    hours: '8:30 AM – 6:00 PM',
    tags: ['reception', 'help desk', 'visitor', 'information'],
  },
  {
    id: 'admission',
    photos: ['/campus/photos/admission-1.svg', '/campus/photos/admission-2.svg', '/campus/photos/admission-3.svg'],
    name: 'Admission Block',
    shortName: 'Admission',
    category: 'admission',
    x: 28,
    y: 84,
    description: 'Admissions office for new student enrollment, documents verification and fee queries.',
    hours: '9:00 AM – 5:00 PM (Mon–Fri)',
    tags: ['admission', 'enrollment', 'fee', 'documents'],
  },
  {
    id: 'admin',
    photos: ['/campus/photos/admin-1.svg', '/campus/photos/admin-2.svg', '/campus/photos/admin-3.svg'],
    name: 'Administration Office',
    shortName: 'Admin',
    category: 'admin',
    x: 70,
    y: 82,
    description: 'Administrative office housing the Principal and Director offices and official records.',
    hours: '9:00 AM – 5:00 PM (Mon–Fri)',
    tags: ['administration', 'office', 'principal', 'director', 'records'],
  },
  {
    id: 'auditorium',
    photos: ['/campus/photos/auditorium-1.svg', '/campus/photos/auditorium-2.svg', '/campus/photos/auditorium-3.svg'],
    name: 'Auditorium',
    shortName: 'Auditorium',
    category: 'auditorium',
    x: 90,
    y: 70,
    description: 'Main auditorium used for seminars, cultural events, conferences and college functions.',
    tags: ['auditorium', 'seminar', 'event', 'stage'],
  },
  {
    id: 'block-a',
    photos: ['/campus/photos/block-a-1.svg', '/campus/photos/block-a-2.svg', '/campus/photos/block-a-3.svg'],
    name: 'Academic Block A',
    shortName: 'Block A',
    category: 'academic',
    x: 28,
    y: 55,
    description: 'Classrooms and lecture halls. Departments: Computer Science and Mathematics.',
    hours: '7:30 AM – 6:30 PM',
    tags: ['classroom', 'block a', 'cs', 'computer science', 'mathematics', 'lecture'],
  },
  {
    id: 'block-b',
    photos: ['/campus/photos/block-b-1.svg', '/campus/photos/block-b-2.svg', '/campus/photos/block-b-3.svg'],
    name: 'Academic Block B',
    shortName: 'Block B',
    category: 'academic',
    x: 50,
    y: 55,
    description: 'Classrooms and lecture halls. Departments: Electronics, Physics and Chemistry.',
    hours: '7:30 AM – 6:30 PM',
    tags: ['classroom', 'block b', 'electronics', 'physics', 'chemistry', 'lecture'],
  },
  {
    id: 'block-c',
    photos: ['/campus/photos/block-c-1.svg', '/campus/photos/block-c-2.svg', '/campus/photos/block-c-3.svg'],
    name: 'Academic Block C',
    shortName: 'Block C',
    category: 'academic',
    x: 72,
    y: 55,
    description: 'Higher-semester classrooms and seminar halls. Departments: Mechanical and Civil.',
    hours: '7:30 AM – 6:30 PM',
    tags: ['classroom', 'block c', 'mechanical', 'civil', 'seminar'],
  },
  {
    id: 'departments',
    photos: ['/campus/photos/departments-1.svg', '/campus/photos/departments-2.svg', '/campus/photos/departments-3.svg'],
    name: 'Department Offices',
    shortName: 'Dept Offices',
    category: 'departments',
    x: 12,
    y: 60,
    description: 'Faculty department offices for academic queries, attendance and course registrations.',
    hours: '9:00 AM – 5:00 PM (Mon–Fri)',
    tags: ['department', 'office', 'hod', 'attendance'],
  },
  {
    id: 'cabins',
    photos: ['/campus/photos/cabins-1.svg', '/campus/photos/cabins-2.svg', '/campus/photos/cabins-3.svg'],
    name: 'Faculty Cabins',
    shortName: 'Cabins',
    category: 'cabins',
    x: 8,
    y: 30,
    description: 'Individual cabins for faculty members. Near the laboratories block.',
    tags: ['faculty', 'cabin', 'staff', 'teacher'],
  },
  {
    id: 'comp-lab',
    photos: ['/campus/photos/comp-lab-1.svg', '/campus/photos/comp-lab-2.svg', '/campus/photos/comp-lab-3.svg'],
    name: 'Computer Lab',
    shortName: 'Comp Lab',
    category: 'lab',
    x: 28,
    y: 34,
    description: 'Computer laboratories with 120 systems. Programming practicals and DBMS labs are held here.',
    hours: '8:00 AM – 8:00 PM',
    tags: ['computer', 'lab', 'programming', 'dbms', 'practical'],
  },
  {
    id: 'mech-lab',
    photos: ['/campus/photos/mech-lab-1.svg', '/campus/photos/mech-lab-2.svg', '/campus/photos/mech-lab-3.svg'],
    name: 'Mechanical Lab',
    shortName: 'Mech Lab',
    category: 'lab',
    x: 50,
    y: 34,
    description: 'Mechanical and civil engineering laboratories with workshop equipment.',
    hours: '8:00 AM – 8:00 PM',
    tags: ['mechanical', 'lab', 'workshop', 'engineering'],
  },
  {
    id: 'medical',
    photos: ['/campus/photos/medical-1.svg', '/campus/photos/medical-2.svg', '/campus/photos/medical-3.svg'],
    name: 'Medical Room',
    shortName: 'Medical',
    category: 'medical',
    x: 70,
    y: 34,
    description: 'First-aid and emergency medical room. Nurse on duty during college hours.',
    hours: '24 × 7',
    tags: ['medical', 'first aid', 'emergency', 'health', 'doctor'],
  },
  {
    id: 'library',
    photos: ['/campus/photos/library-1.svg', '/campus/photos/library-2.svg', '/campus/photos/library-3.svg'],
    name: 'Central Library',
    shortName: 'Library',
    category: 'library',
    x: 88,
    y: 28,
    description: 'Central library with 50,000+ books, digital reading room and reference sections.',
    hours: '8:00 AM – 9:00 PM',
    tags: ['library', 'books', 'reading', 'reference', 'study'],
  },
  {
    id: 'canteen',
    photos: ['/campus/photos/canteen-1.svg', '/campus/photos/canteen-2.svg', '/campus/photos/canteen-3.svg'],
    name: 'Canteen',
    shortName: 'Canteen',
    category: 'canteen',
    x: 50,
    y: 16,
    description: 'Campus canteen serving breakfast, lunch, snacks and beverages.',
    hours: '8:00 AM – 8:00 PM',
    tags: ['canteen', 'food', 'lunch', 'snacks', 'coffee'],
  },
  {
    id: 'boys-hostel',
    photos: ['/campus/photos/boys-hostel-1.svg', '/campus/photos/boys-hostel-2.svg', '/campus/photos/boys-hostel-3.svg'],
    name: 'Boys Hostel',
    shortName: 'Boys Hostel',
    category: 'hostel',
    x: 22,
    y: 12,
    description: 'Boys hostel with 400 beds, mess, common room and laundry.',
    hours: '24 × 7',
    tags: ['hostel', 'boys', 'stay', 'mess'],
  },
  {
    id: 'girls-hostel',
    photos: ['/campus/photos/girls-hostel-1.svg', '/campus/photos/girls-hostel-2.svg', '/campus/photos/girls-hostel-3.svg'],
    name: 'Girls Hostel',
    shortName: 'Girls Hostel',
    category: 'hostel',
    x: 62,
    y: 12,
    description: 'Girls hostel with 350 beds, mess, common room and recreation area.',
    hours: '24 × 7',
    tags: ['hostel', 'girls', 'stay', 'mess'],
  },
]

// Resolve photo paths against the deployment base (works on the GitHub Pages
// /campuswayfinder/ subpath and at the root alike).
for (const node of CAMPUS_NODES) {
  if (node.photos) node.photos = node.photos.map(withBase)
}

export const nodeById = new Map<string, CampusNode>(CAMPUS_NODES.map((n) => [n.id, n]))

export const getNode = (id: string): CampusNode | undefined => nodeById.get(id)

export const CAMPUS_EDGES: CampusEdge[] = [
  { from: 'main-gate', to: 'reception', distance: 25, pathName: 'Main Walkway' },
  { from: 'main-gate', to: 'admission', distance: 55, pathName: 'Entrance Drive' },
  { from: 'main-gate', to: 'parking', distance: 40, pathName: 'Parking Path' },
  { from: 'reception', to: 'admission', distance: 35, pathName: 'Reception Walk' },
  { from: 'reception', to: 'admin', distance: 30, pathName: 'Administration Path' },
  { from: 'admission', to: 'departments', distance: 60, pathName: 'West Corridor' },
  { from: 'admission', to: 'block-a', distance: 80, pathName: 'Academic Walkway' },
  { from: 'admin', to: 'auditorium', distance: 45, pathName: 'Auditorium Path' },
  { from: 'admin', to: 'block-c', distance: 70, pathName: 'North Walkway' },
  { from: 'parking', to: 'block-c', distance: 90, pathName: 'East Walkway' },
  { from: 'departments', to: 'block-a', distance: 50, pathName: 'West Corridor' },
  { from: 'departments', to: 'cabins', distance: 70, pathName: 'Staff Path' },
  { from: 'block-a', to: 'block-b', distance: 60, pathName: 'Central Plaza' },
  { from: 'block-b', to: 'block-c', distance: 55, pathName: 'Central Plaza' },
  { from: 'block-a', to: 'comp-lab', distance: 55, pathName: 'Lab Lane' },
  { from: 'block-b', to: 'mech-lab', distance: 50, pathName: 'Lab Lane' },
  { from: 'block-c', to: 'medical', distance: 60, pathName: 'Health Path' },
  { from: 'comp-lab', to: 'mech-lab', distance: 55, pathName: 'Lab Lane' },
  { from: 'comp-lab', to: 'cabins', distance: 45, pathName: 'Staff Path' },
  { from: 'mech-lab', to: 'medical', distance: 50, pathName: 'Health Path' },
  { from: 'medical', to: 'library', distance: 50, pathName: 'Library Path' },
  { from: 'library', to: 'auditorium', distance: 95, pathName: 'Auditorium Path' },
  { from: 'library', to: 'canteen', distance: 100, pathName: 'Food Walk' },
  { from: 'comp-lab', to: 'canteen', distance: 70, pathName: 'Food Walk' },
  { from: 'canteen', to: 'boys-hostel', distance: 60, pathName: 'Hostel Walk' },
  { from: 'canteen', to: 'girls-hostel', distance: 45, pathName: 'Hostel Walk' },
  { from: 'boys-hostel', to: 'girls-hostel', distance: 90, pathName: 'Hostel Walk' },
  { from: 'library', to: 'girls-hostel', distance: 95, pathName: 'Hostel Walk' },
]

// ── Visitor quick destinations ───────────────────────────────────────────────
export const VISITOR_DESTINATIONS: { id: string; label: string; icon: string }[] = [
  { id: 'admission', label: 'Admission Block', icon: 'admission' },
  { id: 'admin', label: 'Administration Office', icon: 'admin' },
  { id: 'boys-hostel', label: 'Hostel', icon: 'hostel' },
  { id: 'departments', label: 'Department', icon: 'departments' },
  { id: 'reception', label: 'Reception', icon: 'reception' },
  { id: 'admin', label: 'Principal / Director Office', icon: 'admin' },
  { id: 'auditorium', label: 'Auditorium', icon: 'auditorium' },
  { id: 'library', label: 'Library', icon: 'library' },
  { id: 'parking', label: 'Parking', icon: 'parking' },
  { id: 'canteen', label: 'Canteen', icon: 'canteen' },
  { id: 'medical', label: 'Medical / Emergency Point', icon: 'medical' },
]

// ── Building footprints (aerial scene) ──────────────────────────────────────
// Roof sizes used by the aerial campus scene and by the interactive map hit
// areas. Per category so buildings look natural from above.

export const BUILDING_FOOTPRINTS: Record<string, { w: number; h: number }> = {
  gate: { w: 6.5, h: 4.6 },
  reception: { w: 7.6, h: 6.2 },
  admission: { w: 9.6, h: 6.8 },
  admin: { w: 10.2, h: 7.8 },
  academic: { w: 12.6, h: 8.2 },
  lab: { w: 10.6, h: 7.6 },
  library: { w: 11.2, h: 9.2 },
  hostel: { w: 16.8, h: 7 },
  canteen: { w: 8.6, h: 6.8 },
  auditorium: { w: 13.8, h: 8.8 },
  medical: { w: 7.2, h: 6.2 },
  parking: { w: 12.2, h: 7.6 },
  departments: { w: 8.6, h: 6.6 },
  cabins: { w: 6.8, h: 9.8 },
}

export const footprintFor = (node: CampusNode): { w: number; h: number } =>
  BUILDING_FOOTPRINTS[node.category] ?? { w: 9, h: 6.5 }

// ── Campus imagery (primary visual layer) ───────────────────────────────────
// The base visual layer of the campus map is an image: public/campus/campus-aerial.svg
// (a sample "satellite photo" placeholder — see public/campus/README.md).
//
// To swap in the real college later:
//   1. Drop the satellite/aerial photo into /public/campus/  (e.g. campus-aerial.jpg)
//   2. Set aerialImageUrl to its path (e.g. '/campus/campus-aerial.jpg') — or keep
//      the same filename so no code change is needed.
//   3. Align the building pins with the photo by editing each node's x/y below.
// <CampusMap> renders the image as the base layer; building data, routing,
// timetable and services are separate interactive layers and keep working
// unchanged. Set aerialImageUrl to null to fall back to the generated scene.
// If you edit the node x/y coordinates below, regenerate the placeholder with
// `node scripts/generate-campus-aerial.mjs` (the real photo needs no regeneration).
export const CAMPUS_IMAGERY: { aerialImageUrl: string | null } = {
  aerialImageUrl: withBase('/campus/campus-aerial.svg'),
}

export const EMERGENCY_NODES: { id: string; label: string; icon: string }[] = [
  { id: 'medical', label: 'Medical Room', icon: 'medical' },
  { id: 'main-gate', label: 'Security (Main Gate)', icon: 'gate' },
  { id: 'reception', label: 'Help Desk (Reception)', icon: 'reception' },
]

export const EMERGENCY_CONTACTS = [
  { label: 'Campus Security', phone: '+91 1800 425 0111' },
  { label: 'Ambulance / Medical', phone: '108' },
  { label: 'Fire & Rescue', phone: '101' },
  { label: 'Police', phone: '100' },
  { label: 'Women Helpline', phone: '1091' },
]
