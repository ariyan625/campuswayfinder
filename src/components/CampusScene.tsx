import { useMemo } from 'react'
import { CAMPUS_EDGES, CAMPUS_NODES, CATEGORY_META, footprintFor, getNode } from '../data/campus'
import type { CampusNode } from '../types'

// ── Aerial campus scene (primary visual layer) ──────────────────────────────
// This renders a stylized aerial / satellite-style view of the campus — lawns,
// walkways, entrance drives, building roofs, trees, parking, a sports field and
// a pond — generated from the SAME node + edge data used by the navigation
// engine, so the scenery always lines up with the interactive layers that
// <CampusMap> draws on top.
//
// When the real college's satellite/aerial image is ready, set
// CAMPUS_IMAGERY.aerialImageUrl (see src/data/campus.ts). <CampusMap> will then
// render that image as the base layer instead of this generated scene — the
// building data, routing, timetable and services layers stay untouched.

/** Mix a hex colour towards white (positive) or black (negative). */
function shade(hex: string, amt: number): string {
  const n = parseInt(hex.slice(1), 16)
  const t = amt < 0 ? 0 : 255
  const p = Math.abs(amt)
  const mix = (v: number) => Math.round((t - v) * p + v)
  return `rgb(${mix((n >> 16) & 255)}, ${mix((n >> 8) & 255)}, ${mix(n & 255)})`
}

/** SVG defs (gradients/patterns) shared by every scene instance. */
export function SceneDefs() {
  return (
    <>
      <linearGradient id="campus-lawn" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#dbead2" />
        <stop offset="1" stopColor="#c1dcb2" />
      </linearGradient>
      <pattern id="campus-grass" width="2.6" height="2.6" patternUnits="userSpaceOnUse">
        <circle cx="1.3" cy="1.3" r="0.42" fill="rgba(52, 110, 58, 0.10)" />
      </pattern>
      <linearGradient id="scene-asphalt" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#bdb5a4" />
        <stop offset="1" stopColor="#a99f8c" />
      </linearGradient>
      <linearGradient id="scene-pond" x1="0" y1="0" x2="0.6" y2="1">
        <stop offset="0" stopColor="#9fd4ef" />
        <stop offset="1" stopColor="#5fa8d8" />
      </linearGradient>
      {Object.entries(CATEGORY_META).map(([cat, meta]) => (
        <linearGradient key={cat} id={`roof-${cat}`} x1="0" y1="0" x2="0.45" y2="1">
          <stop offset="0" stopColor={shade(meta.color, 0.32)} />
          <stop offset="1" stopColor={shade(meta.color, -0.1)} />
        </linearGradient>
      ))}
    </>
  )
}

// ── Trees ────────────────────────────────────────────────────────────────────

function seededRandom(seed: number) {
  let s = seed
  return () => {
    s = (s * 9301 + 49297) % 233280
    return s / 233280
  }
}

// Open-water / pitch areas trees must stay clear of (padded a little).
const TREE_FORBIDDEN = [
  { x: 60, y: 88, rx: 4.8, ry: 3.6 } as const, // pond
  { x: 79, y: 60.5, rx: 6.8, ry: 4.4 } as const, // sports field
]

/** Deterministic tree layout: scattered over open areas, clear of buildings. */
function buildTrees(): { x: number; y: number; r: number }[] {
  const rand = seededRandom(20260809)
  const trees: { x: number; y: number; r: number }[] = []
  for (let gx = 3.5; gx <= 100; gx += 5.2) {
    for (let gy = 3.5; gy <= 100; gy += 5.2) {
      const x = gx + (rand() - 0.5) * 2.8
      const y = gy + (rand() - 0.5) * 2.8
      // clear of every building footprint (with margin)
      const tooClose = CAMPUS_NODES.some((n) => {
        const { w, h } = footprintFor(n)
        return Math.hypot(n.x - x, n.y - y) < Math.max(w, h) / 2 + 1.4
      })
      if (tooClose) continue
      // clear of the pond and the sports field
      if (TREE_FORBIDDEN.some((e) => ((x - e.x) / e.rx) ** 2 + ((y - e.y) / e.ry) ** 2 <= 1)) continue
      if (trees.some((t) => Math.hypot(t.x - x, t.y - y) < 4.2)) continue
      trees.push({ x, y, r: 1.4 + rand() * 1.3 })
    }
  }
  return trees.slice(0, 44)
}

// ── Scene pieces ─────────────────────────────────────────────────────────────

function SceneRoads() {
  const { roadPath, walkPath } = useMemo(() => {
    const roads: string[] = []
    const walks: string[] = []
    for (const e of CAMPUS_EDGES) {
      const a = getNode(e.from)!
      const b = getNode(e.to)!
      const d = `M${a.x} ${a.y}L${b.x} ${b.y}`
      ;(e.from === 'main-gate' || e.to === 'main-gate' ? roads : walks).push(d)
    }
    return { roadPath: roads.join(' '), walkPath: walks.join(' ') }
  }, [])

  return (
    <g className="scene-roads">
      {/* walkways */}
      <path d={walkPath} stroke="#e8dcc1" strokeWidth={2.4} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d={walkPath} stroke="rgba(255, 255, 255, 0.8)" strokeWidth={0.26} strokeDasharray="1 1.5" fill="none" />
      {/* entrance drives */}
      <path d={roadPath} stroke="url(#scene-asphalt)" strokeWidth={3.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d={roadPath} stroke="rgba(255, 250, 230, 0.65)" strokeWidth={0.32} strokeDasharray="1.6 1.7" fill="none" />
    </g>
  )
}

function SceneField() {
  return (
    <g className="scene-field">
      <ellipse cx={79} cy={60.5} rx={5.7} ry={3.4} fill="#8fce7e" stroke="rgba(255, 255, 255, 0.9)" strokeWidth={0.42} />
      <ellipse cx={79} cy={60.5} rx={5} ry={2.8} fill="none" stroke="rgba(255, 255, 255, 0.65)" strokeWidth={0.2} />
      <circle cx={79} cy={60.5} r={0.75} fill="none" stroke="#fff" strokeWidth={0.26} />
    </g>
  )
}

function ScenePond() {
  return (
    <g className="scene-pond">
      <ellipse cx={60} cy={88} rx={3.7} ry={2.6} fill="url(#scene-pond)" stroke="rgba(255, 255, 255, 0.85)" strokeWidth={0.34} />
      <ellipse cx={60} cy={88} rx={2.9} ry={1.9} fill="none" stroke="rgba(255, 255, 255, 0.5)" strokeWidth={0.2} />
      <path d="M58.5 87.5q0.7 0.5 1.4 0M60.3 88.8q0.8 0.4 1.5 0" stroke="rgba(255, 255, 255, 0.75)" strokeWidth={0.18} fill="none" strokeLinecap="round" />
    </g>
  )
}

function SceneTree({ x, y, r }: { x: number; y: number; r: number }) {
  return (
    <g className="scene-tree">
      <circle cx={x + 0.5} cy={y + 0.7} r={r} fill="rgba(15, 23, 42, 0.14)" />
      <circle cx={x} cy={y} r={r} fill="#4c9a4e" />
      <circle cx={x - r * 0.28} cy={y - r * 0.28} r={r * 0.55} fill="#6ab568" />
    </g>
  )
}

function ParkingLot({ node }: { node: CampusNode }) {
  const { w, h } = footprintFor(node)
  const stalls: number[] = []
  for (let x = node.x - w / 2 + 1.6; x <= node.x + w / 2 - 1.6; x += 2.3) stalls.push(x)
  const cars = [
    { x: node.x - 3.4, y: node.y - 1.4, c: '#3b82f6' },
    { x: node.x - 1.1, y: node.y - 1.4, c: '#dc2626' },
    { x: node.x + 1.4, y: node.y - 1.4, c: '#f59e0b' },
  ]
  return (
    <g className="scene-parking">
      <rect x={node.x - w / 2 + 1.5} y={node.y - h / 2 + 2} width={w} height={h} rx={1.8} fill="rgba(15, 23, 42, 0.16)" />
      <rect x={node.x - w / 2} y={node.y - h / 2} width={w} height={h} rx={1.6} fill="#aab2bd" stroke="#8d95a1" strokeWidth={0.3} />
      {stalls.map((x, i) => (
        <line key={i} x1={x} y1={node.y - h / 2 + 1.4} x2={x} y2={node.y + h / 2 - 1.4} stroke="rgba(255, 255, 255, 0.7)" strokeWidth={0.18} />
      ))}
      <line x1={node.x - w / 2 + 1.2} y1={node.y} x2={node.x + w / 2 - 1.2} y2={node.y} stroke="rgba(255, 255, 255, 0.5)" strokeWidth={0.16} strokeDasharray="0.9 0.9" />
      {cars.map((c, i) => (
        <rect key={i} x={c.x} y={c.y} width={1.5} height={0.85} rx={0.3} fill={c.c} />
      ))}
    </g>
  )
}

function SceneBuildings({ showLabels }: { showLabels?: boolean }) {
  return (
    <g className="scene-buildings">
      {CAMPUS_NODES.map((n) => {
        if (n.category === 'parking') return <ParkingLot key={n.id} node={n} />
        const { w, h } = footprintFor(n)
        const color = CATEGORY_META[n.category].color
        return (
          <g key={n.id} className="scene-building">
            {/* ground shadow */}
            <rect x={n.x - w / 2 + 1.5} y={n.y - h / 2 + 2.1} width={w} height={h} rx={1.8} fill="rgba(15, 23, 42, 0.16)" />
            {/* extruded side */}
            <rect x={n.x - w / 2} y={n.y - h / 2 + 1} width={w} height={h} rx={1.5} fill={shade(color, -0.34)} />
            {/* roof */}
            <rect
              x={n.x - w / 2}
              y={n.y - h / 2}
              width={w}
              height={h}
              rx={1.5}
              fill={`url(#roof-${n.category})`}
              stroke={shade(color, -0.16)}
              strokeWidth={0.28}
            />
            {/* parapet + roof machinery */}
            {w >= 9 && (
              <g pointerEvents="none">
                <rect x={n.x - w / 2 + 1} y={n.y - h / 2 + 1} width={w - 2} height={h - 2} rx={1} fill="none" stroke="rgba(255, 255, 255, 0.45)" strokeWidth={0.2} />
                <rect x={n.x - w / 2 + 1.5} y={n.y - h / 2 + 1.5} width={1.7} height={1.3} rx={0.3} fill="rgba(255, 255, 255, 0.55)" />
                <rect x={n.x + w / 2 - 3} y={n.y + h / 2 - 2.7} width={1.6} height={1.2} rx={0.3} fill="rgba(15, 23, 42, 0.25)" />
              </g>
            )}
            {showLabels && (
              <text x={n.x} y={n.y + h / 2 + 2.3} textAnchor="middle" className="scene-building__label">
                {n.shortName ?? n.name}
              </text>
            )}
          </g>
        )
      })}
    </g>
  )
}

// ── Scene ────────────────────────────────────────────────────────────────────

export function CampusScene({ showLabels = false }: { showLabels?: boolean }) {
  const trees = useMemo(() => buildTrees(), [])

  return (
    <g className="campus-scene">
      {/* ground */}
      <rect x={-6} y={-6} width={112} height={112} fill="url(#campus-lawn)" />
      <rect x={-6} y={-6} width={112} height={112} fill="url(#campus-grass)" />
      <SceneRoads />
      <SceneField />
      <ScenePond />
      {trees.map((t, i) => (
        <SceneTree key={i} {...t} />
      ))}
      <SceneBuildings showLabels={showLabels} />
    </g>
  )
}
