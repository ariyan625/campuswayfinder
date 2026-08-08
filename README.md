# CampusWayfinder

**Explore the Campus. Find Your Way.**

A modern, mobile-first campus navigation prototype for students, faculty, parents and visitors.
Scan the QR code at the campus entrance → pick your role → get personalized directions with
shortest-route navigation, timetable integration and campus services.

Built with React 19 + Vite + TypeScript. All data is persisted in `localStorage` — no backend needed for the prototype.

---

## Getting started

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # type-check + production build
npm run lint
```

## What's included

| Module | Highlights |
|---|---|
| **Entry** | Welcome screen with QR-style entrance (Scan QR / Enter Campus) |
| **Roles** | Student, Faculty, Parent/Visitor — role drives dashboard & features |
| **Dashboards** | Greeting, date, current location, next class, quick actions |
| **Explore** | Interactive campus map — pan, zoom, select buildings, search |
| **Navigate** | Dijkstra shortest route, distance, walking time, turn-by-turn steps |
| **Timetable** | Add / edit / delete classes; auto-detects the next class; one-tap navigate |
| **Announcements** | Admin-style create / edit / delete, important flags |
| **Lost & Found** | Report lost/found items, image upload, search, filter, statuses |
| **Events** | Hackathons, workshops, seminars… with navigate-to-event |
| **Emergency** | Medical / security / help desk routes + emergency contacts, always-visible SOS |
| **Search** | Global search: buildings, classes, events, announcements, lost & found |
| **Profile** | Role-based editable profile |

## Architecture

```
src/
  data/campus.ts       ← campus graph: nodes (buildings) + edges (walkable paths)
  data/seeds.ts        ← sample timetable / announcements / events / lost & found
  lib/navigation.ts    ← Dijkstra shortest-path engine
  lib/format.ts        ← date/time helpers, next-class detection
  lib/storage.ts       ← localStorage persistence hook
  context/AppContext.tsx ← global state (role, profile, collections) + CRUD actions
  components/
    CampusMap.tsx      ← interactive map (contract kept 3D-swappable)
    RoutePanel.tsx     ← route summary + steps
    Layout.tsx         ← header + mobile bottom nav + desktop sidebar
    ui.tsx             ← design-system primitives
  pages/               ← one screen per route
```

**How the navigation works:** every building is a graph *node* with an (x, y) position; walkable
paths are graph *edges* with distances in meters. `findShortestRoute()` runs Dijkstra over this
graph and returns the ordered node path, per-segment distance/direction and total walking time
(≈80 m/min). A* can be swapped in later by adding a heuristic — the graph model stays identical.

**Swapping in real campus data:** edit `src/data/campus.ts` (nodes, names, edges, tags) and
`src/data/seeds.ts` (sample content). Nothing else needs to change.

## Future: interactive 3D campus model

The `CampusMap` component intentionally exposes a minimal contract:
`route`, `fromId`, `toId`, `selectedId`, `onSelect`, `highlightIds`. The internals are a 2D SVG
stand-in. To upgrade:

1. Capture college photographs → identify buildings.
2. Build 3D building models (Blender/RealityCapture → glTF/GLB).
3. Load with Three.js / React Three Fiber in a new component implementing the same props.
4. Keep the existing graph (`campus.ts`) as the navigation layer — route overlays, selection and
   building info cards plug into the 3D scene unchanged.

## Prototype notes

- Placeholder campus data mirrors a typical college (gates, blocks A–C, labs, library, hostels,
  canteen, admin, auditorium, medical room, parking).
- Data resets are available in **Profile → Reset Demo Data**.
- Designed mobile-first; desktop gets a fixed sidebar and denser grids.
