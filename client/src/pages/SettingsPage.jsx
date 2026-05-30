import { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useMutation } from '@tanstack/react-query'
import axiosInstance from '../services/axiosInstance'
import { setCredentials } from '../store/authSlice'
import { setTheme } from '../store/uiSlice'
import LeftSidebar from '../components/LeftSidebar'

export default function SettingsPage() {
  const dispatch = useDispatch()
  const { user, accessToken } = useSelector((s) => s.auth)
  const { theme } = useSelector((s) => s.ui)

  const [form, setForm] = useState({ bio: user?.bio || '', skills: user?.skills?.join(', ') || '', githubUrl: user?.githubUrl || '', portfolioUrl: user?.portfolioUrl || '' })
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  const updateMutation = useMutation({
    mutationFn: (data) => axiosInstance.put('/users/me', data).then((r) => r.data),
    onSuccess: (data) => {
      dispatch(setCredentials({ user: data, accessToken }))
      setSuccess('Profile updated!')
      setTimeout(() => setSuccess(''), 3000)
    },
    onError: (err) => setError(err.response?.data?.message || 'Update failed.'),
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    updateMutation.mutate({ ...form, skills: form.skills.split(',').map((s) => s.trim()).filter(Boolean) })
  }

  const inputStyle = { width: '100%', padding: '10px 14px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text-primary)', fontSize: '0.9rem', outline: 'none' }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)', paddingTop: '56px' }}>
      <LeftSidebar />
      <main style={{ flex: 1, padding: '1.5rem 2rem', maxWidth: '600px' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1.5rem' }}>⚙️ Settings</h1>

        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.5rem', marginBottom: '1rem' }}>
          <h2 style={{ fontWeight: 700, marginBottom: '1.25rem', fontSize: '1rem' }}>Profile</h2>
          {success && <div style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: '8px', padding: '10px 14px', color: '#4ade80', fontSize: '0.875rem', marginBottom: '1rem' }}>{success}</div>}
          {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', padding: '10px 14px', color: '#f87171', fontSize: '0.875rem', marginBottom: '1rem' }}>{error}</div>}
          <form onSubmit={handleSubmit}>
            {[['bio', 'Bio (max 300 chars)', 'textarea'], ['skills', 'Skills (comma-separated)', 'input'], ['githubUrl', 'GitHub URL', 'input'], ['portfolioUrl', 'Portfolio URL', 'input']].map(([key, label, type]) => (
              <div key={key} style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '0.4rem' }}>{label}</label>
                {type === 'textarea'
                  ? <textarea value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} rows={3} style={{ ...inputStyle, resize: 'vertical' }} />
                  : <input type="text" value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} style={inputStyle} />}
              </div>
            ))}
            <button type="submit" disabled={updateMutation.isPending} style={{ padding: '8px 20px', background: 'var(--accent)', borderRadius: '9999px', color: '#fff', fontWeight: 600, border: 'none', cursor: 'pointer' }}>
              {updateMutation.isPending ? 'Saving…' : 'Save changes'}
            </button>
          </form>
        </div>

        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.5rem' }}>
          <h2 style={{ fontWeight: 700, marginBottom: '1rem', fontSize: '1rem' }}>Appearance</h2>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            {['dark', 'light'].map((t) => (
              <button key={t} onClick={() => { dispatch(setTheme(t)); axiosInstance.put('/users/me', { themePreference: t }) }} style={{ padding: '8px 20px', border: `1px solid ${theme === t ? 'var(--accent)' : 'var(--border)'}`, borderRadius: '9999px', background: theme === t ? 'rgba(124,58,237,0.15)' : 'transparent', color: theme === t ? 'var(--accent)' : 'var(--text-muted)', cursor: 'pointer', fontWeight: theme === t ? 600 : 400, textTransform: 'capitalize' }}>
                {t === 'dark' ? '🌙' : '☀️'} {t}
              </button>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
