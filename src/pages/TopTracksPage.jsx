import { useState, useEffect } from 'react'
import { spotifyFetch } from '../lib/spotify'

const RANGES = [
  { key: 'short_term', label: '4 semanas' },
  { key: 'medium_term', label: '6 meses' },
  { key: 'long_term', label: 'todo el tiempo' },
]

export default function TopTracksPage() {
  const [range, setRange] = useState('short_term')
  const [tracks, setTracks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    spotifyFetch('/me/top/tracks?limit=50&time_range=' + range).then(d => {
      setTracks(d?.items || [])
      setLoading(false)
    })
  }, [range])

  return (
    <div>
      <div className="page-header">
        <h2>top_tracks</h2>
        <p>// tus canciones mas escuchadas</p>
      </div>

      <div className="tabs">
        {RANGES.map(r => (
          <button key={r.key} className={'tab' + (range === r.key ? ' active' : '')} onClick={() => setRange(r.key)}>
            {r.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="loading-text">cargando...</div>
      ) : (
        <div className="terminal">
          <div className="terminal-bar">
            <div className="terminal-dot red" /><div className="terminal-dot yellow" /><div className="terminal-dot green" />
            <span className="terminal-title">top_tracks_{range}.json // {tracks.length} resultados</span>
          </div>
          <div className="terminal-body">
            <div className="track-list">
              {tracks.map((t, i) => (
                <div key={t.id} className="track-row">
                  <span className="track-num">{String(i+1).padStart(2,'0')}</span>
                  {t.album?.images?.[0] && <img className="track-img" src={t.album.images[0].url} alt="" />}
                  <div className="track-info">
                    <div className="track-name">{t.name}</div>
                    <div className="track-artist">{t.artists.map(a => a.name).join(', ')} // {t.album?.name}</div>
                  </div>
                  <div className="track-bar-wrap">
                    <div className="track-bar" style={{ width: Math.max(10, 100 - i * 2) + '%' }} />
                  </div>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--text-dim)', width: 40, textAlign: 'right' }}>
                    {Math.floor(t.duration_ms / 60000)}:{String(Math.floor((t.duration_ms % 60000) / 1000)).padStart(2,'0')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
