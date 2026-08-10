import { useCallback, useRef, useState } from 'react'
import { AnimatePresence, MotionConfig, motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Expand } from 'lucide-react'
import { CATEGORY_META } from '../data/campus'
import { BuildingPhoto } from './BuildingPhoto'
import { PhotoLightbox } from './PhotoLightbox'
import { SwipeHint } from './SwipeHint'
import type { CampusNode } from '../types'

// ── Building photo gallery ───────────────────────────────────────────────────
// Main image with prev/next + counter, a drag-to-peek gesture (drag the photo
// to reveal the next one live, release to commit or spring back), a clickable
// thumbnail strip, and a full-screen lightbox (see <PhotoLightbox>). Falls
// back to the single-photo <BuildingPhoto> card when the building has no
// photos. The component is rendered keyed by node id so state resets between
// buildings.

// transition constants for main-image animations
const SLIDE = 40
const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]
const DRAG_THRESHOLD = 64

interface BuildingGalleryProps {
  node: CampusNode
}

export function BuildingGallery({ node }: BuildingGalleryProps) {
  const photos = (node.photos ?? []).filter(Boolean)
  const meta = CATEGORY_META[node.category]
  const len = photos.length
  const [index, setIndex] = useState(0)
  const [dir, setDir] = useState(1)
  const [drag, setDrag] = useState(0)
  const [dragging, setDragging] = useState(false)
  const [lightbox, setLightbox] = useState<number | null>(null)
  const [failed, setFailed] = useState<Set<number>>(new Set())
  const swipeRef = useRef({ x: 0, y: 0, active: false, moved: false })

  const gradient = `linear-gradient(135deg, ${meta.color}, ${meta.color}99)`
  const markFailed = useCallback((i: number) => setFailed((prev) => new Set(prev).add(i)), [])

  const open = (i: number) => setLightbox(((i % len) + len) % len)
  const close = () => setLightbox(null)
  const step = (d: 1 | -1) => {
    setDir(d)
    setIndex((i) => (i + d + len) % len)
  }

  // drag-to-peek on the main image: the current photo follows the pointer and
  // the target photo is revealed behind it; release past the threshold commits.
  const onMainPointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    swipeRef.current = { x: e.clientX, y: e.clientY, active: true, moved: false }
    e.currentTarget.setPointerCapture?.(e.pointerId)
    if (len > 1) setDragging(true)
  }
  const onMainPointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    const s = swipeRef.current
    if (!s.active) return
    const dx = e.clientX - s.x
    const dy = e.clientY - s.y
    if (Math.abs(dx) < 4 && Math.abs(dy) < 4) return
    s.moved = true
    // track horizontal-dominant drags only (vertical ones scroll the page)
    if (Math.abs(dx) > Math.abs(dy)) {
      const max = e.currentTarget.offsetWidth * 0.5
      setDrag(Math.max(-max, Math.min(max, dx)))
    }
  }
  const onMainPointerUp = (e: React.PointerEvent<HTMLButtonElement>) => {
    const s = swipeRef.current
    if (!s.active) return
    s.active = false
    const dx = e.clientX - s.x
    const dy = e.clientY - s.y
    setDragging(false)
    if (Math.abs(dx) > DRAG_THRESHOLD && Math.abs(dx) > Math.abs(dy) * 1.5) {
      setDrag(0)
      if (dx < 0) step(1)
      else step(-1)
    } else {
      setDrag(0) // springs back
    }
  }
  const onMainPointerCancel = () => {
    swipeRef.current.active = false
    setDragging(false)
    setDrag(0)
  }
  // a drag also produces a click — skip opening the lightbox in that case
  const onMainClick = () => {
    if (swipeRef.current.moved) return
    open(index)
  }

  if (len === 0) return <BuildingPhoto node={node} variant="card" />

  const transition = { duration: 0.28, ease: EASE }
  // while dragging, follow the pointer instantly; otherwise animate normally
  const dragTransition = dragging ? { duration: 0 } : transition
  const targetIndex = ((index + (drag < 0 ? 1 : -1)) % len + len) % len

  return (
    <MotionConfig reducedMotion="user">
      <div className="building-gallery">
        {/* main image */}
        <div className="building-gallery__main">
          {len > 1 && <SwipeHint />}
          <button
            type="button"
            className="building-gallery__main-img"
            onClick={onMainClick}
            onPointerDown={onMainPointerDown}
            onPointerMove={onMainPointerMove}
            onPointerUp={onMainPointerUp}
            onPointerCancel={onMainPointerCancel}
            aria-label={`Open ${node.name} photo ${index + 1} of ${len} in full screen`}
          >
            {/* peek layer: the target photo revealed behind the current one */}
            {dragging && drag !== 0 && len > 1 && (
              failed.has(targetIndex) ? (
                <span className="building-gallery__failed" style={{ background: gradient }} aria-hidden="true" />
              ) : (
                <img
                  className="building-gallery__peek"
                  src={photos[targetIndex]}
                  alt=""
                  aria-hidden="true"
                  draggable={false}
                />
              )
            )}
            <AnimatePresence initial={false}>
              {failed.has(index) ? (
                <motion.span
                  key={`failed-${index}`}
                  className="building-gallery__failed"
                  style={{ background: gradient }}
                  initial={{ opacity: 0, x: dir * SLIDE }}
                  animate={{ opacity: 1, x: dragging ? drag : 0 }}
                  // fade out in place so a drag-commit doesn't reverse direction
                  exit={{ opacity: 0 }}
                  transition={dragTransition}
                />
              ) : (
                <motion.img
                  key={index}
                  src={photos[index]}
                  alt={`${node.name} — photo ${index + 1} of ${len}`}
                  draggable={false}
                  onError={() => markFailed(index)}
                  initial={{ opacity: 0, x: dir * SLIDE }}
                  animate={{ opacity: 1, x: dragging ? drag : 0 }}
                  // fade out in place so a drag-commit doesn't reverse direction
                  exit={{ opacity: 0 }}
                  transition={dragTransition}
                />
              )}
            </AnimatePresence>
            <span className="building-gallery__zoom" aria-hidden="true">
              <Expand size={16} />
            </span>
          </button>
          {len > 1 && (
            <>
              <span className="building-gallery__count" aria-hidden="true">
                {index + 1} / {len}
              </span>
              <button
                type="button"
                className="building-gallery__nav building-gallery__nav--prev"
                onClick={(e) => {
                  e.stopPropagation()
                  step(-1)
                }}
                aria-label="Previous photo"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                type="button"
                className="building-gallery__nav building-gallery__nav--next"
                onClick={(e) => {
                  e.stopPropagation()
                  step(1)
                }}
                aria-label="Next photo"
              >
                <ChevronRight size={18} />
              </button>
            </>
          )}
        </div>

        {/* thumbnail strip */}
        {len > 1 && (
          <div className="building-gallery__thumbs">
            {photos.map((p, i) => (
              <button
                key={p}
                type="button"
                className={`building-gallery__thumb ${i === index ? 'is-active' : ''}`}
                onClick={() => {
                  setDir(i >= index ? 1 : -1)
                  setIndex(i)
                }}
                aria-label={`Show photo ${i + 1} of ${node.name}`}
                aria-current={i === index}
              >
                {failed.has(i) ? (
                  <span className="building-gallery__failed" style={{ background: gradient }} />
                ) : (
                  <img src={p} alt="" loading="lazy" onError={() => markFailed(i)} />
                )}
              </button>
            ))}
          </div>
        )}

        {/* lightbox */}
        {lightbox !== null && (
          <PhotoLightbox node={node} startIndex={lightbox} onClose={close} onIndexChange={setIndex} />
        )}
      </div>
    </MotionConfig>
  )
}
