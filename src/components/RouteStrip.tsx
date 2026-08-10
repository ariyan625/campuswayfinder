import { Fragment, useEffect, useRef } from 'react'
import { ChevronRight } from 'lucide-react'
import { getNode } from '../data/campus'
import { BuildingPhoto } from './BuildingPhoto'
import type { CampusNode } from '../types'

// ── Route overview strip ─────────────────────────────────────────────────────
// Horizontal carousel showing the full path: start → waypoints → destination.
// Single row that scrolls: native touch swipe + scroll-snap, mouse drag, and
// wheel-to-horizontal. Each thumb is clickable (opens the building's photo
// gallery) — a drag suppresses the click that follows it.

interface RouteStripProps {
  nodeIds: string[]
  /** Called with a node when its thumbnail is clicked (opens the gallery). */
  onOpen: (node: CampusNode) => void
}

export function RouteStrip({ nodeIds, onOpen }: RouteStripProps) {
  const nodes = nodeIds.map(getNode).filter((n): n is CampusNode => Boolean(n))
  const scrollRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef({ x: 0, start: 0, moved: false })

  // wheel scrolls the strip horizontally when it overflows (native wheel is
  // passive in React, so attach a non-passive listener directly)
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const onWheel = (e: WheelEvent) => {
      if (el.scrollWidth <= el.clientWidth) return
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        e.preventDefault()
        el.scrollLeft += e.deltaY
      }
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [])

  // mouse drag-to-scroll (touch uses the browser's native horizontal scroll).
  // The moved flag is always cleared here so a stale drag never suppresses a
  // later tap (touch taps in particular must reset it too).
  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    dragRef.current.moved = false
    if (e.pointerType === 'touch') return
    const el = scrollRef.current
    if (!el) return
    const d = { x: e.clientX, start: el.scrollLeft, moved: false }
    dragRef.current = d
    const onMove = (ev: PointerEvent) => {
      const dx = ev.clientX - d.x
      if (Math.abs(dx) > 5) d.moved = true
      el.scrollLeft = d.start - dx
    }
    const onUp = () => {
      dragRef.current.moved = d.moved
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onUp)
      window.removeEventListener('blur', onBlur)
    }
    const onBlur = onUp // released outside the window → clean up listeners
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    window.addEventListener('pointercancel', onUp)
    window.addEventListener('blur', onBlur)
  }

  if (nodes.length === 0) return null

  return (
    <div
      ref={scrollRef}
      className="route-strip"
      aria-label="Route overview: start to destination"
      onPointerDown={onPointerDown}
    >
      {nodes.map((node, i) => (
        <Fragment key={node.id}>
          {i > 0 && <ChevronRight size={14} className="route-strip__arrow" aria-hidden="true" />}
          <button
            type="button"
            className="route-strip__item"
            onClick={(e) => {
              // suppress the click that trails a drag
              if (dragRef.current.moved) {
                e.preventDefault()
                return
              }
              onOpen(node)
            }}
            title={`Open ${node.name} photo gallery`}
            aria-label={`Open ${node.name} photo gallery`}
          >
            <BuildingPhoto node={node} variant="sm" />
            <span className="route-strip__name">{node.name}</span>
          </button>
        </Fragment>
      ))}
    </div>
  )
}
