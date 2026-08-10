// ── Generate sample building-photo placeholders ──────────────────────────────
// Creates public/campus/photos/<node-id>-<n>.svg — three visually distinct
// front-elevation stand-ins per building (different window patterns, lighting
// and sky tone), so the Explore gallery has multiple photos per building. The
// facade follows the building's map footprint (hostels look long, the
// auditorium wide, cabins tall).
//
// When the real photos are ready, drop them into public/campus/photos/ (same
// filename = zero code change) and they show in the Explore gallery + Search.
// See public/campus/README.md.
//
//   node: node scripts/generate-campus-photos.mjs

import { mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const OUT_DIR = fileURLToPath(new URL('../public/campus/photos/', import.meta.url))

// Keep in sync with src/data/campus.ts (CATEGORY_META + CAMPUS_NODES + BUILDING_FOOTPRINTS).
const CATEGORY_COLORS = {
  gate: '#334155',
  admission: '#0d9488',
  academic: '#4f46e5',
  lab: '#0891b2',
  library: '#7c3aed',
  hostel: '#d97706',
  canteen: '#ea580c',
  admin: '#2563eb',
  auditorium: '#db2777',
  medical: '#dc2626',
  parking: '#64748b',
  reception: '#0891b2',
  departments: '#059669',
  cabins: '#9333ea',
}

const NODES = [
  { id: 'main-gate', name: 'Main Gate', cat: 'gate', w: 6.5, h: 4.6 },
  { id: 'parking', name: 'Parking', cat: 'parking', w: 12.2, h: 7.6 },
  { id: 'reception', name: 'Reception', cat: 'reception', w: 7.6, h: 6.2 },
  { id: 'admission', name: 'Admission Block', cat: 'admission', w: 9.6, h: 6.8 },
  { id: 'admin', name: 'Administration Office', cat: 'admin', w: 10.2, h: 7.8 },
  { id: 'auditorium', name: 'Auditorium', cat: 'auditorium', w: 13.8, h: 8.8 },
  { id: 'block-a', name: 'Academic Block A', cat: 'academic', w: 12.6, h: 8.2 },
  { id: 'block-b', name: 'Academic Block B', cat: 'academic', w: 12.6, h: 8.2 },
  { id: 'block-c', name: 'Academic Block C', cat: 'academic', w: 12.6, h: 8.2 },
  { id: 'departments', name: 'Department Offices', cat: 'departments', w: 8.6, h: 6.6 },
  { id: 'cabins', name: 'Faculty Cabins', cat: 'cabins', w: 6.8, h: 9.8 },
  { id: 'comp-lab', name: 'Computer Lab', cat: 'lab', w: 10.6, h: 7.6 },
  { id: 'mech-lab', name: 'Mechanical Lab', cat: 'lab', w: 10.6, h: 7.6 },
  { id: 'medical', name: 'Medical Room', cat: 'medical', w: 7.2, h: 6.2 },
  { id: 'library', name: 'Central Library', cat: 'library', w: 11.2, h: 9.2 },
  { id: 'canteen', name: 'Canteen', cat: 'canteen', w: 8.6, h: 6.8 },
  { id: 'boys-hostel', name: 'Boys Hostel', cat: 'hostel', w: 16.8, h: 7 },
  { id: 'girls-hostel', name: 'Girls Hostel', cat: 'hostel', w: 16.8, h: 7 },
]

// Per-variant visual treatment (index 0..2).
const VARIANTS = [
  { skyTop: '#dbe4ef', skyBot: '#eef3f8', lighten: [0.78, 0.52], litColor: null, litChance: 0.38, winFactor: 1, label: '1' },
  { skyTop: '#f0dfc8', skyBot: '#f9edda', lighten: [0.82, 0.56], litColor: '#f5a623', litChance: 0.85, winFactor: 0.82, label: '2' },
  { skyTop: '#c4d1e8', skyBot: '#dfe9f6', lighten: [0.62, 0.4], litColor: '#8ea6c4', litChance: 0.28, winFactor: 1.18, label: '3' },
]

function seeded(id) {
  let s = 0
  for (const ch of id) s = (s * 31 + ch.charCodeAt(0)) % 2147483647
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

function shade(hex, amt) {
  const n = parseInt(hex.slice(1), 16)
  const t = amt < 0 ? 0 : 255
  const p = Math.abs(amt)
  const mix = (v) => Math.round((t - v) * p + v)
  return `rgb(${mix((n >> 16) & 255)}, ${mix((n >> 8) & 255)}, ${mix(n & 255)})`
}

const W = 800
const H = 520
const MAX_FW = 560
const MAX_FH = 320
const BUILD_TOP = 150
const GROUND_Y = H - 42

mkdirSync(OUT_DIR, { recursive: true })

// clear previous single-photo placeholders (older <id>.svg naming)
for (const f of ['main-gate', 'parking', 'reception', 'admission', 'admin', 'auditorium', 'block-a', 'block-b', 'block-c', 'departments', 'cabins', 'comp-lab', 'mech-lab', 'medical', 'library', 'canteen', 'boys-hostel', 'girls-hostel']) {
  rmSync(`${OUT_DIR}${f}.svg`, { force: true })
}

let count = 0

for (const n of NODES) {
  const color = CATEGORY_COLORS[n.cat]
  const s = Math.min(MAX_FW / n.w, MAX_FH / n.h)
  const fw = n.w * s
  const fh = n.h * s
  const x = (W - fw) / 2
  const y = BUILD_TOP + (MAX_FH - fh)

  VARIANTS.forEach((v, vi) => {
    const rand = seeded(`${n.id}:${vi}`)
    const cols = Math.max(2, Math.round((fw / 68) * v.winFactor))
    const rows = Math.max(2, Math.round((fh / 78) * (2 - v.winFactor)))
    const gapX = 14
    const gapY = 12
    const winW = Math.max(20, (fw - gapX * (cols + 1)) / cols)
    const winH = Math.max(16, (fh - gapY * (rows + 1)) / rows)
    const doorW = Math.min(64, fw * 0.16)
    const doorH = Math.min(86, fh * 0.34)

    const windows = []
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const lit = rand() < v.litChance
        const fill = lit ? (v.litColor ?? color) : '#8b95a3'
        const wx = x + gapX + c * (winW + gapX)
        const wy = y + gapY + r * (winH + gapY)
        windows.push(
          `<rect x="${wx.toFixed(1)}" y="${wy.toFixed(1)}" width="${winW.toFixed(1)}" height="${winH.toFixed(1)}" rx="3" fill="${fill}" opacity="${lit ? 0.9 : 0.75}"/>`,
        )
      }
    }

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${v.skyTop}"/>
      <stop offset="1" stop-color="${v.skyBot}"/>
    </linearGradient>
    <linearGradient id="facade" x1="0" y1="0" x2="0.6" y2="1">
      <stop offset="0" stop-color="${shade(color, v.lighten[0])}"/>
      <stop offset="1" stop-color="${shade(color, v.lighten[1])}"/>
    </linearGradient>
    <filter id="blur" x="-40%" y="-40%" width="180%" height="180%">
      <feGaussianBlur stdDeviation="6"/>
    </filter>
  </defs>

  <rect width="${W}" height="${H}" fill="url(#sky)"/>
  <rect x="0" y="${GROUND_Y}" width="${W}" height="${H - GROUND_Y}" fill="#d7e2cf"/>

  <rect x="${x - 14}" y="${y + 12}" width="${fw + 28}" height="${fh + 26}" rx="10" fill="rgba(30,41,59,0.22)" filter="url(#blur)"/>

  <rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${fw.toFixed(1)}" height="${fh.toFixed(1)}" rx="8" fill="url(#facade)"/>
  <rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${fw.toFixed(1)}" height="10" rx="4" fill="rgba(255,255,255,0.55)"/>

  ${windows.join('\n  ')}

  <rect x="${(x + fw / 2 - doorW / 2).toFixed(1)}" y="${(y + fh - doorH).toFixed(1)}" width="${doorW.toFixed(1)}" height="${doorH.toFixed(1)}" rx="4" fill="rgba(30,41,59,0.55)"/>
  <rect x="${(x + fw / 2 - doorW / 2 + 5).toFixed(1)}" y="${(y + fh - doorH + 6).toFixed(1)}" width="${(doorW - 10).toFixed(1)}" height="${(doorH - 12).toFixed(1)}" rx="3" fill="rgba(255,255,255,0.28)"/>

  <rect x="${(W / 2 - 210).toFixed(1)}" y="${H - 72}" width="420" height="52" rx="12" fill="rgba(15,23,42,0.62)"/>
  <text x="${W / 2}" y="${H - 40}" text-anchor="middle" font-size="25" font-weight="700" font-family="system-ui, sans-serif" fill="#ffffff">${n.name}</text>

  <g transform="translate(${W - 128} 18)">
    <rect width="110" height="28" rx="14" fill="rgba(15,23,42,0.45)"/>
    <text x="55" y="19" text-anchor="middle" font-size="13" font-weight="600" font-family="ui-monospace, monospace" fill="#ffffff" opacity="0.85">SAMPLE ${v.label}/3</text>
  </g>
</svg>
`
    writeFileSync(`${OUT_DIR}${n.id}-${v.label}.svg`, svg)
    count++
  })
}

console.log(`Wrote ${count} photo placeholders (${NODES.length} buildings × 3) to public/campus/photos/`)
