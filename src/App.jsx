import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { isLoggedIn } from './lib/spotify'
import LoginPage from './pages/LoginPage'
import CallbackPage from './pages/CallbackPage'
import Layout from './components/Layout'
import DashboardPage from './pages/DashboardPage'
import TopTracksPage from './pages/TopTracksPage'
import TopArtistsPage from './pages/TopArtistsPage'
import PlaylistsPage from './pages/PlaylistsPage'
import FriendsPage from './pages/FriendsPage'

function Protected({ children }) {
  if (!isLoggedIn()) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/callback" element={<CallbackPage />} />
        <Route path="/" element={<Protected><Layout /></Protected>}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="tracks" element={<TopTracksPage />} />
          <Route path="artists" element={<TopArtistsPage />} />
          <Route path="playlists" element={<PlaylistsPage />} />
          <Route path="friends" element={<FriendsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
