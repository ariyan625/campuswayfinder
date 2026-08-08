import { CAMPUS_EDGES, CAMPUS_NODES, getNode } from '../data/campus'
import type { RouteResult, RouteStep } from '../types'

// ── Shortest-path navigation (Dijkstra) ─────────────────────────────────────
// The campus graph is built from connected nodes + walkable edges. A standard
// Dijkstra algorithm computes the shortest route. A* can be dropped in later by
// supplying a heuristic; the graph model stays the same.

interface GraphNode {
  id: string
  x: number
  y: number
  edges: { to: string; distance: number; pathName: string }[]
}

function buildGraph(): Map<string, GraphNode> {
  const graph = new Map<string, GraphNode>()
  for (const n of CAMPUS_NODES) {
    graph.set(n.id, { id: n.id, x: n.x, y: n.y, edges: [] })
  }
  for (const e of CAMPUS_EDGES) {
    graph.get(e.from)?.edges.push({ to: e.to, distance: e.distance, pathName: e.pathName })
    graph.get(e.to)?.edges.push({ to: e.from, distance: e.distance, pathName: e.pathName })
  }
  return graph
}

const GRAPH = buildGraph()

function compassDirection(dx: number, dy: number): string {
  const angle = (Math.atan2(dy, dx) * 180) / Math.PI
  const dirs: [string, number][] = [
    ['East', -157.5],
    ['Northeast', -112.5],
    ['North', -67.5],
    ['Northwest', -22.5],
    ['West', 22.5],
    ['Southwest', 67.5],
    ['South', 112.5],
    ['Southeast', 157.5],
  ]
  for (const [name, start] of dirs) {
    if (angle >= start - 22.5 && angle < start + 22.5) return name
  }
  return 'East'
}

/** Compute the shortest route between two campus locations using Dijkstra. */
export function findShortestRoute(fromId: string, toId: string): RouteResult | null {
  if (fromId === toId) {
    return { nodeIds: [fromId], steps: [], distance: 0, minutes: 0 }
  }

  const start = GRAPH.get(fromId)
  const goal = GRAPH.get(toId)
  if (!start || !goal) return null

  const dist = new Map<string, number>()
  const prev = new Map<string, { node: string; pathName: string }>()
  const visited = new Set<string>()

  for (const node of GRAPH.keys()) dist.set(node, Infinity)
  dist.set(fromId, 0)

  // Simple O(V²) Dijkstra — fine for a small campus graph.
  while (visited.size < GRAPH.size) {
    let current: string | null = null
    let best = Infinity
    for (const [id, d] of dist) {
      if (!visited.has(id) && d < best) {
        best = d
        current = id
      }
    }
    if (current === null) break
    if (current === toId) break
    visited.add(current)

    for (const edge of GRAPH.get(current)!.edges) {
      if (visited.has(edge.to)) continue
      const alt = dist.get(current)! + edge.distance
      if (alt < dist.get(edge.to)!) {
        dist.set(edge.to, alt)
        prev.set(edge.to, { node: current, pathName: edge.pathName })
      }
    }
  }

  if (!prev.has(toId) && fromId !== toId) return null

  // Reconstruct path
  const nodeIds: string[] = []
  let cursor: string | null = toId
  while (cursor) {
    nodeIds.unshift(cursor)
    cursor = cursor === fromId ? null : prev.get(cursor)?.node ?? null
  }

  const steps: RouteStep[] = []
  for (let i = 0; i < nodeIds.length - 1; i++) {
    const a = getNode(nodeIds[i])!
    const b = getNode(nodeIds[i + 1])!
    const edge = GRAPH.get(nodeIds[i])!.edges.find((e) => e.to === nodeIds[i + 1])!
    steps.push({
      from: nodeIds[i],
      to: nodeIds[i + 1],
      distance: edge.distance,
      pathName: edge.pathName,
      direction: compassDirection(b.x - a.x, b.y - a.y),
    })
  }

  const distance = steps.reduce((sum, s) => sum + s.distance, 0)
  return { nodeIds, steps, distance, minutes: estimateWalkingTime(distance) }
}

/** Walking speed ≈ 4.8 km/h → 80 m/min. */
export function estimateWalkingTime(distanceMeters: number): number {
  return Math.max(1, Math.ceil(distanceMeters / 80))
}

export function formatDistance(meters: number): string {
  return meters >= 1000 ? `${(meters / 1000).toFixed(1)} km` : `${Math.round(meters)} m`
}

export function formatMinutes(min: number): string {
  if (min < 1) return 'Less than a minute'
  return min === 1 ? '1 minute' : `${min} minutes`
}
