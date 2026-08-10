import { useEffect, useMemo, useRef, useState, useCallback } from 'react'
import { Minus, Plus, RotateCcw, RotateCw } from 'lucide-react'
import { CAMPUS_EDGES, CAMPUS_NODES, CATEGORY_META, CAMPUS_IMAGERY, footprintFor } from '../data/campus'
import type { CampusNode } from '../types'
import { CampusScene, SceneDefs } from './CampusScene'

// ── Interactive campus map ───────────────────────────────────────────────────
// The primary *visual* layer is campus imagery — the generated aerial scene
// (or, later, the real college's satellite image via CAMPUS_IMAGERY.aerialImageUrl).
// On top of it sit the functional interactive layers: walkway guides, building
// pins with labels, start/end markers and the highlighted shortest route.
//
// Gestures: drag to pan (with inertia), wheel / pinch to zoom (anchored to the
// pointer or finger midpoint), two-finger rotate, and the on-screen controls.
//
// The component contract (nodes, edges, route, selection) is kept deliberately
// simple so the internals can later be swapped for an interactive 3D model
// (Three.js / React Three Fiber) without changing any page that uses <CampusMap>.

interface CampusMapProps {
  route?: string[] | null
  fromId?: string
  toId?: string
  selectedId?: string | null
  onSelect?: (id: string) => void
  height?: number
  highlightIds?: string[]
}

// ── View transform ───────────────────────────────────────────────────────────
// view = { x, y, scale, rotate } where the SVG group is transformed with
//   translate(cx + x, cy + y) rotate(rotate) scale(scale) translate(-cx, -cy)
// (cx, cy) = (50, 50) = centre of the -6..106 viewBox. All gesture math works in
// viewBox units; element pixels are converted at the boundary via a linear map.

const MIN_SCALE = 1
const MAX_SCALE = 4
const MAX_ROTATE = 90
const CENTER = 50
const EDGE = 112 // viewBox width/height (from -6 to 106)
const VB_MIN = -6

interface ViewState {
  x: number
  y: number
  scale: number
  rotate: number
}

function clampView(v: ViewState): ViewState {
  const scale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, v.scale))
  const rotate = Math.min(MAX_ROTATE, Math.max(-MAX_ROTATE, v.rotate))
  const limit = 56 * scale + 24 // keep at least part of the map on screen
  return {
    scale,
    rotate,
    x: Math.min(limit, Math.max(-limit, v.x)),
    y: Math.min(limit, Math.max(-limit, v.y)),
  }
}

function rotatePoint(x: number, y: number, deg: number) {
  const rad = (deg * Math.PI) / 180
  const cos = Math.cos(rad)
  const sin = Math.sin(rad)
  return { x: x * cos - y * sin, y: x * sin + y * cos }
}

/** On-screen position (viewBox units) → content point. */
function fromScreen(v: ViewState, sx: number, sy: number) {
  const r = rotatePoint(sx - CENTER - v.x, sy - CENTER - v.y, -v.rotate)
  return { x: CENTER + r.x / v.scale, y: CENTER + r.y / v.scale }
}

/** Translation that keeps `anchor` (content point) under `screen` (viewBox units). */
function panToAnchor(anchor: { x: number; y: number }, screen: { x: number; y: number }, scale: number, rotate: number) {
  const r = rotatePoint(anchor.x - CENTER, anchor.y - CENTER, rotate)
  return { x: screen.x - CENTER - r.x * scale, y: screen.y - CENTER - r.y * scale }
}

export function CampusMap({ route, fromId, toId, selectedId, onSelect, height = 360, highlightIds }: CampusMapProps) {
  const [view, setView] = useState<ViewState>({ x: 0, y: 0, scale: 1, rotate: 0 })
  const svgRef = useRef<SVGSVGElement>(null)
  const viewRef = useRef(view)
  const pointersRef = useRef(new Map<number, { x: number; y: number }>())
  const pinchRef = useRef<{ dist: number; angle: number; mid: { x: number; y: number }; view: ViewState } | null>(null)
  const panRef = useRef<{ startX: number; startY: number; lastX: number; lastY: number; moved: boolean } | null>(null)
  const velRef = useRef<{ t: number; x: number; y: number }[]>([])
  const inertiaRef = useRef<number | null>(null)
  const suppressClickRef = useRef(false)

  useEffect(() => {
    viewRef.current = view
  }, [view])

  const stopInertia = useCallback(() => {
    if (inertiaRef.current !== null) {
      cancelAnimationFrame(inertiaRef.current)
      inertiaRef.current = null
    }
  }, [])

  // stop any running inertia when the component unmounts
  useEffect(() => () => stopInertia(), [stopInertia])

  const zoomBy = useCallback(
    (factor: number) => {
      stopInertia()
      setView((prev) => {
        const scale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, prev.scale * factor))
        const anchor = fromScreen(prev, CENTER, CENTER)
        const { x, y } = panToAnchor(anchor, { x: CENTER, y: CENTER }, scale, prev.rotate)
        return clampView({ ...prev, scale, x, y })
      })
    },
    [stopInertia],
  )

  const rotateBy = useCallback(
    (deg: number) => {
      stopInertia()
      setView((prev) => clampView({ ...prev, rotate: prev.rotate + deg }))
    },
    [stopInertia],
  )

  const resetView = useCallback(() => {
    stopInertia()
    setView({ x: 0, y: 0, scale: 1, rotate: 0 })
  }, [stopInertia])

  const startInertia = useCallback(
    (vx: number, vy: number) => {
      stopInertia()
      // scale the flick velocity down so the glide feels natural
      let vxCur = vx * 0.55
      let vyCur = vy * 0.55
      let last = performance.now()
      const step = (now: number) => {
        const dt = Math.min(32, now - last)
        last = now
        setView((prev) => clampView({ ...prev, x: prev.x + vxCur * dt, y: prev.y + vyCur * dt }))
        const damp = Math.pow(0.92, dt / 16.7)
        vxCur *= damp
        vyCur *= damp
        if (Math.hypot(vxCur, vyCur) < 0.015) {
          inertiaRef.current = null
          return
        }
        inertiaRef.current = requestAnimationFrame(step)
      }
      inertiaRef.current = requestAnimationFrame(step)
    },
    [stopInertia],
  )

  // React attaches wheel listeners passively, which blocks preventDefault; attach
  // a non-passive listener so wheel-zoom doesn't also scroll the page.
  useEffect(() => {
    const el = svgRef.current
    if (!el) return
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      stopInertia()
      const rect = el.getBoundingClientRect()
      const cursor = {
        x: ((e.clientX - rect.left) / rect.width) * EDGE + VB_MIN,
        y: ((e.clientY - rect.top) / rect.height) * EDGE + VB_MIN,
      }
      setView((prev) => {
        const scale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, prev.scale * Math.exp(-e.deltaY * 0.0016)))
        const anchor = fromScreen(prev, cursor.x, cursor.y)
        const { x, y } = panToAnchor(anchor, cursor, scale, prev.rotate)
        return clampView({ ...prev, scale, x, y })
      })
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [stopInertia])

  const localPoint = useCallback((e: React.PointerEvent) => {
    const rect = svgRef.current!.getBoundingClientRect()
    return { x: e.clientX - rect.left, y: e.clientY - rect.top }
  }, [])

  const pinchMetrics = useCallback((a: { x: number; y: number }, b: { x: number; y: number }) => {
    return {
      dist: Math.hypot(a.x - b.x, a.y - b.y),
      angle: Math.atan2(b.y - a.y, b.x - a.x),
      mid: { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 },
    }
  }, [])

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return
      stopInertia()
      suppressClickRef.current = false
      const p = localPoint(e)
      pointersRef.current.set(e.pointerId, p)

      if (pointersRef.current.size === 1) {
        panRef.current = { startX: p.x, startY: p.y, lastX: p.x, lastY: p.y, moved: false }
        velRef.current = []
        // capture only background drags so taps on buildings keep firing onClick
        if (e.target === e.currentTarget) e.currentTarget.setPointerCapture(e.pointerId)
      } else if (pointersRef.current.size === 2) {
        const [a, b] = [...pointersRef.current.values()]
        pinchRef.current = { ...pinchMetrics(a, b), view: viewRef.current }
        panRef.current = null
        e.currentTarget.setPointerCapture(e.pointerId)
      }
    },
    [localPoint, pinchMetrics, stopInertia],
  )

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      const pointers = pointersRef.current
      if (!pointers.has(e.pointerId)) return
      const p = localPoint(e)
      pointers.set(e.pointerId, p)
      const rect = svgRef.current!.getBoundingClientRect()
      const k = EDGE / rect.width
      const vb = (px: number, py: number) => ({
        x: (px / rect.width) * EDGE + VB_MIN,
        y: (py / rect.height) * EDGE + VB_MIN,
      })

      if (pointers.size === 2 && pinchRef.current) {
        const [a, b] = [...pointers.values()]
        const cur = pinchMetrics(a, b)
        const start = pinchRef.current
        const scale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, start.view.scale * (cur.dist < 1 ? 1 : cur.dist / start.dist)))
        // unwrap the angle delta so crossing the ±180° boundary doesn't snap
        const delta = cur.angle - start.angle - Math.PI * 2 * Math.round((cur.angle - start.angle) / (Math.PI * 2))
        const rotate = Math.min(MAX_ROTATE, Math.max(-MAX_ROTATE, start.view.rotate + delta * (180 / Math.PI)))
        const startMid = vb(start.mid.x, start.mid.y)
        const anchor = fromScreen(start.view, startMid.x, startMid.y)
        const curMid = vb(cur.mid.x, cur.mid.y)
        const { x, y } = panToAnchor(anchor, curMid, scale, rotate)
        setView(clampView({ ...start.view, scale, rotate, x, y }))
        return
      }

      if (pointers.size === 1 && panRef.current) {
        const pan = panRef.current
        if (Math.hypot(p.x - pan.startX, p.y - pan.startY) > 5) {
          pan.moved = true
          suppressClickRef.current = true
        }
        setView((prev) => clampView({ ...prev, x: prev.x + (p.x - pan.lastX) * k, y: prev.y + (p.y - pan.lastY) * k }))
        pan.lastX = p.x
        pan.lastY = p.y
        const now = performance.now()
        velRef.current.push({ t: now, x: p.x, y: p.y })
        while (velRef.current.length > 2 && now - velRef.current[0].t > 150) velRef.current.shift()
      }
    },
    [localPoint, pinchMetrics],
  )

  const onPointerEnd = useCallback(
    (e: React.PointerEvent) => {
      const pointers = pointersRef.current
      if (!pointers.has(e.pointerId)) return
      pointers.delete(e.pointerId)
      const el = svgRef.current
      if (el?.hasPointerCapture?.(e.pointerId)) el.releasePointerCapture(e.pointerId)
      const rect = svgRef.current!.getBoundingClientRect()
      const k = EDGE / rect.width

      if (pointers.size === 1) {
        // continue panning with the remaining finger
        const [p] = [...pointers.values()]
        panRef.current = { startX: p.x, startY: p.y, lastX: p.x, lastY: p.y, moved: false }
        pinchRef.current = null
      } else if (pointers.size === 0) {
        pinchRef.current = null
        const pan = panRef.current
        panRef.current = null
        if (pan?.moved) {
          const vel = velRef.current
          if (vel.length >= 2) {
            const dt = (vel[vel.length - 1].t - vel[0].t) / 1000
            if (dt > 0.02) {
              const vx = (vel[vel.length - 1].x - vel[0].x) / dt // element px / s
              const vy = (vel[vel.length - 1].y - vel[0].y) / dt
              const reduceMotion = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
              if (Math.hypot(vx, vy) > 120 && !reduceMotion) startInertia((vx * k) / 1000, (vy * k) / 1000)
            }
          }
        }
        velRef.current = []
      }
    },
    [startInertia],
  )

  const routeSet = useMemo(() => new Set(route ?? []), [route])
  const highlightSet = useMemo(() => new Set(highlightIds ?? []), [highlightIds])

  const nodeGeo = useMemo(() => {
    const m = new Map<string, { cx: number; cy: number; w: number; h: number }>()
    for (const n of CAMPUS_NODES) {
      const { w, h } = footprintFor(n)
      m.set(n.id, { cx: n.x, cy: n.y, w, h })
    }
    return m
  }, [])

  const edgePairs = useMemo(
    () =>
      CAMPUS_EDGES.map((e) => {
        const a = nodeGeo.get(e.from)!
        const b = nodeGeo.get(e.to)!
        return { ...e, a: { cx: a.cx, cy: a.cy }, b: { cx: b.cx, cy: b.cy } }
      }),
    [nodeGeo],
  )

  const aerialImageUrl = CAMPUS_IMAGERY.aerialImageUrl

  return (
    <div className="campus-map" style={{ height }}>
      <svg
        ref={svgRef}
        viewBox="-6 -6 112 112"
        className="campus-map__svg"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerEnd}
        onPointerCancel={onPointerEnd}
        onPointerLeave={onPointerEnd}
      >
        <defs>
          <SceneDefs />
        </defs>
        <g transform={`translate(${view.x + CENTER} ${view.y + CENTER}) rotate(${view.rotate}) scale(${view.scale}) translate(${-CENTER} ${-CENTER})`}>
          {/* ── visual layer: campus imagery ── */}
          {aerialImageUrl ? (
            <image
              href={aerialImageUrl}
              x={-6}
              y={-6}
              width={112}
              height={112}
              preserveAspectRatio="xMidYMid slice"
              className="campus-map__imagery"
            />
          ) : (
            <CampusScene />
          )}

          {/* ── walkway guides ── */}
          {edgePairs.map((e) => {
            const onRoute =
              route && route.indexOf(e.from) !== -1 && route.indexOf(e.to) !== -1 && Math.abs(route.indexOf(e.from) - route.indexOf(e.to)) === 1
            return (
              <line
                key={`${e.from}-${e.to}`}
                x1={e.a.cx}
                y1={e.a.cy}
                x2={e.b.cx}
                y2={e.b.cy}
                className={onRoute ? 'map-edge map-edge--route' : 'map-edge'}
                strokeWidth={onRoute ? 1.1 : 0.4}
              />
            )
          })}

          {/* ── route overlay ── */}
          {route && route.length > 1 && (
            <path
              d={route
                .map((id, i) => {
                  const c = nodeGeo.get(id)!
                  return `${i === 0 ? 'M' : 'L'}${c.cx} ${c.cy}`
                })
                .join(' ')}
              fill="none"
              className="map-route-path"
              strokeWidth={1}
            />
          )}

          {/* ── interactive building layer ── */}
          {CAMPUS_NODES.map((n: CampusNode) => {
            const g = nodeGeo.get(n.id)!
            const isSelected = n.id === selectedId
            const isStart = n.id === fromId
            const isEnd = n.id === toId
            const isRoute = routeSet.has(n.id)
            const isHighlighted = highlightSet.has(n.id)
            const meta = CATEGORY_META[n.category]
            const label = n.shortName ?? n.name
            const pillW = Math.max(label.length * 1.55 + 3.2, 9)
            const pillY = n.y + g.h / 2 + 2.4

            return (
              <g
                key={n.id}
                role={onSelect ? 'button' : undefined}
                tabIndex={onSelect ? 0 : undefined}
                aria-label={onSelect ? `Select ${n.name}` : undefined}
                className={`map-node ${isSelected ? 'map-node--selected' : ''} ${isRoute ? 'map-node--route' : ''} ${isHighlighted ? 'map-node--hl' : ''}`}
                onClick={(e) => {
                  e.stopPropagation()
                  if (suppressClickRef.current) return
                  onSelect?.(n.id)
                }}
                onKeyDown={(e) => {
                  if (onSelect && (e.key === 'Enter' || e.key === ' ')) {
                    e.preventDefault()
                    onSelect(n.id)
                  }
                }}
                style={{ cursor: onSelect ? 'pointer' : 'default', ['--pin-color' as string]: meta.color }}
              >
                {/* invisible hit area over the building footprint */}
                <rect
                  x={g.cx - g.w / 2}
                  y={g.cy - g.h / 2}
                  width={g.w}
                  height={g.h}
                  rx={1.6}
                  className="map-node__hit"
                />
                {/* selection / route / highlight ring around the building */}
                <rect
                  x={g.cx - g.w / 2 - 0.9}
                  y={g.cy - g.h / 2 - 0.9}
                  width={g.w + 1.8}
                  height={g.h + 1.8}
                  rx={2.4}
                  className="map-node__ring"
                />
                {isStart && <circle cx={g.cx} cy={g.cy} r={2.7} className="map-marker map-marker--start" />}
                {isEnd && (
                  <>
                    <circle cx={g.cx} cy={g.cy} r={2.7} className="map-marker map-marker--end map-marker--ping" />
                    <circle cx={g.cx} cy={g.cy} r={2.7} className="map-marker map-marker--end" />
                  </>
                )}
                {/* label pin */}
                <g className="map-pin">
                  <rect x={g.cx - pillW / 2} y={pillY} width={pillW} height={3.4} rx={1.7} className="map-pin__bg" />
                  <text x={g.cx} y={pillY + 2.4} textAnchor="middle" className="map-pin__text">
                    {label}
                  </text>
                </g>
              </g>
            )
          })}
        </g>
      </svg>

      <div className="campus-map__controls">
        <button className="map-ctrl" onClick={() => zoomBy(1.3)} aria-label="Zoom in">
          <Plus size={16} />
        </button>
        <button className="map-ctrl" onClick={() => zoomBy(0.77)} aria-label="Zoom out">
          <Minus size={16} />
        </button>
        <button className="map-ctrl" onClick={() => rotateBy(15)} aria-label="Rotate map">
          <RotateCw size={15} />
        </button>
        <button className="map-ctrl" onClick={resetView} aria-label="Reset view">
          <RotateCcw size={15} />
        </button>
      </div>

      <div className="campus-map__hint" aria-hidden="true">
        Drag to pan · Scroll / pinch to zoom · Two-finger rotate
      </div>
    </div>
  )
}
