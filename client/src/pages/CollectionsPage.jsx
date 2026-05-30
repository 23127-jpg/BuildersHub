import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import axiosInstance from '../services/axiosInstance'
import LeftSidebar from '../components/LeftSidebar'

export default function CollectionsPage() {
  const { user } = useSelector((s) => s.auth)
  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', visibility: 'public' })

  // Fetch user's own collections via profile
  const { data: profile } = useQuery({
    queryKey: ['profile', user?.username],
    queryFn: () => axiosInstance.get(`/users/${user?.username}`).then((r) => r.data),
    enabled: !!user?.username,
  })

  const createMutation = useMutation({
    mutationFn: () => axiosInstance.post('/collections', form),
    onSuccess: () => {
      setShowForm(false)
      setForm({ name: '', visibility: 'public' })
      queryClient.invalidateQueries(['profile', user?.username])
    },
  })

  const inputStyle = {
    width: '100%', padding: '10px 14px', background: 'var(--bg)',
    border: '1px solid var(--border)', borderRadius: '8px',
    color: 'var(--text-primary)', fontSize: '0.9rem', outline: 'none',
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)', paddingTop: '56px' }}>
      <LeftSidebar />
      <main style={{ flex: 1, padding: '1.5rem 2rem', maxWidth: '700px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>📚 Collections</h1>
          <button onClick={() => setShowForm(!showForm)} style={{ padding: '8px 18px', background: 'var(--accent)', borderRadius: '9999px', color: '#fff', fontWeight: 600, border: 'none', cursor: 'pointer' }}>
            + New collection
          </button>
        </div>

        {/* Create form */}
        {showForm && (
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.25rem', marginBottom: '1.25rem' }}>
            <div style={{ marginBottom: '0.75rem' }}>
              <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '0.4rem' }}>Collection name</label>
              <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Best AI Tools" maxLength={50} style={inputStyle} />
            </div>
            <div style={{ marginBottom: '0.75rem' }}>
              <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '0.4rem' }}>Visibility</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {['public', 'private'].map((v) => (
                  <button key={v} type="button" onClick={() => setForm({ ...form, visibility: v })} style={{ padding: '5px 16px', borderRadius: '9999px', border: `1px solid ${form.visibility === v ? 'var(--accent)' : 'var(--border)'}`, background: form.visibility === v ? 'rgba(124,58,237,0.15)' : 'transparent', color: form.visibility === v ? 'var(--accent)' : 'var(--text-muted)', cursor: 'pointer', fontSize: '0.85rem', textTransform: 'capitalize' }}>
                    {v === 'public' ? '🌐' : '🔒'} {v}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button onClick={() => form.name.trim() && createMutation.mutate()} disabled={!form.name.trim() || createMutation.isPending} style={{ padding: '8px 20px', background: 'var(--accent)', borderRadius: '9999px', color: '#fff', fontWeight: 600, border: 'none', cursor: 'pointer', opacity: !form.name.trim() ? 0.6 : 1 }}>
                {createMutation.isPending ? 'Creating…' : 'Create'}
              </button>
              <button onClick={() => setShowForm(false)} style={{ padding: '8px 20px', border: '1px solid var(--border)', borderRadius: '9999px', background: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>Cancel</button>
            </div>
          </div>
        )}

        {/* Collections list */}
        {(profile?.collections || []).length === 0 && (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
            <p style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📚</p>
            <p>No collections yet. Create one to curate your favourite projects.</p>
          </div>
        )}

        {(profile?.collections || []).map((c) => (
          <Link key={c._id} to={`/collections/${c._id}`} style={{ textDecoration: 'none', display: 'block', marginBottom: '0.75rem' }}>
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'rgba(124,58,237,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', flexShrink: 0 }}>
                {c.visibility === 'private' ? '🔒' : '📚'}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '2px' }}>{c.name}</div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                  {c.projects?.length || 0} projects · {c.followers?.length || 0} followers · {c.visibility}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </main>
    </div>
  )
}
