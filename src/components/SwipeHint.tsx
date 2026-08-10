import { useCallback, useEffect, useState } from 'react'
import { MoveHorizontal } from 'lucide-react'
import { useLocalStorage } from '../lib/storage'

// ── Swipe hint ───────────────────────────────────────────────────────────────
// A small "Swipe to browse" chip shown once per browser (localStorage). It
// fades in over the gallery main image, auto-fades out after a few seconds,
// and dismisses early on the first pointer interaction anywhere.

const HINT_KEY = 'campuswayfinder:swipe-hint-seen'

export function SwipeHint() {
  // `seen` is already known on first render (localStorage-backed), so the hint
  // visibility can be derived from it instead of setting state in an effect
  const [seen, setSeen] = useLocalStorage(HINT_KEY, false)
  const [show, setShow] = useState(!seen)

  const dismiss = useCallback(() => {
    setSeen(true)
    setShow(false)
  }, [setSeen])

  // fade out after a few seconds even if untouched (the CSS handles the fade)
  useEffect(() => {
    if (!show) return
    const t = setTimeout(dismiss, 5000)
    return () => clearTimeout(t)
  }, [show, dismiss])

  // the first pointer interaction dismisses it early
  useEffect(() => {
    if (!show) return
    window.addEventListener('pointerdown', dismiss, { once: true })
    return () => window.removeEventListener('pointerdown', dismiss)
  }, [show, dismiss])

  if (!show) return null

  return (
    <div className="swipe-hint" role="status">
      <MoveHorizontal size={14} aria-hidden="true" />
      <span>Swipe to browse</span>
    </div>
  )
}
