import { useEffect, useMemo, useRef, useState, useCallback } from 'react'
import { Minus, Plus, RotateCcw } from 'lucide-react'
import { CAMPUS_EDGES, CAMPUS_NODES, CATEGORY_META } from '../data/campus'
import type { CampusNode } from '../types'

// ── Interactive campus map (placeholder model) ───────────────────────────────
// This is a clean 2D stand-in for the final interactive campus. The component
// contract (nodes, edges, route, selection) is kept deliberately simple so the
// internals can later be swapped for an interactive 3D model (Three.js / React
// Three Fiber) without changing any page that uses <CampusMap>.

interface CampusMapProps {
  route?: string[] | null
  fromId?: string
  toId?: string
  selectedId?: string | null
  onSelect?: (id: string) => void
  height?: number
  highlightIds?: string[]
}

const BUILDING_W = 11
const BUILDING_H = 7.5

export function CampusMap({ route, fromId, toId, selectedId, onSelect, height = 360, highlightIds }: CampusMapProps) {
  const [view, setView] = useState({ x: 0, y: 0, scale: 1 })
  const dragRef = useRef<{ startX: number; startY: number; origX: number; origY: number } | null>(null)
  const svgRef = useRef<SVGSVGElement>(null)

  const routeSet = useMemo(() => new Set(route ?? []), [route])
  const highlightSet = useMemo(() => new Set(highlightIds ?? []), [highlightIds])

  const zoomBy = useCallback((factor: number) => {
    setView((v) => ({ ...v, scale: Math.min(4, Math.max(1, v.scale * factor)) }))
  }, [])

  const resetView = useCallback(() => setView({ x: 0, y: 0, scale: 1 }), [])

  // React attaches wheel listeners passively, which blocks preventDefault; attach
  // a non-passive listener so wheel-zoom doesn't also scroll the page.
  useEffect(() => {
    const el = svgRef.current
    if (!el) return
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      zoomBy(e.deltaY < 0 ? 1.15 : 0.87)
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [zoomBy])

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    dragRef.current = { startX: e.clientX, startY: e.clientY, origX: 0, origY: 0 }
  }, [])

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      const d = dragRef.current
      if (!d) return
      setView((v) => ({
        ...v,
        x: d.origX + (e.clientX - d.startX),
        y: d.origY + (e.clientY - d.startY),
      }))
    },
    [],
  )

  const endDrag = useCallback(() => {
    dragRef.current = null
  }, [])

  const nodeCenters = useMemo(() => {
    const m = new Map<string, { cx: number; cy: number }>()
    for (const n of CAMPUS_NODES) m.set(n.id, { cx: n.x, cy: n.y })
    return m
  }, [])

  const edgePairs = useMemo(
    () =>
      CAMPUS_EDGES.map((e) => {
        const a = nodeCenters.get(e.from)!
        const b = nodeCenters.get(e.to)!
        return { ...e, a, b }
      }),
    [nodeCenters],
  )

  return (
    <div className="campus-map" style={{ height }}>
      <svg
        ref={svgRef}
        viewBox="-6 -6 112 112"
        className="campus-map__svg"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerLeave={endDrag}
      >
        <g transform={`translate(${view.x} ${view.y}) scale(${view.scale})`}>
          {/* subtle ground */}
          <rect x="-6" y="-6" width="112" height="112" fill="var(--map-ground)" rx="6" />

          {/* edges */}
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
                strokeWidth={onRoute ? 1.1 : 0.45}
              />
            )
          })}

          {/* nodes */}
          {CAMPUS_NODES.map((n: CampusNode) => {
            const isSelected = n.id === selectedId
            const isStart = n.id === fromId
            const isEnd = n.id === toId
            const isRoute = routeSet.has(n.id)
            const isHighlighted = highlightSet.has(n.id)
            const meta = CATEGORY_META[n.category]

            return (
              <g
                key={n.id}
                role={onSelect ? 'button' : undefined}
                tabIndex={onSelect ? 0 : undefined}
                aria-label={onSelect ? `Select ${n.name}` : undefined}
                className={`map-node ${isSelected ? 'map-node--selected' : ''} ${isHighlighted ? 'map-node--hl' : ''}`}
                onClick={(e) => {
                  e.stopPropagation()
                  onSelect?.(n.id)
                }}
                onKeyDown={(e) => {
                  if (onSelect && (e.key === 'Enter' || e.key === ' ')) {
                    e.preventDefault()
                    onSelect(n.id)
                  }
                }}
                style={{ cursor: onSelect ? 'pointer' : 'default' }}
              >
                {isStart && <circle cx={n.x} cy={n.y} r={3.1} className="map-marker map-marker--start" />}
                {isEnd && <circle cx={n.x} cy={n.y} r={3.1} className="map-marker map-marker--end" />}
                <rect
                  x={n.x - BUILDING_W / 2}
                  y={n.y - BUILDING_H / 2}
                  width={BUILDING_W}
                  height={BUILDING_H}
                  rx="1.4"
                  fill={meta.color}
                  fillOpacity={isRoute ? 0.95 : 0.85}
                  className={isSelected || isRoute ? 'map-building map-building--active' : 'map-building'}
                />
                <text x={n.x} y={n.y + 0.6} textAnchor="middle" className="map-building__label">
                  {n.shortName ?? n.name}
                </text>
              </g>
            )
          })}

          {/* route overlay path */}
          {route && route.length > 1 && (
            <path
              d={route
                .map((id, i) => {
                  const c = nodeCenters.get(id)!
                  return `${i === 0 ? 'M' : 'L'}${c.cx} ${c.cy}`
                })
                .join(' ')}
              fill="none"
              className="map-route-path"
              strokeWidth={1}
            />
          )}
        </g>
      </svg>

      <div className="campus-map__controls">
        <button className="map-ctrl" onClick={() => zoomBy(1.3)} aria-label="Zoom in">
          <Plus size={16} />
        </button>
        <button className="map-ctrl" onClick={() => zoomBy(0.77)} aria-label="Zoom out">
          <Minus size={16} />
        </button>
        <button className="map-ctrl" onClick={resetView} aria-label="Reset view">
          <RotateCcw size={15} />
        </button>
      </div>
    </div>
  )
}
