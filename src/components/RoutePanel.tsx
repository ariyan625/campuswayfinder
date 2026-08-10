import { useState } from 'react'
import { Flag, MapPin, Navigation } from 'lucide-react'
import { getNode } from '../data/campus'
import { formatDistance, formatMinutes } from '../lib/navigation'
import type { CampusNode, RouteResult } from '../types'
import { BuildingPhoto } from './BuildingPhoto'
import { PhotoLightbox } from './PhotoLightbox'
import { RouteStrip } from './RouteStrip'
import { Button } from './ui'

interface RoutePanelProps {
  route: RouteResult | null
  fromLabel?: string
  toLabel?: string
  onNavigate?: () => void
  navigateLabel?: string
}

export function RoutePanel({ route, fromLabel, toLabel, onNavigate, navigateLabel = 'Start Walking' }: RoutePanelProps) {
  const [lightbox, setLightbox] = useState<{ node: CampusNode; index: number } | null>(null)

  if (!route) return null

  const fromNode = getNode(route.nodeIds[0])
  const toNode = getNode(route.nodeIds[route.nodeIds.length - 1])
  const openGallery = (node: CampusNode, index: number) => setLightbox({ node, index })

  return (
    <div className="route-panel">
      {/* horizontal route overview: start → waypoints → destination */}
      <RouteStrip nodeIds={route.nodeIds} onOpen={(node) => openGallery(node, 0)} />

      <div className="route-summary">
        <div className="route-summary__ends">
          <span className="route-end route-end--start">
            <MapPin size={14} /> {fromLabel ?? fromNode?.name}
          </span>
          <span className="route-summary__arrow">→</span>
          <span className="route-end route-end--finish">
            <Flag size={14} /> {toLabel ?? toNode?.name}
          </span>
        </div>
        <div className="route-summary__stats">
          <div className="stat">
            <strong>{formatDistance(route.distance)}</strong>
            <span>Distance</span>
          </div>
          <div className="stat">
            <strong>{formatMinutes(route.minutes)}</strong>
            <span>Walking time</span>
          </div>
          <div className="stat">
            <strong>{route.steps.length}</strong>
            <span>Route steps</span>
          </div>
        </div>
        {onNavigate && (
          <Button className="route-summary__cta" onClick={onNavigate} icon={<Navigation size={16} />}>
            {navigateLabel}
          </Button>
        )}
      </div>

      <ol className="route-steps">
        <li className="route-step route-step--origin">
          <span className="route-step__dot" />
          <div className="route-step__body">
            <strong>You are here</strong>
            <span>{fromLabel ?? fromNode?.name}</span>
          </div>
          {fromNode && (
            <button
              type="button"
              className="route-step__photo"
              onClick={() => openGallery(fromNode, 0)}
              aria-label={`Open ${fromNode.name} photo gallery`}
            >
              <BuildingPhoto node={fromNode} variant="sm" />
            </button>
          )}
        </li>
        {route.steps.map((s, i) => {
          const node = getNode(s.to)
          return (
            <li key={i} className="route-step">
              <span className="route-step__dot" />
              <div className="route-step__body">
                <strong>
                  Walk {formatDistance(s.distance)} {s.direction}
                </strong>
                <span>
                  along {s.pathName} → {node?.name}
                </span>
              </div>
              {node && (
                <button
                  type="button"
                  className="route-step__photo"
                  onClick={() => openGallery(node, 0)}
                  aria-label={`Open ${node.name} photo gallery`}
                >
                  <BuildingPhoto node={node} variant="sm" />
                </button>
              )}
            </li>
          )
        })}
        <li className="route-step route-step--finish">
          <span className="route-step__dot" />
          <div className="route-step__body">
            <strong>Destination reached</strong>
            <span>{toLabel ?? toNode?.name}</span>
          </div>
          {toNode && (
            <button
              type="button"
              className="route-step__photo"
              onClick={() => openGallery(toNode, 0)}
              aria-label={`Open ${toNode.name} photo gallery`}
            >
              <BuildingPhoto node={toNode} variant="sm" />
            </button>
          )}
        </li>
      </ol>

      {lightbox && (
        <PhotoLightbox node={lightbox.node} startIndex={lightbox.index} onClose={() => setLightbox(null)} />
      )}
    </div>
  )
}
