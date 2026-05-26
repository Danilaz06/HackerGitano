import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { exchangeCode } from '../lib/spotify'

export default function CallbackPage() {
  const navigate = useNavigate()
  const [status, setStatus] = useState('Conectando con Spotify...')

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const code = params.get('code')
    const error = params.get('error')
    if (error) { setStatus('Error: ' + error); return }
    if (!code) { navigate('/login'); return }
    exchangeCode(code).then(data => {
      if (data.access_token) navigate('/dashboard')
      else setStatus('Error al obtener token')
    })
  }, [])

  return (
    <div className="loading-page">
      <div className="loading-text">{status}</div>
    </div>
  )
}
