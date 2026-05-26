import { useState, useEffect } from 'react'
import { spotifyFetch } from '../lib/spotify'

const RANGES = [
  { key: 'short_term', label: '4 semanas' },
  { key: 'medium_term', label: '6 meses' },
  { key: 'long_term', label: 'todo el tiempo' },
]

export default function TopArtistsPage() {
  const [range, setRange] = useState('short_term')
  const [artists, setArtists] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    spotifyFetch('/me/top/artists?limit=50&time_range=' + range).then(d => {
      setArtists(d?.items || [])
      setLoading(false)
    })
  }, [range])

  const allGenres = {}
  artists.forEach(a => a.genres?.forEach(g => { allGenres[g] = (allGenres[g] || 0) + 1 }))
  const topGenres = Object.entries(allGenres).sort((a,b) => b[1]-a[1]).slice(0, 12)
  const maxGenreCount = topGenres[0]?.[1] || 1

  return (
    <div>
      <div className="page-header">
        <h2>top_artists</h2>
        <p>// tus artistas mas escuchados</p>
      </div>

      <div className="tabs">
        {RANGES.map(r => (
          <button key={r.key} className={'tab' + (range === r.key ? ' active' : '')} onClick={() => setRange(r.key)}>
            {r.label}
          </button>
        ))}
      </div>

      {loading ? <div className="loading-text">cargando...</div> : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 16 }}>
          <div className="terminal">
            <div className="terminal-bar">
              <div className="terminal-dot red" /><div className="terminal-dot yellow" /><div className="terminal-dot green" />
              <span className="terminal-title">top_artists_{range}.json</span>
            </div>
            <div className="terminal-body">
              {artists.map((a, i) => (
                <div key={a.id} className="track-row">
                  <span className="track-num">{String(i+1).padStart(2,'0')}</span>
                  {a.images?.[0] && <img className="track-img" src={a.images[0].url} alt="" style={{ borderRadius: '50%' }} />}
                  <div className="track-info">
                    <div className="track-name">{a.name}</div>
                    <div className="track-artist">{a.genres?.slice(0,2).join(', ') || 'sin genero'}</div>
                  </div>
                  <div className="track-bar-wrap">
                    <div className="track-bar" style={{ width: Math.max(10, 100 - i * 2) + '%' }} />
                  </div>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--text-dim)', width: 50, textAlign: 'right' }}>
                    {(a.popularity || 0)}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="terminal">
            <div className="terminal-bar">
              <div className="terminal-dot red" /><div className="terminal-dot yellow" /><div className="terminal-dot green" />
              <span className="terminal-title">generos.json</span>
            </div>
            <div className="terminal-body">
              {topGenres.map(([genre, count]) => (
                <div key={genre} className="progress-row">
                  <span className="progress-label">{genre}</span>
                  <div className="progress-bar-wrap">
                    <div className="progress-bar" style={{ width: (count / maxGenreCount * 100) + '%' }} />
                  </div>
                  <span className="progress-pct">{count}x</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
