import { Footprints, Flag, MapPin, Navigation } from 'lucide-react'
import { getNode } from '../data/campus'
import { formatDistance, formatMinutes } from '../lib/navigation'
import type { RouteResult } from '../types'
import { Button } from './ui'

interface RoutePanelProps {
  route: RouteResult | null
  fromLabel?: string
  toLabel?: string
  onNavigate?: () => void
  navigateLabel?: string
}

export function RoutePanel({ route, fromLabel, toLabel, onNavigate, navigateLabel = 'Start Walking' }: RoutePanelProps) {
  if (!route) return null

  return (
    <div className="route-panel">
      <div className="route-summary">
        <div className="route-summary__ends">
          <span className="route-end route-end--start">
            <MapPin size={14} /> {fromLabel ?? getNode(route.nodeIds[0])?.name}
          </span>
          <span className="route-summary__arrow">→</span>
          <span className="route-end route-end--finish">
            <Flag size={14} /> {toLabel ?? getNode(route.nodeIds[route.nodeIds.length - 1])?.name}
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
            <span>{fromLabel ?? getNode(route.nodeIds[0])?.name}</span>
          </div>
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
              <Footprints size={16} className="route-step__icon" />
            </li>
          )
        })}
        <li className="route-step route-step--finish">
          <span className="route-step__dot" />
          <div className="route-step__body">
            <strong>Destination reached</strong>
            <span>{toLabel ?? getNode(route.nodeIds[route.nodeIds.length - 1])?.name}</span>
          </div>
        </li>
      </ol>
    </div>
  )
}
