import { useState, useEffect } from 'react'
import { spotifyFetch } from '../lib/spotify'

export default function DashboardPage() {
  const [me, setMe] = useState(null)
  const [topTracks, setTopTracks] = useState([])
  const [topArtists, setTopArtists] = useState([])
  const [recent, setRecent] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      spotifyFetch('/me'),
      spotifyFetch('/me/top/tracks?limit=5&time_range=short_term'),
      spotifyFetch('/me/top/artists?limit=5&time_range=short_term'),
      spotifyFetch('/me/player/recently-played?limit=5'),
    ]).then(([meData, tracks, artists, recentData]) => {
      setMe(meData)
      setTopTracks(tracks?.items || [])
      setTopArtists(artists?.items || [])
      setRecent(recentData?.items || [])
      setLoading(false)
    })
  }, [])

  if (loading) return <div className="loading-page" style={{ minHeight: 400 }}><div className="loading-text">cargando datos...</div></div>

  const genres = [...new Set(topArtists.flatMap(a => a.genres || []))].slice(0, 10)

  return (
    <div>
      <div className="page-header">
        <h2>dashboard</h2>
        <p>// bienvenido, {me?.display_name} | {me?.followers?.total} seguidores | {me?.product}</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">canciones escuchadas</div>
          <div className="stat-value">{recent.length}</div>
          <div className="stat-sub">ultimas 24h aprox</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">top artista</div>
          <div className="stat-value" style={{ fontSize: '1rem', marginTop: 4 }}>{topArtists[0]?.name || '---'}</div>
          <div className="stat-sub">ultimo mes</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">top cancion</div>
          <div className="stat-value" style={{ fontSize: '0.9rem', marginTop: 4 }}>{topTracks[0]?.name || '---'}</div>
          <div className="stat-sub">{topTracks[0]?.artists?.[0]?.name}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">generos</div>
          <div className="stat-value">{genres.length}</div>
          <div className="stat-sub">distintos este mes</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div className="terminal">
          <div className="terminal-bar">
            <div className="terminal-dot red" /><div className="terminal-dot yellow" /><div className="terminal-dot green" />
            <span className="terminal-title">top_tracks_short_term.json</span>
          </div>
          <div className="terminal-body">
            <div className="track-list">
              {topTracks.map((t, i) => (
                <div key={t.id} className="track-row">
                  <span className="track-num">{String(i+1).padStart(2,'0')}</span>
                  {t.album?.images?.[0] && <img className="track-img" src={t.album.images[0].url} alt="" />}
                  <div className="track-info">
                    <div className="track-name">{t.name}</div>
                    <div className="track-artist">{t.artists.map(a => a.name).join(', ')}</div>
                  </div>
                  <div className="track-bar-wrap">
                    <div className="track-bar" style={{ width: (100 - i * 15) + '%' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="terminal">
          <div className="terminal-bar">
            <div className="terminal-dot red" /><div className="terminal-dot yellow" /><div className="terminal-dot green" />
            <span className="terminal-title">recently_played.json</span>
          </div>
          <div className="terminal-body">
            <div className="track-list">
              {recent.map((item, i) => (
                <div key={i} className="track-row">
                  <span className="track-num">{String(i+1).padStart(2,'0')}</span>
                  {item.track?.album?.images?.[0] && <img className="track-img" src={item.track.album.images[0].url} alt="" />}
                  <div className="track-info">
                    <div className="track-name">{item.track?.name}</div>
                    <div className="track-artist">{item.track?.artists?.map(a => a.name).join(', ')}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {genres.length > 0 && (
        <div className="section" style={{ marginTop: 20 }}>
          <div className="section-title">generos_detectados</div>
          <div className="genre-grid">
            {genres.map(g => <span key={g} className="genre-chip">{g}</span>)}
          </div>
        </div>
      )}
    </div>
  )
}
