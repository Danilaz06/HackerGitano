import { useState, useEffect } from 'react'
import { spotifyFetch } from '../lib/spotify'
import { supabase } from '../lib/supabase'

export default function FriendsPage() {
  const [me, setMe] = useState(null)
  const [myTracks, setMyTracks] = useState([])
  const [friends, setFriends] = useState([])
  const [sharing, setSharing] = useState(false)
  const [shared, setShared] = useState(false)
  const [combined, setCombined] = useState([])
  const [tab, setTab] = useState('friends')

  useEffect(() => {
    spotifyFetch('/me').then(setMe)
    spotifyFetch('/me/top/tracks?limit=20&time_range=short_term').then(d => setMyTracks(d?.items || []))
    loadFriends()
  }, [])

  async function loadFriends() {
    const { data } = await supabase.from('spotify_friends').select('*').order('updated_at', { ascending: false })
    setFriends(data || [])
  }

  async function shareMyTaste() {
    if (!me) return
    setSharing(true)
    const tracks = await spotifyFetch('/me/top/tracks?limit=20&time_range=short_term')
    const artists = await spotifyFetch('/me/top/artists?limit=10&time_range=short_term')
    await supabase.from('spotify_friends').upsert({
      spotify_id: me.id,
      display_name: me.display_name,
      avatar_url: me.images?.[0]?.url || null,
      top_tracks: JSON.stringify(tracks?.items?.map(t => ({ id: t.id, name: t.name, artist: t.artists[0]?.name, image: t.album?.images?.[0]?.url })) || []),
      top_artists: JSON.stringify(artists?.items?.map(a => ({ id: a.id, name: a.name, genres: a.genres?.slice(0,3) })) || []),
      updated_at: new Date().toISOString()
    }, { onConflict: 'spotify_id' })
    setShared(true)
    setSharing(false)
    loadFriends()
  }

  function buildCombined() {
    const trackCount = {}
    friends.forEach(f => {
      try {
        const tracks = JSON.parse(f.top_tracks || '[]')
        tracks.forEach((t, i) => {
          if (!trackCount[t.id]) trackCount[t.id] = { ...t, score: 0, fans: [] }
          trackCount[t.id].score += (20 - i)
          trackCount[t.id].fans.push(f.display_name)
        })
      } catch(e) {}
    })
    const sorted = Object.values(trackCount).sort((a,b) => b.score - a.score).slice(0, 20)
    setCombined(sorted)
    setTab('combined')
  }

  async function createGroupPlaylist() {
    if (!me || !combined.length) return
    const { spotifyPost } = await import('../lib/spotify')
    const playlist = await spotifyPost('/users/' + me.id + '/playlists', {
      name: 'HGE // grupo // ' + new Date().toLocaleDateString('es-ES'),
      description: 'Playlist combinada del grupo - HackeadorGitanoEspotifai',
      public: false
    })
    if (playlist?.id) {
      const uris = combined.map(t => 'spotify:track:' + t.id)
      await spotifyPost('/playlists/' + playlist.id + '/tracks', { uris })
      alert('Playlist del grupo creada en tu Spotify!')
    }
  }

  return (
    <div>
      <div className="page-header">
        <h2>amigos</h2>
        <p>// comparte tu gusto musical y mezcla con el de tus amigos</p>
      </div>

      <div className="terminal" style={{ marginBottom: 20 }}>
        <div className="terminal-bar">
          <div className="terminal-dot red" /><div className="terminal-dot yellow" /><div className="terminal-dot green" />
          <span className="terminal-title">share_taste.sh</span>
        </div>
        <div className="terminal-body">
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--text-dim)', marginBottom: 12 }}>
            // comparte tus top canciones para que tus amigos puedan verlas
          </p>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button className="btn btn-green" onClick={shareMyTaste} disabled={sharing}>
              {sharing ? 'compartiendo...' : shared ? '✓ compartido' : '$ compartir mis gustos'}
            </button>
            {friends.length > 1 && (
              <button className="btn btn-outline" onClick={buildCombined}>
                $ mezclar gustos del grupo
              </button>
            )}
          </div>
          {shared && (
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--green)', marginTop: 10 }}>
              ✓ tus datos se han guardado. Dile a tus amigos que entren y hagan lo mismo.
            </p>
          )}
        </div>
      </div>

      <div className="tabs">
        <button className={'tab' + (tab === 'friends' ? ' active' : '')} onClick={() => setTab('friends')}>amigos ({friends.length})</button>
        {combined.length > 0 && (
          <button className={'tab' + (tab === 'combined' ? ' active' : '')} onClick={() => setTab('combined')}>playlist_grupo</button>
        )}
      </div>

      {tab === 'friends' && (
        <div>
          {friends.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', fontFamily: 'var(--font-mono)', color: 'var(--text-dim)' }}>
              // sin amigos todavia. Comparte el enlace de la app!
            </div>
          ) : (
            friends.map(f => {
              let tracks = []
              try { tracks = JSON.parse(f.top_tracks || '[]') } catch(e) {}
              const isMe = f.spotify_id === me?.id
              return (
                <div key={f.spotify_id} className="friend-row" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%' }}>
                    <div className="friend-avatar">
                      {f.avatar_url ? <img src={f.avatar_url} alt="" /> : null}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--green)' }}>
                        {f.display_name} {isMe && <span style={{ color: 'var(--text-dim)' }}>(tu)</span>}
                      </div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--text-dim)', marginTop: 2 }}>
                        actualizado: {new Date(f.updated_at).toLocaleDateString('es-ES')}
                      </div>
                    </div>
                  </div>
                  <div style={{ marginTop: 10, paddingLeft: 0, width: '100%' }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-dim)', marginBottom: 6 }}>TOP TRACKS:</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {tracks.slice(0,5).map(t => (
                        <span key={t.id} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', padding: '3px 8px', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 2, color: 'var(--text)' }}>
                          {t.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      )}

      {tab === 'combined' && combined.length > 0 && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <div className="section-title" style={{ margin: 0 }}>canciones_del_grupo // top {combined.length}</div>
            <button className="btn btn-green" onClick={createGroupPlaylist}>$ crear en spotify</button>
          </div>
          <div className="terminal">
            <div className="terminal-bar">
              <div className="terminal-dot red" /><div className="terminal-dot yellow" /><div className="terminal-dot green" />
              <span className="terminal-title">combined_playlist.json</span>
            </div>
            <div className="terminal-body">
              <div className="track-list">
                {combined.map((t, i) => (
                  <div key={t.id} className="track-row">
                    <span className="track-num">{String(i+1).padStart(2,'0')}</span>
                    {t.image && <img className="track-img" src={t.image} alt="" />}
                    <div className="track-info">
                      <div className="track-name">{t.name}</div>
                      <div className="track-artist">{t.artist} // le gusta a: {t.fans.join(', ')}</div>
                    </div>
                    <div className="track-bar-wrap">
                      <div className="track-bar" style={{ width: Math.max(10, t.score / combined[0].score * 100) + '%' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
