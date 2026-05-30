import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import axiosInstance from '../services/axiosInstance'
import { setCredentials } from '../store/authSlice'

export default function RegisterPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [loading, setLoading] = useState(false)

  const validate = () => {
    const errs = {}
    if (!form.name.trim()) errs.name = 'Name is required.'
    if (!form.email) errs.email = 'Email is required.'
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Enter a valid email.'
    if (!form.password) errs.password = 'Password is required.'
    else if (form.password.length < 8) errs.password = 'Password must be at least 8 characters.'
    return errs
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setErrors({})
    setServerError('')
    setLoading(true)
    try {
      const { data } = await axiosInstance.post('/auth/register', form)
      localStorage.setItem('refreshToken', data.refreshToken)
      dispatch(setCredentials({ user: data.user, accessToken: data.accessToken }))
      navigate('/feed')
    } catch (err) {
      setServerError(err.response?.data?.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = {
    width: '100%',
    padding: '10px 14px',
    background: 'var(--bg)',
    border: '1px solid var(--border)',
    borderRadius: '8px',
    color: 'var(--text-primary)',
    fontSize: '0.9rem',
    outline: 'none',
    transition: 'border-color 0.2s ease',
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div style={{ width: '100%', maxWidth: '400px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '2rem' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: '32px', height: '32px', background: 'var(--accent)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '1rem' }}>B</div>
            <span style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '1.1rem' }}>BuildersHub</span>
          </div>
          <h1 style={{ color: 'var(--text-primary)', fontSize: '1.25rem', fontWeight: 600, marginTop: '1rem' }}>Create your account</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>Join 3,200+ builders shipping in public</p>
        </div>

        {/* Google OAuth */}
        <a
          href={`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/google`}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', width: '100%', padding: '10px', border: '1px solid var(--border)', borderRadius: '9999px', color: 'var(--text-primary)', fontSize: '0.9rem', textDecoration: 'none', marginBottom: '1.25rem', transition: 'border-color 0.2s ease' }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
          Continue with Google
        </a>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
          <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>or</span>
          <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
        </div>

        {serverError && (
          <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', padding: '10px 14px', color: '#f87171', fontSize: '0.875rem', marginBottom: '1rem' }}>
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '0.4rem' }}>Name</label>
            <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Your name" style={{ ...inputStyle, borderColor: errors.name ? '#f87171' : 'var(--border)' }} />
            {errors.name && <p style={{ color: '#f87171', fontSize: '0.78rem', marginTop: '0.25rem' }}>{errors.name}</p>}
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '0.4rem' }}>Email</label>
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" style={{ ...inputStyle, borderColor: errors.email ? '#f87171' : 'var(--border)' }} />
            {errors.email && <p style={{ color: '#f87171', fontSize: '0.78rem', marginTop: '0.25rem' }}>{errors.email}</p>}
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '0.4rem' }}>Password</label>
            <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Min. 8 characters" style={{ ...inputStyle, borderColor: errors.password ? '#f87171' : 'var(--border)' }} />
            {errors.password && <p style={{ color: '#f87171', fontSize: '0.78rem', marginTop: '0.25rem' }}>{errors.password}</p>}
          </div>

          <button type="submit" disabled={loading} style={{ width: '100%', padding: '10px', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: '9999px', fontWeight: 600, fontSize: '0.9rem', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, transition: 'opacity 0.2s ease' }}>
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '1.25rem' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 500 }}>Sign in</Link>
        </p>
      </div>
    </div>
  )
}
