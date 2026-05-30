import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import axiosInstance from '../services/axiosInstance'
import LeftSidebar from '../components/LeftSidebar'
import PostCard from '../components/PostCard'

const TABS = ['projects', 'users', 'posts']
const TAG_COLORS = { AI: '#7c3aed', SaaS: '#2563eb', 'Dev Tools': '#d97706', 'Open Source': '#16a34a' }

export default function SearchPage() {
  const [q, setQ] = useState('')
  const [tab, setTab] = useState('projects')
  const [submitted, setSubmitted] = useState('')

  const { data = [], isLoading } = useQuery({
    queryKey: ['search', submitted, tab],
    queryFn: () => submitted.length >= 2 ? axiosInstance.get(`/search?q=${encodeURIComponent(submitted)}&type=${tab}`).then((r) => r.data) : [],
    enabled: submitted.length >= 2,
  })

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)', paddingTop: '56px' }}>
      <LeftSidebar />
      <main style={{ flex: 1, padding: '1.5rem 2rem', maxWidth: '800px' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1.25rem' }}>🔍 Search</h1>

        <form onSubmit={(e) => { e.preventDefault(); setSubmitted(q) }} style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search projects, builders, posts…" style={{ flex: 1, padding: '10px 16px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '9999px', color: 'var(--text-primary)', fontSize: '0.9rem', outline: 'none' }} />
          <button type="submit" style={{ padding: '10px 20px', background: 'var(--accent)', borderRadius: '9999px', color: '#fff', fontWeight: 600, border: 'none', cursor: 'pointer' }}>Search</button>
        </form>

        <div style={{ display: 'flex', gap: '0', borderBottom: '1px solid var(--border)', marginBottom: '1.25rem' }}>
          {TABS.map((t) => (
            <button key={t} onClick={() => setTab(t)} style={{ padding: '10px 20px', background: 'none', border: 'none', borderBottom: tab === t ? '2px solid var(--accent)' : '2px solid transparent', color: tab === t ? 'var(--text-primary)' : 'var(--text-muted)', fontWeight: tab === t ? 600 : 400, cursor: 'pointer', fontSize: '0.9rem', textTransform: 'capitalize' }}>
              {t}
            </button>
          ))}
        </div>

        {isLoading && <p style={{ color: 'var(--text-muted)' }}>Searching…</p>}

        {!isLoading && submitted && data.length === 0 && <p style={{ color: 'var(--text-muted)' }}>No results for "{submitted}"</p>}

        {tab === 'projects' && data.map((p) => (
          <Link key={p._id} to={`/projects/${p._id}`} style={{ textDecoration: 'none', display: 'block', marginBottom: '0.75rem' }}>
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1rem', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              {p.logo ? <img src={p.logo} alt="" style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover', flexShrink: 0 }} /> : <div style={{ width: '48px', height: '48px', borderRadius: '8px', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, flexShrink: 0 }}>{p.title[0]}</div>}
              <div style={{ flex: 1 }}>
                <h3 style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '2px' }}>{p.title}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '6px' }}>{p.tagline}</p>
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                  {p.tags?.map((t) => <span key={t} style={{ padding: '2px 8px', borderRadius: '9999px', fontSize: '0.75rem', background: `${TAG_COLORS[t] || '#374151'}22`, color: TAG_COLORS[t] || 'var(--text-muted)' }}>{t}</span>)}
                </div>
              </div>
              <span style={{ color: 'var(--accent)', fontWeight: 600, fontSize: '0.9rem' }}>▲ {p.upvotes?.length || 0}</span>
            </div>
          </Link>
        ))}

        {tab === 'users' && data.map((u) => (
          <Link key={u._id} to={`/profile/${u.username}`} style={{ textDecoration: 'none', display: 'block', marginBottom: '0.75rem' }}>
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
              {u.avatar ? <img src={u.avatar} alt="" style={{ width: '48px', height: '48px', borderRadius: '50%' }} /> : <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700 }}>{u.name?.[0]}</div>}
              <div style={{ flex: 1 }}>
                <h3 style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '2px' }}>{u.name}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>@{u.username} · {u.followers?.length || 0} followers</p>
                {u.bio && <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '4px' }}>{u.bio}</p>}
              </div>
            </div>
          </Link>
        ))}

        {tab === 'posts' && data.map((p) => <div key={p._id} style={{ marginBottom: '0.75rem' }}><PostCard post={p} /></div>)}
      </main>
    </div>
  )
}
