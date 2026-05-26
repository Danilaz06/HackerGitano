const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID
const REDIRECT_URI = import.meta.env.VITE_REDIRECT_URI

const SCOPES = [
  'user-top-read',
  'user-read-recently-played',
  'user-read-private',
  'user-read-email',
  'playlist-modify-public',
  'playlist-modify-private',
  'playlist-read-private',
  'user-follow-read',
].join(' ')

function generateCodeVerifier() {
  const array = new Uint8Array(32)
  window.crypto.getRandomValues(array)
  return btoa(String.fromCharCode(...array)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

async function generateCodeChallenge(verifier) {
  const data = new TextEncoder().encode(verifier)
  const digest = await window.crypto.subtle.digest('SHA-256', data)
  return btoa(String.fromCharCode(...new Uint8Array(digest))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

export async function loginWithSpotify() {
  const verifier = generateCodeVerifier()
  const challenge = await generateCodeChallenge(verifier)
  localStorage.setItem('spotify_verifier', verifier)
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    response_type: 'code',
    redirect_uri: REDIRECT_URI,
    scope: SCOPES,
    code_challenge_method: 'S256',
    code_challenge: challenge,
  })
  window.location.href = 'https://accounts.spotify.com/authorize?' + params.toString()
}

export async function exchangeCode(code) {
  const verifier = localStorage.getItem('spotify_verifier')
  const body = new URLSearchParams({
    client_id: CLIENT_ID,
    grant_type: 'authorization_code',
    code,
    redirect_uri: REDIRECT_URI,
    code_verifier: verifier,
  })
  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  })
  const data = await res.json()
  if (data.access_token) {
    localStorage.setItem('spotify_token', data.access_token)
    localStorage.setItem('spotify_refresh', data.refresh_token)
    localStorage.setItem('spotify_expires', Date.now() + data.expires_in * 1000)
    localStorage.removeItem('spotify_verifier')
  }
  return data
}

export async function refreshToken() {
  const refresh = localStorage.getItem('spotify_refresh')
  if (!refresh) return null
  const body = new URLSearchParams({
    client_id: CLIENT_ID,
    grant_type: 'refresh_token',
    refresh_token: refresh,
  })
  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  })
  const data = await res.json()
  if (data.access_token) {
    localStorage.setItem('spotify_token', data.access_token)
    localStorage.setItem('spotify_expires', Date.now() + data.expires_in * 1000)
  }
  return data.access_token
}

export async function getToken() {
  const expires = parseInt(localStorage.getItem('spotify_expires') || '0')
  if (Date.now() > expires - 60000) return await refreshToken()
  return localStorage.getItem('spotify_token')
}

export function isLoggedIn() {
  return !!localStorage.getItem('spotify_token')
}

export function logout() {
  localStorage.removeItem('spotify_token')
  localStorage.removeItem('spotify_refresh')
  localStorage.removeItem('spotify_expires')
}

export async function spotifyFetch(endpoint) {
  const token = await getToken()
  const res = await fetch('https://api.spotify.com/v1' + endpoint, {
    headers: { Authorization: 'Bearer ' + token }
  })
  if (!res.ok) return null
  return res.json()
}

export async function spotifyPost(endpoint, body) {
  const token = await getToken()
  const res = await fetch('https://api.spotify.com/v1' + endpoint, {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  })
  if (!res.ok) return null
  return res.json()
}
