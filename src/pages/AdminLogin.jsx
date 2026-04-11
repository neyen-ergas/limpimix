import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'
import { t } from '../styles'

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [checking, setChecking] = useState(true)
  const navigate = useNavigate()

  // Si ya hay sesión activa, ir directo al panel
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate('/admin/panel', { replace: true })
      else setChecking(false)
    })
  }, [])

  async function handleLogin() {
    if (!email || !password) { setError('Completá los dos campos'); return }
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError('Email o contraseña incorrectos')
      setLoading(false)
    } else {
      navigate('/admin/panel', { replace: true })
    }
  }

  if (checking) return (
    <div style={{ ...t.page, ...t.center }}>
      <p style={{ color: '#94a3b8' }}>Verificando sesión...</p>
    </div>
  )

  return (
    <div style={{ ...t.page, ...t.center, minHeight: '100vh' }}>
      <div style={{
        background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16,
        padding: '40px 36px', width: '100%', maxWidth: 380, textAlign: 'center',
      }}>
        <div style={{ fontSize: 40, marginBottom: 14 }}>🔐</div>
        <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 6 }}>Panel Administrativo</h1>
        <p style={{ fontSize: 14, color: '#64748b', marginBottom: 28 }}>H&amp;L — Gestión de productos</p>

        <div style={{ textAlign: 'left' }}>
          <label style={t.label}>Email</label>
          <input
            style={{ ...t.input, marginBottom: 14 }}
            type="email"
            placeholder="admin@ejemplo.com"
            value={email}
            onChange={e => { setEmail(e.target.value); setError(null) }}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
          />
          <label style={t.label}>Contraseña</label>
          <input
            style={{ ...t.input, marginBottom: error ? 8 : 20 }}
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={e => { setPassword(e.target.value); setError(null) }}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
          />
          {error && <p style={{ color: '#ef4444', fontSize: 13, marginBottom: 14 }}>{error}</p>}
          <button
            style={{ ...t.btnPrimary, width: '100%', padding: '11px', fontSize: 15 }}
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </div>

        <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 24 }}>
          ¿Olvidaste la contraseña? Contactá al desarrollador.
        </p>
      </div>
    </div>
  )
}
