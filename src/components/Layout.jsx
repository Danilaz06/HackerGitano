import { useState, useEffect } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { spotifyFetch, logout } from '../lib/spotify'
import { LayoutDashboard, Music, Mic2, ListMusic, Users, LogOut } from 'lucide-react'

const NAV = [
  { path: '/dashboard', label: 'dashboard', icon: LayoutDashboard },
  { path: '/tracks', label: 'top_tracks', icon: Music },
  { path: '/artists', label: 'top_artists', icon: Mic2 },
  { path: '/playlists', label: 'playlists', icon: ListMusic },
  { path: '/friends', label: 'amigos', icon: Users },
]

export default function Layout() {
  const [me, setMe] = useState(null)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    spotifyFetch('/me').then(d => { if (d) setMe(d) })
  }, [])

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <h1>HACKEADOR<br />GITANO<br />ESPOTIFAI</h1>
          <div className="version">v1.0.0 // beta</div>
        </div>
        <nav className="sidebar-nav">
          {NAV.map(({ path, label, icon: Icon }) => (
            <button
              key={path}
              className={'nav-item' + (location.pathname === path ? ' active' : '')}
              onClick={() => navigate(path)}
            >
              <Icon /> {label}
            </button>
          ))}
        </nav>
        <div className="sidebar-user">
          {me && (
            <div className="user-chip">
              <div className="user-avatar">
                {me.images?.[0] ? <img src={me.images[0].url} alt="" /> : me.display_name?.[0]}
              </div>
              <div className="user-name">{me.display_name}</div>
            </div>
          )}
          <button className="nav-item" onClick={handleLogout} style={{ marginTop: 4 }}>
            <LogOut /> logout
          </button>
        </div>
      </aside>

      <main className="main-content">
        <Outlet />
      </main>

      <nav className="bottom-nav">
        {NAV.map(({ path, label, icon: Icon }) => (
          <button
            key={path}
            className={'bottom-nav-item' + (location.pathname === path ? ' active' : '')}
            onClick={() => navigate(path)}
          >
            <Icon size={20} />
            <span>{label.split('_')[0]}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}
