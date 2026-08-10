import { BrowserRouter, Navigate as RouterNavigate, Route, Routes, useLocation } from 'react-router-dom'
import { AppProvider, useApp } from './context/AppContext'
import { Layout } from './components/Layout'
import { Welcome } from './pages/Welcome'
import { RoleSelect } from './pages/RoleSelect'
import { Dashboard } from './pages/Dashboard'
import { Explore } from './pages/Explore'
import { Navigate as NavigatePage } from './pages/Navigate'
import { Timetable } from './pages/Timetable'
import { Announcements } from './pages/Announcements'
import { LostFound } from './pages/LostFound'
import { Events } from './pages/Events'
import { Emergency } from './pages/Emergency'
import { Search } from './pages/Search'
import { Services } from './pages/Services'
import { Profile } from './pages/Profile'

function RequireRole({ children }: { children: React.ReactNode }) {
  const { role } = useApp()
  if (!role) return <RouterNavigate to="/role" replace />
  return <>{children}</>
}

function NavigatePageRoute() {
  const location = useLocation()
  // Remount on query change so tapping a new “Navigate to Class” updates the
  // destination even when already on the /navigate screen.
  return <NavigatePage key={location.search} />
}

// Deployment base — '/campuswayfinder/' on GitHub Pages, '/' elsewhere. The
// router needs it as basename so routes resolve under the subpath.
const BASE = import.meta.env.BASE_URL.replace(/\/+$/, '')

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter basename={BASE}>
        <Routes>
          <Route path="/" element={<Welcome />} />
          <Route path="/role" element={<RoleSelect />} />
          <Route
            element={
              <RequireRole>
                <Layout />
              </RequireRole>
            }
          >
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/navigate" element={<NavigatePageRoute />} />
            <Route path="/timetable" element={<Timetable />} />
            <Route path="/announcements" element={<Announcements />} />
            <Route path="/lost-found" element={<LostFound />} />
            <Route path="/events" element={<Events />} />
            <Route path="/emergency" element={<Emergency />} />
            <Route path="/search" element={<Search />} />
            <Route path="/services" element={<Services />} />
            <Route path="/profile" element={<Profile />} />
          </Route>
          <Route path="*" element={<RouterNavigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  )
}
