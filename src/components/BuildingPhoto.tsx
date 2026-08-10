import { useState } from 'react'
import { Camera } from 'lucide-react'
import { CATEGORY_META } from '../data/campus'
import type { CampusNode } from '../types'

// ── Building photograph ──────────────────────────────────────────────────────
// Renders the first of a node's `photos` (public/campus/photos/<id>-<n>.*) with
// a category-coloured placeholder fallback when the photo is missing or fails
// to load. Use <BuildingGallery> for the full multi-photo gallery + lightbox.
//
//   variant="card"  — full-bleed header (single-photo fallback)
//   variant="thumb" — 64px thumbnail (Search results, etc.)
//   variant="sm"    — 42px thumbnail (route steps, small list rows)

interface BuildingPhotoProps {
  node: CampusNode
  variant?: 'card' | 'thumb' | 'sm'
}

export function BuildingPhoto({ node, variant = 'card' }: BuildingPhotoProps) {
  const [failed, setFailed] = useState(false)
  const meta = CATEGORY_META[node.category]
  const src = node.photos?.[0]
  const showImage = !failed && src
  const decorative = variant !== 'card'

  return (
    <div
      className={`building-photo building-photo--${variant}`}
      style={{ background: `linear-gradient(135deg, ${meta.color}, ${meta.color}99)` }}
      aria-hidden={decorative ? true : undefined}
    >
      {showImage ? (
        <img
          src={src}
          alt={decorative ? '' : node.name}
          loading="lazy"
          draggable={false}
          onError={() => setFailed(true)}
        />
      ) : (
        <div className="building-photo__fallback">
          <Camera size={variant === 'card' ? 26 : variant === 'sm' ? 14 : 16} />
          {variant === 'card' && <span>Photo coming soon</span>}
        </div>
      )}
    </div>
  )
}
