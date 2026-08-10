import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, MotionConfig, motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { CATEGORY_META } from '../data/campus'
import type { CampusNode } from '../types'

// ── Photo lightbox ───────────────────────────────────────────────────────────
// Full-screen photo viewer shared by <BuildingGallery> and route-step
// thumbnails. Keyboard: Esc closes, ←/→ navigates, Tab is trapped. Touch:
// a horizontal swipe navigates photos. Photos slide + crossfade in the
// direction of travel (wrap-aware). Focus returns to the opener on close.

// slide distance and easing used for photo transitions
const SLIDE = 50
const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]

interface PhotoLightboxProps {
  node: CampusNode
  startIndex?: number
  onClose: () => void
  /** Optional: report the active index so callers can keep state in sync. */
  onIndexChange?: (i: number) => void
}

export function PhotoLightbox({ node, startIndex = 0, onClose, onIndexChange }: PhotoLightboxProps) {
  const photos = (node.photos ?? []).filter(Boolean)
  const meta = CATEGORY_META[node.category]
  const len = photos.length
  const safeLen = Math.max(len, 1)
  const initialIndex = ((startIndex % safeLen) + safeLen) % safeLen

  const [index, setIndex] = useState(initialIndex)
  const [dir, setDir] = useState(1)
  const [failed, setFailed] = useState<Set<number>>(new Set())
  const closeRef = useRef<HTMLButtonElement>(null)
  const boxRef = useRef<HTMLDivElement>(null)
  const swipeRef = useRef({ x: 0, y: 0, active: false, moved: false })
  const indexRef = useRef(initialIndex)

  const gradient = `linear-gradient(135deg, ${meta.color}, ${meta.color}99)`
  const markFailed = useCallback((i: number) => setFailed((prev) => new Set(prev).add(i)), [])

  const goTo = useCallback(
    (i: number) => {
      const next = ((i % safeLen) + safeLen) % safeLen
      // wrap-aware travel direction (e.g. last → first counts as forward)
      let raw = next - indexRef.current
      if (raw > safeLen / 2) raw -= safeLen
      if (raw < -safeLen / 2) raw += safeLen
      setDir(raw >= 0 ? 1 : -1)
      indexRef.current = next
      setIndex(next)
      onIndexChange?.(next)
    },
    [safeLen, onIndexChange],
  )

  // mount once: capture the opener, lock body scroll, focus the close button
  useEffect(() => {
    if (len === 0) return
    const opener = document.activeElement as HTMLElement | null
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()
    return () => {
      document.body.style.overflow = ''
      opener?.focus()
    }
  }, [len])

  // keyboard navigation (re-registered when the index changes)
  useEffect(() => {
    if (len === 0) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      else if (e.key === 'ArrowRight') goTo(index + 1)
      else if (e.key === 'ArrowLeft') goTo(index - 1)
      else if (e.key === 'Tab') {
        // simple focus trap within the dialog
        const focusables = boxRef.current?.querySelectorAll<HTMLElement>('button')
        if (!focusables || focusables.length === 0) {
          e.preventDefault()
          return
        }
        const first = focusables[0]
        const last = focusables[focusables.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [index, goTo, onClose, len])

  if (len === 0) return null

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    swipeRef.current = { x: e.clientX, y: e.clientY, active: true, moved: false }
  }
  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const s = swipeRef.current
    if (!s.active) return
    s.active = false
    const dx = e.clientX - s.x
    const dy = e.clientY - s.y
    // horizontal swipe past the threshold, more horizontal than vertical
    if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      s.moved = true
      if (dx < 0) goTo(index + 1)
      else goTo(index - 1)
    }
  }
  const onPointerCancel = () => {
    swipeRef.current.active = false
  }
  // don't close when the backdrop click is the tail of a swipe
  const onBackdropClick = () => {
    if (!swipeRef.current.moved) onClose()
  }

  const transition = { duration: 0.28, ease: EASE }

  return (
    <MotionConfig reducedMotion="user">
      <div
        ref={boxRef}
        className="gallery-lightbox"
        role="dialog"
        aria-modal="true"
        aria-label={`${node.name} — photo viewer`}
        onClick={onBackdropClick}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerCancel}
      >
        <button ref={closeRef} type="button" className="gallery-lightbox__close" onClick={onClose} aria-label="Close photo viewer">
          <X size={22} />
        </button>
        {len > 1 && (
          <>
            <button
              type="button"
              className="gallery-lightbox__nav gallery-lightbox__nav--prev"
              onClick={(e) => {
                e.stopPropagation()
                goTo(index - 1)
              }}
              aria-label="Previous photo"
            >
              <ChevronLeft size={28} />
            </button>
            <button
              type="button"
              className="gallery-lightbox__nav gallery-lightbox__nav--next"
              onClick={(e) => {
                e.stopPropagation()
                goTo(index + 1)
              }}
              aria-label="Next photo"
            >
              <ChevronRight size={28} />
            </button>
          </>
        )}
        <figure className="gallery-lightbox__figure" onClick={(e) => e.stopPropagation()}>
          <div className="gallery-lightbox__stage">
            <AnimatePresence initial={false}>
              {failed.has(index) ? (
                <motion.div
                  key={`failed-${index}`}
                  className="gallery-lightbox__failed"
                  style={{ background: gradient }}
                  initial={{ opacity: 0, x: dir * SLIDE }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: dir * -SLIDE }}
                  transition={transition}
                >
                  Photo unavailable
                </motion.div>
              ) : (
                <motion.img
                  key={index}
                  src={photos[index]}
                  alt={`${node.name} — photo ${index + 1} of ${len}`}
                  draggable={false}
                  onError={() => markFailed(index)}
                  initial={{ opacity: 0, x: dir * SLIDE }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: dir * -SLIDE }}
                  transition={transition}
                />
              )}
            </AnimatePresence>
          </div>
          <figcaption className="gallery-lightbox__caption">
            {node.name} · {index + 1} / {len}
          </figcaption>
        </figure>
      </div>
    </MotionConfig>
  )
}
