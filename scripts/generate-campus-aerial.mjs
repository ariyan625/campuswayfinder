// ── Generate the sample aerial placeholder for the campus map ───────────────
// Creates public/campus/campus-aerial.svg — a stylised "satellite photo" stand-in
// for the real college aerial image. It is drawn from the SAME node/edge data as
// src/data/campus.ts (positions + footprints), so the interactive pins, rings and
// routes overlay it in the right places.
//
// When the real aerial photo is available, replace the SVG (or drop a JPG/PNG in
// public/campus/ and point CAMPUS_IMAGERY.aerialImageUrl at it). See
// public/campus/README.md for the full swap + pin-alignment guide.
//
//   node: node scripts/generate-campus-aerial.mjs

import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const W = 1200
const SCALE = W / 112 // maps the map's -6..106 viewBox onto the image square
const px = (x) => (x + 6) * SCALE
const py = (y) => (y + 6) * SCALE

// Keep in sync with src/data/campus.ts (CAMPUS_NODES + BUILDING_FOOTPRINTS).
const NODES = [
  { id: 'main-gate', x: 50, y: 92, cat: 'gate', w: 6.5, h: 4.6 },
  { id: 'parking', x: 85, y: 90, cat: 'parking', w: 12.2, h: 7.6 },
  { id: 'reception', x: 50, y: 82, cat: 'reception', w: 7.6, h: 6.2 },
  { id: 'admission', x: 28, y: 84, cat: 'admission', w: 9.6, h: 6.8 },
  { id: 'admin', x: 70, y: 82, cat: 'admin', w: 10.2, h: 7.8 },
  { id: 'auditorium', x: 90, y: 70, cat: 'auditorium', w: 13.8, h: 8.8 },
  { id: 'block-a', x: 28, y: 55, cat: 'academic', w: 12.6, h: 8.2 },
  { id: 'block-b', x: 50, y: 55, cat: 'academic', w: 12.6, h: 8.2 },
  { id: 'block-c', x: 72, y: 55, cat: 'academic', w: 12.6, h: 8.2 },
  { id: 'departments', x: 12, y: 60, cat: 'departments', w: 8.6, h: 6.6 },
  { id: 'cabins', x: 8, y: 30, cat: 'cabins', w: 6.8, h: 9.8 },
  { id: 'comp-lab', x: 28, y: 34, cat: 'lab', w: 10.6, h: 7.6 },
  { id: 'mech-lab', x: 50, y: 34, cat: 'lab', w: 10.6, h: 7.6 },
  { id: 'medical', x: 70, y: 34, cat: 'medical', w: 7.2, h: 6.2 },
  { id: 'library', x: 88, y: 28, cat: 'library', w: 11.2, h: 9.2 },
  { id: 'canteen', x: 50, y: 16, cat: 'canteen', w: 8.6, h: 6.8 },
  { id: 'boys-hostel', x: 22, y: 12, cat: 'hostel', w: 16.8, h: 7 },
  { id: 'girls-hostel', x: 62, y: 12, cat: 'hostel', w: 16.8, h: 7 },
]

// Keep in sync with src/data/campus.ts (CAMPUS_EDGES).
const EDGES = [
  ['main-gate', 'reception'],
  ['main-gate', 'admission'],
  ['main-gate', 'parking'],
  ['reception', 'admission'],
  ['reception', 'admin'],
  ['admission', 'departments'],
  ['admission', 'block-a'],
  ['admin', 'auditorium'],
  ['admin', 'block-c'],
  ['parking', 'block-c'],
  ['departments', 'block-a'],
  ['departments', 'cabins'],
  ['block-a', 'block-b'],
  ['block-b', 'block-c'],
  ['block-a', 'comp-lab'],
  ['block-b', 'mech-lab'],
  ['block-c', 'medical'],
  ['comp-lab', 'mech-lab'],
  ['comp-lab', 'cabins'],
  ['mech-lab', 'medical'],
  ['medical', 'library'],
  ['library', 'auditorium'],
  ['library', 'canteen'],
  ['comp-lab', 'canteen'],
  ['canteen', 'boys-hostel'],
  ['canteen', 'girls-hostel'],
  ['boys-hostel', 'girls-hostel'],
  ['library', 'girls-hostel'],
]

// Muted "roof tint" per category — hints of the real colours, satellite style.
const ROOF = {
  gate: '#cfd4da',
  reception: '#c3d8e8',
  admission: '#bfd8d4',
  admin: '#c6d4f0',
  academic: '#c9ccf0',
  lab: '#c3d8e8',
  library: '#d4ccf0',
  hostel: '#ecd9b8',
  canteen: '#eccdb8',
  auditorium: '#ecc6d8',
  medical: '#ecc6c6',
  parking: '#b0b6bf',
  departments: '#c2e2cc',
  cabins: '#ddc6ec',
}

const node = new Map(NODES.map((n) => [n.id, n]))

function seededRandom(seed) {
  let s = seed
  return () => {
    s = (s * 9301 + 49297) % 233280
    return s / 233280
  }
}

const TREE_FORBIDDEN = [
  { x: 60, y: 88, rx: 4.8, ry: 3.6 },
  { x: 79, y: 60.5, rx: 6.8, ry: 4.4 },
]

function buildTrees() {
  const rand = seededRandom(20260809)
  const trees = []
  for (let gx = 3.5; gx <= 100; gx += 5.2) {
    for (let gy = 3.5; gy <= 100; gy += 5.2) {
      const x = gx + (rand() - 0.5) * 2.8
      const y = gy + (rand() - 0.5) * 2.8
      const tooClose = NODES.some((n) => Math.hypot(n.x - x, n.y - y) < Math.max(n.w, n.h) / 2 + 1.4)
      if (tooClose) continue
      if (TREE_FORBIDDEN.some((e) => ((x - e.x) / e.rx) ** 2 + ((y - e.y) / e.ry) ** 2 <= 1)) continue
      if (trees.some((t) => Math.hypot(t.x - x, t.y - y) < 4.2)) continue
      trees.push({ x, y, r: 1.4 + rand() * 1.3 })
    }
  }
  return trees.slice(0, 44)
}

const roads = EDGES
  .filter(([a, b]) => a === 'main-gate' || b === 'main-gate')
  .map(([a, b]) => {
    const A = node.get(a)
    const B = node.get(b)
    return `<line x1="${px(A.x)}" y1="${py(A.y)}" x2="${px(B.x)}" y2="${py(B.y)}" stroke="#b0a692" stroke-width="42" stroke-linecap="round"/>`
  })
  .join('\n      ')

const walks = EDGES
  .filter(([a, b]) => a !== 'main-gate' && b !== 'main-gate')
  .map(([a, b]) => {
    const A = node.get(a)
    const B = node.get(b)
    return `<line x1="${px(A.x)}" y1="${py(A.y)}" x2="${px(B.x)}" y2="${py(B.y)}" stroke="#cdbfa3" stroke-width="30" stroke-linecap="round"/>`
  })
  .join('\n      ')

const trees = buildTrees()
  .map(
    (t) =>
      `<circle cx="${px(t.x) + 6}" cy="${py(t.y) + 8}" r="${t.r * SCALE}" fill="rgba(40,60,30,0.30)"/>
      <circle cx="${px(t.x)}" cy="${py(t.y)}" r="${t.r * SCALE}" fill="#5f9d55"/>
      <circle cx="${px(t.x) - t.r * SCALE * 0.25}" cy="${py(t.y) - t.r * SCALE * 0.25}" r="${t.r * SCALE * 0.55}" fill="#71ac64"/>`,
  )
  .join('\n    ')

function building(n) {
  const X = px(n.x)
  const Y = py(n.y)
  const w = n.w * SCALE
  const h = n.h * SCALE
  const rx = w * 0.12
  if (n.cat === 'parking') {
    const stalls = []
    for (let x = n.x - n.w / 2 + 1.6; x <= n.x + n.w / 2 - 1.6; x += 2.3) {
      stalls.push(
        `<line x1="${px(x)}" y1="${py(n.y - n.h / 2 + 1.4)}" x2="${px(x)}" y2="${py(n.y + n.h / 2 - 1.4)}" stroke="rgba(255,255,255,0.75)" stroke-width="2.4"/>`,
      )
    }
    return `<g>
      <rect x="${X - w / 2 + 14}" y="${Y - h / 2 + 20}" width="${w}" height="${h}" rx="${rx}" fill="rgba(30,40,50,0.30)"/>
      <rect x="${X - w / 2}" y="${Y - h / 2}" width="${w}" height="${h}" rx="${rx}" fill="#b0b6bf" stroke="#8d95a1" stroke-width="4"/>
      ${stalls.join('\n      ')}
    </g>`
  }
  return `<g>
    <rect x="${X - w / 2 + 16}" y="${Y - h / 2 + 22}" width="${w}" height="${h}" rx="${rx}" fill="rgba(30,40,50,0.30)"/>
    <rect x="${X - w / 2}" y="${Y - h / 2 + 11}" width="${w}" height="${h}" rx="${rx}" fill="#9aa0a8"/>
    <rect x="${X - w / 2}" y="${Y - h / 2}" width="${w}" height="${h}" rx="${rx}" fill="${ROOF[n.cat]}" stroke="#8b929b" stroke-width="4"/>
  </g>`
}

const buildings = NODES.map(building).join('\n    ')

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${W}" viewBox="0 0 ${W} ${W}">
  <defs>
    <linearGradient id="ground" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#d3e3c8"/>
      <stop offset="1" stop-color="#b9d2a8"/>
    </linearGradient>
    <radialGradient id="vig" cx="50%" cy="50%" r="75%">
      <stop offset="62%" stop-color="#000" stop-opacity="0"/>
      <stop offset="100%" stop-color="#000" stop-opacity="0.16"/>
    </radialGradient>
    <filter id="soft" x="-6%" y="-6%" width="112%" height="112%">
      <feGaussianBlur stdDeviation="1.1"/>
    </filter>
    <filter id="grain" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="7" stitchTiles="stitch" result="n"/>
      <feColorMatrix in="n" type="matrix" values="0 0 0 0 0.35  0 0 0 0 0.40  0 0 0 0 0.30  0.2 0.2 0.2 0 0"/>
    </filter>
  </defs>

  <rect width="${W}" height="${W}" fill="url(#ground)"/>
  <rect width="${W}" height="${W}" filter="url(#grain)" opacity="0.5"/>

  <g filter="url(#soft)">
    ${walks}
    ${roads}

    <!-- sports field -->
    <ellipse cx="${px(79)}" cy="${py(60.5)}" rx="${(5.7 * SCALE).toFixed(1)}" ry="${(3.4 * SCALE).toFixed(1)}" fill="#a9cf92" stroke="rgba(255,255,255,0.9)" stroke-width="5"/>
    <!-- pond -->
    <ellipse cx="${px(60)}" cy="${py(88)}" rx="${(3.7 * SCALE).toFixed(1)}" ry="${(2.6 * SCALE).toFixed(1)}" fill="#8ec5e8" stroke="rgba(255,255,255,0.85)" stroke-width="4"/>

    ${trees}

    ${buildings}
  </g>

  <rect width="${W}" height="${W}" fill="url(#vig)"/>

  <g transform="rotate(-16 600 600)" opacity="0.32">
    <text x="600" y="612" font-size="118" font-family="system-ui, -apple-system, sans-serif" font-weight="800" fill="#ffffff" stroke="#334155" stroke-width="4" text-anchor="middle" paint-order="stroke">SAMPLE AERIAL</text>
    <text x="600" y="742" font-size="64" font-family="system-ui, -apple-system, sans-serif" font-weight="700" fill="#ffffff" stroke="#334155" stroke-width="3" text-anchor="middle" paint-order="stroke">replace with your college photo</text>
  </g>

  <text x="1186" y="1182" text-anchor="end" font-size="28" font-family="ui-monospace, monospace" fill="#ffffff" opacity="0.75">public/campus/campus-aerial.svg</text>
</svg>
`

const outUrl = new URL('../public/campus/campus-aerial.svg', import.meta.url)
mkdirSync(dirname(fileURLToPath(outUrl)), { recursive: true })
writeFileSync(outUrl, svg)
console.log('Wrote public/campus/campus-aerial.svg')
