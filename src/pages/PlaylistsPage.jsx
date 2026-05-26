import { useState, useEffect } from 'react'
import { spotifyFetch, spotifyPost } from '../lib/spotify'

export default function PlaylistsPage() {
  const [playlists, setPlaylists] = useState([])
  const [me, setMe] = useState(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [genType, setGenType] = useState('short_term')
  const [genName, setGenName] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    Promise.all([
      spotifyFetch('/me'),
      spotifyFetch('/me/playlists?limit=50'),
    ]).then(([meData, plData]) => {
      setMe(meData)
      setPlaylists(plData?.items || [])
      setLoading(false)
    })
  }, [])

  async function generatePlaylist() {
    if (!me) return
    setGenerating(true); setSuccess('')
    const name = genName || 'HGE // auto-' + new Date().toLocaleDateString('es-ES')

    // Get top tracks
    const tracks = await spotifyFetch('/me/top/tracks?limit=30&time_range=' + genType)
    if (!tracks?.items?.length) { setGenerating(false); return }

    // Create playlist
    const playlist = await spotifyPost('/users/' + me.id + '/playlists', {
      name,
      description: 'Generada por HackeadorGitanoEspotifai // ' + new Date().toLocaleDateString(),
      public: true
    })

    if (playlist?.id) {
      // Add tracks
      await spotifyPost('/playlists/' + playlist.id + '/tracks', {
        uris: tracks.items.map(t => t.uri)
      })
      setSuccess('Playlist "' + name + '" creada con ' + tracks.items.length + ' canciones')
      // Refresh list
      const updated = await spotifyFetch('/me/playlists?limit=50')
      setPlaylists(updated?.items || [])
    }
    setGenerating(false)
  }

  return (
    <div>
      <div className="page-header">
        <h2>playlists</h2>
        <p>// tus playlists + generador automatico</p>
      </div>

      <div className="terminal" style={{ marginBottom: 20 }}>
        <div className="terminal-bar">
          <div className="terminal-dot red" /><div className="terminal-dot yellow" /><div className="terminal-dot green" />
          <span className="terminal-title">playlist_generator.sh</span>
        </div>
        <div className="terminal-body">
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: 16 }}>
            $ ./generate_playlist --mode auto
          </div>
          {success && (
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--green)', background: 'rgba(0,255,100,0.05)', border: '1px solid var(--border)', borderRadius: 4, padding: '8px 12px', marginBottom: 16 }}>
              ✓ {success}
            </div>
          )}
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--text-dim)', marginBottom: 6 }}>--periodo</div>
              <select
                value={genType}
                onChange={e => setGenType(e.target.value)}
                style={{ background: 'var(--bg3)', border: '1px solid var(--border)', color: 'var(--text)', fontFamily: 'var(--font-mono)', fontSize: '0.78rem', padding: '7px 12px', borderRadius: 4 }}
              >
                <option value="short_term">ultimas 4 semanas</option>
                <option value="medium_term">ultimos 6 meses</option>
                <option value="long_term">todo el tiempo</option>
              </select>
            </div>
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--text-dim)', marginBottom: 6 }}>--nombre (opcional)</div>
              <input
                value={genName}
                onChange={e => setGenName(e.target.value)}
                placeholder="mi playlist auto..."
                style={{ background: 'var(--bg3)', border: '1px solid var(--border)', color: 'var(--text)', fontFamily: 'var(--font-mono)', fontSize: '0.78rem', padding: '7px 12px', borderRadius: 4, width: '100%', outline: 'none' }}
              />
            </div>
            <button className="btn btn-green" onClick={generatePlaylist} disabled={generating}>
              {generating ? 'generando...' : '$ run'}
            </button>
          </div>
        </div>
      </div>

      {loading ? <div className="loading-text">cargando...</div> : (
        <div>
          <div className="section-title">mis_playlists // {playlists.length}</div>
          <div className="playlist-grid">
            {playlists.map(p => (
              <a key={p.id} href={p.external_urls?.spotify} target="_blank" rel="noreferrer" className="playlist-card">
                {p.images?.[0] ? (
                  <img src={p.images[0].url} alt="" />
                ) : (
                  <div style={{ width: '100%', aspectRatio: 1, background: 'var(--bg3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', marginBottom: 10 }}>🎵</div>
                )}
                <div className="name">{p.name}</div>
                <div className="count">{p.tracks?.total} canciones</div>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
