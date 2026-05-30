import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSelector } from 'react-redux'
import axiosInstance from '../services/axiosInstance'
import LeftSidebar from '../components/LeftSidebar'
import { PostSkeleton } from '../components/SkeletonLoader'

const FLAIRS = ['Feedback Needed', 'Show Off', 'Question', 'Resource']
const FLAIR_COLORS = { 'Feedback Needed': '#f59e0b', 'Show Off': '#7c3aed', 'Question': '#3b82f6', 'Resource': '#22c55e' }

function DiscussionCard({ d, onVote }) {
  const { isAuthenticated } = useSelector((s) => s.auth)
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.25rem', marginBottom: '0.75rem' }}>
      <div style={{ display: 'flex', gap: '1rem' }}>
        {/* Vote column */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', minWidth: '40px' }}>
          <button onClick={() => isAuthenticated && onVote(d._id, 'up')} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1rem', padding: '2px' }}>▲</button>
          <span style={{ fontWeight: 700, color: d.voteScore > 0 ? 'var(--accent)' : d.voteScore < 0 ? '#f87171' : 'var(--text-muted)', fontSize: '0.9rem' }}>{d.voteScore}</span>
          <button onClick={() => isAuthenticated && onVote(d._id, 'down')} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1rem', padding: '2px' }}>▼</button>
        </div>
        {/* Content */}
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
            <span style={{ padding: '2px 10px', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600, background: `${FLAIR_COLORS[d.flair] || '#374151'}22`, color: FLAIR_COLORS[d.flair] || 'var(--text-muted)', border: `1px solid ${FLAIR_COLORS[d.flair] || '#374151'}44` }}>{d.flair}</span>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>by {d.author?.username} · {new Date(d.createdAt).toLocaleDateString()}</span>
          </div>
          <h3 style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem', fontSize: '1rem' }}>{d.title}</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{d.body}</p>
          <div style={{ marginTop: '0.75rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>💬 {d.commentsCount || 0} comments</div>
        </div>
      </div>
    </div>
  )
}

export default function DiscussionsPage() {
  const { isAuthenticated } = useSelector((s) => s.auth)
  const queryClient = useQueryClient()
  const [activeFlair, setActiveFlair] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', body: '', flair: 'Question' })

  const { data: discussions = [], isLoading } = useQuery({
    queryKey: ['discussions', activeFlair],
    queryFn: () => axiosInstance.get(`/discussions${activeFlair ? `?flair=${encodeURIComponent(activeFlair)}` : ''}`).then((r) => r.data),
  })

  const createMutation = useMutation({
    mutationFn: () => axiosInstance.post('/discussions', form),
    onSuccess: () => { setShowForm(false); setForm({ title: '', body: '', flair: 'Question' }); queryClient.invalidateQueries(['discussions']) },
  })

  const voteMutation = useMutation({
    mutationFn: ({ id, direction }) => axiosInstance.post(`/discussions/${id}/vote`, { direction }),
    onSuccess: () => queryClient.invalidateQueries(['discussions', activeFlair]),
  })

  const inputStyle = { width: '100%', padding: '10px 14px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text-primary)', fontSize: '0.9rem', outline: 'none' }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)', paddingTop: '56px' }}>
      <LeftSidebar />
      <main style={{ flex: 1, padding: '1.5rem 2rem', maxWidth: '800px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>💬 Discussions</h1>
          {isAuthenticated && <button onClick={() => setShowForm(!showForm)} style={{ padding: '8px 18px', background: 'var(--accent)', borderRadius: '9999px', color: '#fff', fontWeight: 600, border: 'none', cursor: 'pointer' }}>+ New discussion</button>}
        </div>

        {/* Create form */}
        {showForm && (
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.25rem', marginBottom: '1.25rem' }}>
            <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Discussion title" maxLength={200} style={{ ...inputStyle, marginBottom: '0.75rem' }} />
            <textarea value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} placeholder="What's on your mind?" rows={4} style={{ ...inputStyle, resize: 'vertical', marginBottom: '0.75rem' }} />
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
              {FLAIRS.map((f) => (
                <button key={f} type="button" onClick={() => setForm({ ...form, flair: f })} style={{ padding: '4px 12px', borderRadius: '9999px', border: `1px solid ${form.flair === f ? (FLAIR_COLORS[f] || 'var(--accent)') : 'var(--border)'}`, background: form.flair === f ? `${FLAIR_COLORS[f] || '#7c3aed'}22` : 'transparent', color: form.flair === f ? (FLAIR_COLORS[f] || 'var(--accent)') : 'var(--text-muted)', fontSize: '0.82rem', cursor: 'pointer' }}>{f}</button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button onClick={() => createMutation.mutate()} disabled={!form.title.trim() || !form.body.trim() || createMutation.isPending} style={{ padding: '8px 20px', background: 'var(--accent)', borderRadius: '9999px', color: '#fff', fontWeight: 600, border: 'none', cursor: 'pointer', opacity: !form.title.trim() || !form.body.trim() ? 0.6 : 1 }}>Post</button>
              <button onClick={() => setShowForm(false)} style={{ padding: '8px 20px', border: '1px solid var(--border)', borderRadius: '9999px', background: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>Cancel</button>
            </div>
          </div>
        )}

        {/* Flair filters */}
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
          <button onClick={() => setActiveFlair('')} style={{ padding: '5px 14px', borderRadius: '9999px', border: `1px solid ${!activeFlair ? 'var(--accent)' : 'var(--border)'}`, background: !activeFlair ? 'rgba(124,58,237,0.15)' : 'transparent', color: !activeFlair ? 'var(--accent)' : 'var(--text-muted)', fontSize: '0.85rem', cursor: 'pointer' }}>All</button>
          {FLAIRS.map((f) => (
            <button key={f} onClick={() => setActiveFlair(f === activeFlair ? '' : f)} style={{ padding: '5px 14px', borderRadius: '9999px', border: `1px solid ${activeFlair === f ? (FLAIR_COLORS[f] || 'var(--accent)') : 'var(--border)'}`, background: activeFlair === f ? `${FLAIR_COLORS[f] || '#7c3aed'}22` : 'transparent', color: activeFlair === f ? (FLAIR_COLORS[f] || 'var(--accent)') : 'var(--text-muted)', fontSize: '0.85rem', cursor: 'pointer' }}>{f}</button>
          ))}
        </div>

        {isLoading ? Array.from({ length: 4 }).map((_, i) => <PostSkeleton key={i} />) : discussions.map((d) => <DiscussionCard key={d._id} d={d} onVote={(id, dir) => voteMutation.mutate({ id, direction: dir })} />)}

        {!isLoading && discussions.length === 0 && <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '3rem' }}>No discussions yet. Start one!</p>}
      </main>
    </div>
  )
}
